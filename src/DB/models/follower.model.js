import mongoose, { Types } from "mongoose";

const followerSchema = new mongoose.Schema(
    {
        follower_id: {
            type: Types.ObjectId,
            required: true,
            ref: 'user'
        },
        following_id: {
            type: Types.ObjectId,
            required: true,
            ref: 'user'
        },
    },
    {
        timestamps: true,
        strictQuery: true
    }
)

followerSchema.index(
    { follower_id: 1, following_id: 1 },
    { unique: true }
)

followerSchema.index({ follower_id: 1 })
followerSchema.index({ following_id: 1 })

const followerModel = mongoose.models.follower || mongoose.model('follower', followerSchema)
followerModel.syncIndexes()
export default followerModel