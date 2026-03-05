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

export const signUp = async (req, res, next) => {
    const { userName, email, phone, age, gender, password } = req.body

    if (await db_services.findOne({ filter: { email }, model: userModel }))
        throw new Error('email already exist', { cause: 404 })

    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
        folder: "sarahaApp/users",
        resource_type: 'image'
    })

    const user = await db_services.create({
        model: userModel,
        data: {
            userName, email, age, gender,
            phone: encrypt({ text: phone }),
            password: Hash({ plainText: password, salt: env.SALT_ROUNDS }),
            profilePicture: { secure_url, public_id },
        }
    })

    successResponse({ res, status: 201, message: "created", data: user })
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

    const accessToken = generateToken({
        payload: { id: user._id },
        secret_key: env.TOKEN_KEY,
        options: {
            expiresIn: "5m",
            jwtid: uuidv4()
        }
    })

    const refreshToken = generateToken({
        payload: { id: user._id },
        secret_key: env.REFRESH_TOKEN_KEY,
        options: {
            expiresIn: "1y",
            jwtid: uuidv4()
        }
    })

    successResponse({ res, status: 201, message: "created", token: { accessToken, refreshToken } })
}

export const signIn = async (req, res, next) => {
    const { email, password } = req.body

    const user = await db_services.findOne({ filter: { email, provider: providerEnum.system }, model: userModel })

    if (!user)
        throw new Error('user not exist', { cause: 404 })

    if (!Compare({ plainText: password, hash: user.password }))
        throw new Error('invalid password', { cause: 400 })

    const accessToken = generateToken({
        payload: { id: user._id },
        secret_key: env.TOKEN_KEY,
        options: {
            expiresIn: "5m",
            jwtid: uuidv4()
        }
    })

    const refreshToken = generateToken({
        payload: { id: user._id },
        secret_key: env.REFRESH_TOKEN_KEY,
        options: {
            expiresIn: "1y",
            jwtid: uuidv4()
        }
    })

    successResponse({ res, token: { accessToken, refreshToken } })
}

export const refreshToken = async (req, res, next) => {
    const accessToken = generateToken({
        payload: { id: req.user._id },
        secret_key: env.TOKEN_KEY,
        options: {
            expiresIn: "5m",
            jwtid: uuidv4()
        }
    })

    successResponse({ res, token: accessToken })
}

export const getProfile = async (req, res, next) => {
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
    console.log(req.body)

    if (phone) phone = encrypt({ text: phone })

    const user = await db_services.findOneAndUpdate({
        model: userModel,
        filter: { _id: req.user._id },
        update: { firstName, lastName, gender, phone, age },
        options: { new: true, runValidators: true },
        select: "-password"
    })

    successResponse({
        res, data: user
    })
}

export const updatePassowrd = async (req, res, next) => {
    const { oldPassword, newPassword } = req.body

    if (!Compare({ plainText: oldPassword, hash: req.user.password }))
        throw new Error('invalid old password', { cause: 400 })

    req.user.password = Hash({ plainText: newPassword, salt: env.SALT_ROUNDS })

    await req.user.save()

    successResponse({
        res, data: req.user
    })
}