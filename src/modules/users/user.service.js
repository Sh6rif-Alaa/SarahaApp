import { providerEnum } from "../../common/enum/user.enum.js"
import successResponse from "../../common/utils/response.success.js"
import { encrypt } from "../../common/utils/security/encrypt.security.js"
import { Compare, Hash } from "../../common/utils/security/hash.security.js"
import * as db_services from "../../DB/db.service.js"
import userModel from "../../DB/models/user.model.js"
import { v4 as uuidv4 } from 'uuid'
import followerModel from "../../DB/models/follower.model.js"
import { generateToken } from "../../common/utils/token.service.js"
import { OAuth2Client } from 'google-auth-library'
import { env } from "../../../config/config.service.js"

export const signUp = async (req, res, next) => {
    const { userName, email, phone, age, gender, password, cPassword } = req.body

    if (await db_services.findOne({ filter: { email }, model: userModel }))
        throw new Error('email already exist', { cause: 404 })

    const user = await db_services.create({ model: userModel, data: { userName, email, phone: encrypt({ text: phone }), age, gender, password: Hash({ plainText: password, salt: env.SALT_ROUNDS }) } })

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
            data: { email, confirmed: email_verified, userName: name, profilePicture: picture, provider: providerEnum.google }
        })
    }

    // login
    if (user.provider === providerEnum.system)
        throw new Error('please log in system only', { cause: 400 })

    const token = generateToken({
        payload: { id: user._id },
        secret_key: env.TOKEN_KEY,
        options: {
            expiresIn: "1h",
            jwtid: uuidv4()
        }
    })

    successResponse({ res, status: 201, message: "created", token })
}

export const signIn = async (req, res, next) => {
    const { email, password } = req.body

    const user = await db_services.findOne({ filter: { email, provider: providerEnum.system }, model: userModel })

    if (!user)
        throw new Error('user not exist', { cause: 404 })

    if (!Compare({ plainText: password, hash: user.password }))
        throw new Error('invalid password', { cause: 400 })

    const token = generateToken({
        payload: { id: user._id },
        secret_key: env.TOKEN_KEY,
        options: {
            expiresIn: "1h",
            jwtid: uuidv4()
        }
    })

    successResponse({ res, token })
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
            ...req.user,
            followerCount: counts[0].followers[0]?.count || 0,
            followingCount: counts[0].following[0]?.count || 0
        }
    })
}