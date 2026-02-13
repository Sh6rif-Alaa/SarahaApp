import successResponse from "../../common/utils/response.success.js"
import * as db_services from "../../DB/db.service.js"
import followerModel from "../../DB/models/follower.model.js"
import userModel from "../../DB/models/user.model.js"

export const addFollow = async (req, res, next) => {
    const { following_id } = req.body

    if (!following_id) throw new Error("following_id is required", { cause: 400 })

    const user = await db_services.findById({ model: userModel, id: following_id })

    if (!user) throw new Error("following user not found", { cause: 404 })

    if (following_id === req.user._id.toString()) throw new Error("you can't follow yourself", { cause: 400 })

    const follower = await db_services.create({ model: followerModel, data: { following_id, follower_id: req.user._id } })

    successResponse({ res, status: 201, message: "created", data: follower })
}

export const unFollow = async (req, res, next) => {
    const { following_id } = req.body

    if (!following_id) throw new Error("following_id is required", { cause: 400 })

    const user = await db_services.findById({ model: userModel, id: following_id })

    if (!user) throw new Error("following user not found", { cause: 404 })

    const follower = await db_services.deleteOne({ model: followerModel, filter: { following_id, follower_id: req.user._id } })

    if (!follower.deletedCount) throw new Error("follow relation not found", { cause: 404 })

    successResponse({ res, message: "unfollowed successfully" })
}