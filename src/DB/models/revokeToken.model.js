import mongoose, { Types } from "mongoose";

const revokeTokenSchema = new mongoose.Schema(
    {
        tokenId: {
            type: String,
            required: true,
        },
        userId: {
            type: Types.ObjectId,
            required: true,
            ref: 'user'
        },
        expiredAt: {
            type: Date,
            required: true,
        }
    },
    {
        timestamps: true,
        strictQuery: true,
    }
)

revokeTokenSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 })

const revokeTokenModel = mongoose.models.revokeToken || mongoose.model('revokeToken', revokeTokenSchema)
revokeTokenModel.syncIndexes()
export default revokeTokenModel