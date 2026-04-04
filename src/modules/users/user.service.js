import { providerEnum } from "../../common/enum/user.enum.js"
import successResponse from "../../common/utils/response.success.js"
import { decrypt, encrypt } from "../../common/utils/security/encrypt.security.js"
import { Compare, Hash } from "../../common/utils/security/hash.security.js"
import * as db_services from "../../DB/db.service.js"
import userModel from "../../DB/models/user.model.js"
import { v4 as uuidv4 } from 'uuid'
import followerModel from "../../DB/models/follower.model.js"
import { generateToken, verifyToken } from "../../common/utils/token.service.js"
import { OAuth2Client } from 'google-auth-library'
import { env } from "../../../config/config.service.js"
import cloudinary from "../../common/utils/cloudinary.js"
import { randomUUID } from 'node:crypto'
import revokeTokenModel from "../../DB/models/revokeToken.model.js"
import { del, get_profile_key, get_revoke_key, getValue, keys, revoke_key, setValue, otp_key, blocked_otp_key, max_otp_key, ttl, incr, expire } from "../../DB/redis/redis.service.js"
import { generateOTP, sendEmail } from './../../common/utils/email/send.email.js';
import { eventEmitter } from "../../common/utils/email/email.events.js"
import { emailEnum } from "../../common/enum/email.enum.js"
import { emailTemplate } from "../../common/utils/email/email.template.js"

const sendEmailOtp = async ({ email, userName, subject } = {}) => {
    const isBlocked = await ttl(blocked_otp_key({ email, subject }))
    if (isBlocked > 0)
        throw new Error(`you are blocked, please try again after ${isBlocked} seconds`, { cause: 400 })

    const otpTtl = await ttl(otp_key({ email, subject }))
    if (otpTtl > 0)
        throw new Error("you already have an active otp, please wait until it expires", { cause: 400 })

    const otpTrials = Number(await getValue(max_otp_key({ email, subject }))) || 0
    
    if (otpTrials >= 3) {
        await setValue({ key: blocked_otp_key({ email, subject }), value: 1, ttl: 60 * 15 })
        throw new Error("you exceeded maximum number of otp requests", { cause: 400 })
    }

    const OTP = await generateOTP()

    await setValue({
        key: otp_key({ email, subject }),
        value: Hash({ plainText: `${OTP}` }),
        ttl: 60 * 5
    })

    await incr(max_otp_key({ email, subject }))

    if (otpTrials === 0)
        await expire({ key: max_otp_key({ email, subject }), ttl: 60 * 15 })

    eventEmitter.emit("confirmEmail", async () => {
        await sendEmail({
            to: email,
            subject:
                subject === emailEnum.forgetPassword
                    ? "Reset Your Password - SarahaApp"
                    : "Verify Your Email - SarahaApp",

            html: emailTemplate({
                userName,
                otp: OTP,
                type: subject
            })
        })
    })
}

export const signUp = async (req, res, next) => {
    const { userName, email, phone, age, gender, password } = req.body

    if (await db_services.findOne({ filter: { email }, model: userModel })) 
        throw new Error("email already exist", { cause: 409 })
    

    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
        folder: "sarahaApp/users",
        resource_type: "image"
    })

    // to desroty file on global error handling
    req.file.public_id = public_id

    const user = await db_services.create({
        model: userModel,
        data: {
            userName,
            email,
            age,
            gender,
            provider: providerEnum.system,
            phone: encrypt({ text: phone }),
            password: Hash({ plainText: password, salt: env.SALT_ROUNDS }),
            profilePicture: { secure_url, public_id },
        }
    })

    await sendEmailOtp({ email, userName })

    successResponse({
        res,
        status: 201,
        message: "created successfully, otp sent to email",
        data: user
    })
}

export const signUpWithGmail = async (req, res, next) => {
    const { idToken } = req.body

    const client = new OAuth2Client();

    const ticket = await client.verifyIdToken({
        idToken,
        audience: env.CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const { email, email_verified, name, picture } = payload

    let user = await db_services.findOne({ filter: { email }, model: userModel })

    if (!user) {
        user = await db_services.create({
            model: userModel,
            data: { email, confirmed: email_verified, userName: name, profilePicture: { secure_url: picture }, provider: providerEnum.google }
        })
    }

    // login
    if (user.provider === providerEnum.system)
        throw new Error('please log in system only', { cause: 400 })

    const uuid = randomUUID()

    const accessToken = generateToken({
        payload: { id: user._id },
        secret_key: env.TOKEN_KEY,
        options: {
            expiresIn: "3m",
            jwtid: uuid
        }
    })

    const refreshToken = generateToken({
        payload: { id: user._id },
        secret_key: env.REFRESH_TOKEN_KEY,
        options: {
            expiresIn: "1y",
            jwtid: uuid
        }
    })

    successResponse({ res, status: 201, message: "created", token: { accessToken, refreshToken } })
}

export const signIn = async (req, res, next) => {
    const { email, password } = req.body

    const user = await db_services.findOne({ filter: { email, confirmed: { $exists: true }, provider: providerEnum.system }, model: userModel })

    if (!user)
        throw new Error('user not exist or not confirmed (check your email)', { cause: 404 })

    if (!Compare({ plainText: password, hash: user.password }))
        throw new Error('invalid password', { cause: 400 })

    const uuid = randomUUID()

    const accessToken = generateToken({
        payload: { id: user._id },
        secret_key: env.TOKEN_KEY,
        options: {
            expiresIn: "3m",
            jwtid: uuid
        }
    })

    const refreshToken = generateToken({
        payload: { id: user._id },
        secret_key: env.REFRESH_TOKEN_KEY,
        options: {
            expiresIn: "1y",
            jwtid: uuid
        }
    })

    successResponse({ res, token: { accessToken, refreshToken } })
}

export const refreshToken = async (req, res, next) => {
    const accessToken = generateToken({
        payload: { id: req.user._id },
        secret_key: env.TOKEN_KEY,
        options: {
            expiresIn: "3m",
            jwtid: randomUUID()
        }
    })

    successResponse({ res, token: accessToken })
}

export const getProfile = async (req, res, next) => {
    const user = await getValue(get_profile_key(req.user._id))
    if (user) return successResponse({ res, data: user })

    // one query with aggregate.facet to get followers & following counts
    const counts = await db_services.aggregate({
        model: followerModel,
        pipeline: [
            {
                $facet: {
                    followers: [
                        { $match: { following_id: req.user._id } },
                        { $count: "count" }
                    ],
                    following: [
                        { $match: { follower_id: req.user._id } },
                        { $count: "count" }
                    ]
                }
            }
        ]
    })

    await setValue({
        key: get_profile_key(req.user._id),
        value: {
            ...req.user._doc,
            followerCount: counts[0].followers[0]?.count || 0,
            followingCount: counts[0].following[0]?.count || 0
        },
        ttl: 60 * 3
    })

    successResponse({
        res, data: {
            ...req.user._doc,
            followerCount: counts[0].followers[0]?.count || 0,
            followingCount: counts[0].following[0]?.count || 0
        }
    })
}

export const shareProfile = async (req, res, next) => {
    const { id } = req.params

    const user = await db_services.findOneAndUpdate({
        model: userModel,
        filter: { _id: id },
        update: { $inc: { profileViews: 1 } },
        options: { new: true, runValidators: true },
        select: "-password"
    })

    if (!user) throw new Error('user not exist', { cause: 404 })

    user.phone = decrypt({ cipherText: user.phone })

    // one query with aggregate.facet to get followers & following counts
    const counts = await db_services.aggregate({
        model: followerModel,
        pipeline: [
            {
                $facet: {
                    followers: [
                        { $match: { following_id: user._id } },
                        { $count: "count" }
                    ],
                    following: [
                        { $match: { follower_id: user._id } },
                        { $count: "count" }
                    ]
                }
            }
        ]
    })

    successResponse({
        res, data: {
            ...user._doc,
            followerCount: counts[0].followers[0]?.count || 0,
            followingCount: counts[0].following[0]?.count || 0
        }
    })
}

export const updateProfile = async (req, res, next) => {
    let { firstName, lastName, gender, phone, age } = req.body

    if (phone) phone = encrypt({ text: phone })

    const user = await db_services.findOneAndUpdate({
        model: userModel,
        filter: { _id: req.user._id },
        update: { firstName, lastName, gender, phone, age },
        options: { new: true, runValidators: true },
        select: "-password"
    })

    await del(get_profile_key(req.user._id))

    successResponse({
        res, data: user
    })
}

export const updatePassowrd = async (req, res, next) => {
    const { oldPassword, newPassword } = req.body

    if (!Compare({ plainText: oldPassword, hash: req.user.password }))
        throw new Error('invalid old password', { cause: 400 })

    req.user.password = Hash({ plainText: newPassword, salt: env.SALT_ROUNDS })
    req.user.changeCredential = new Date()

    await req.user.save()

    successResponse({
        res, data: req.user
    })
}

export const logout = async (req, res, next) => {
    const { flag } = req.query

    if (flag === 'all') {
        req.user.changeCredential = new Date()
        await req.user.save()

        await del(await keys(get_revoke_key(req.user._id)))
    } else {
        await setValue({
            key: revoke_key({ userId: req.user._id, jti: req.decode.jti }),
            value: `${req.decode.jti}`,
            ttl: req.decode.exp - Math.floor(Date.now() / 1000)
        })
    }

    successResponse({ res })
}

export const verifyEmail = async (req, res, next) => {
    const { email, otp } = req.body

    const otpDb = await getValue(
        otp_key({ email, subject: emailEnum.confirmEmail })
    )

    if (!otpDb) {
        throw new Error("otp expired or not found", { cause: 400 })
    }

    if (!Compare({ plainText: otp, hash: otpDb })) {
        throw new Error("otp not match", { cause: 400 })
    }

    const user = await db_services.findOneAndUpdate({
        model: userModel,
        filter: { email },
        update: { confirmed: true },
        options: { new: true }
    })

    if (!user) {
        throw new Error("user not exist", { cause: 404 })
    }

    await del(otp_key(email))
    await del(max_otp_key(email))
    await del(blocked_otp_key(email))

    successResponse({ res, message: "email verified successfully" })
}

export const reSendOtp = async (req, res, next) => {
    const { email } = req.body

    const user = await db_services.findOne({
        model: userModel,
        filter: { email, confirmed: { $exists: false }, provider: providerEnum.system }
    })

    if (!user)
        throw new Error("user not exist", { cause: 404 })


    await sendEmailOtp({ email, userName: user.userName })


    successResponse({ res, message: "otp sent successfully" })
}

export const forgetPassword = async (req, res, next) => {
    const { email } = req.body

    const user = await db_services.findOne({
        model: userModel,
        filter: { email, confirmed: { $exists: true }, provider: providerEnum.system }
    })

    if (!user) throw new Error("invalid email or account not found", { cause: 404 })

    await sendEmailOtp({
        email,
        userName: user.userName,
        subject: emailEnum.forgetPassword
    })

    successResponse({ res, message: "done" })
}

export const resetPassword = async (req, res, next) => {
    const { email, otp, password } = req.body

    const otpValue = await getValue(otp_key({ email, subject: emailEnum.forgetPassword }))

    if (!otpValue) throw new Error("otp expire")

    if (!Compare({ plainText: otp, hash: otpValue })) 
        throw new Error("invalid otp")

    const user = await db_services.findOneAndUpdate({
        model: userModel,
        filter: { email, confirmed: { $exists: true }, provider: providerEnum.system },
        update: {
            password: Hash({ plainText: password }),
            changeCredential: new Date()
        }
    })

    if (!user) throw new Error("user not exist or already confirmed")

    await del(otp_key({ email, subject: emailEnum.forgetPassword }))

    successResponse({ res })
}