import { providerEnum } from "../../common/enum/user.enum.js"
import successResponse from "../../common/utils/response.success.js"
import { encrypt } from "../../common/utils/security/encrypt.security.js"
import { Compare, Hash } from "../../common/utils/security/hash.security.js"
import * as db_services from "../../DB/db.service.js"
import userModel from "../../DB/models/user.model.js"
import jwt from "jsonwebtoken"
import { v4 as uuidv4 } from 'uuid'
import followerModel from "../../DB/models/follower.model.js"

export const signUp = async (req, res, next) => {
    const { userName, email, phone, age, gender, password, cPassword } = req.body

    if (password !== cPassword)
        throw new Error('password not match confirm password', { cause: 400 })

    if (await db_services.findOne({ filter: { email }, model: userModel }))
        throw new Error('email already exist', { cause: 404 })

    const user = await db_services.create({ model: userModel, data: { userName, email, phone: encrypt({ text: phone }), age, gender, password: Hash({ plainText: password }) } })

    successResponse({ res, status: 201, message: "created", data: user })
}

export const signIn = async (req, res, next) => {
    const { email, password } = req.body

    const user = await db_services.findOne({ filter: { email, provider: providerEnum.system }, model: userModel })

    if (!user)
        throw new Error('user not exist', { cause: 404 })

    if (!Compare({ plainText: password, hash: user.password }))
        throw new Error('invalid password', { cause: 400 })

    const token = jwt.sign({ id: user._id }, process.env.TOKEN_KEY, {
        expiresIn: "1h",
        jwtid: uuidv4()
    })

    successResponse({ res, token })
}

export const getProfile = async (req, res, next) => {
    // one query with aggregate.facet to get followers & following counts
    const counts = await followerModel.aggregate([
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
    ])

    successResponse({
        res, data: {
            ...req.user,
            followerCount: counts[0].followers[0]?.count || 0,
            followingCount: counts[0].following[0]?.count || 0
        }
    })
}