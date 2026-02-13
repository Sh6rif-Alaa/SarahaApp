import mongoose, { Types } from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
            minLength: [1, 'too short'],
            maxLength: [999, 'too long'],
            trim: true,
        },
        userId: {
            type: Types.ObjectId,
            required: true,
            ref: 'user'
        },
    },
    {
        timestamps: true,
        strictQuery: true,
    }
)

const messageModel = mongoose.models.message || mongoose.model('message', messageSchema)
messageModel.syncIndexes()
export default messageModel