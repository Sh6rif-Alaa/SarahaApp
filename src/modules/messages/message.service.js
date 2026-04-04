import cloudinary from "../../common/utils/cloudinary.js"
import successResponse from "../../common/utils/response.success.js"
import * as db_services from "../../DB/db.service.js"
import messageModel from "../../DB/models/message.model.js"
import userModel from "../../DB/models/user.model.js"

export const sendMessage = async (req, res, next) => {
    const { content, userId } = req.body

    const user = await db_services.findById({ model: userModel, id: userId })

    if (!user) throw new Error("user not exist", { cause: 404 })

    let attachments = []

    if (req.files && req.files.length) {
        const uploadPromises = req.files.map(file =>
            cloudinary.uploader.upload(file.path, {
                folder: `sarahaApp/messages/${user._id}`,
                resource_type: "image"
            })
        );

        attachments = await Promise.all(uploadPromises);

        attachments.forEach((upload, index) => {
            req.files[index].public_id = upload.public_id
        })
    }

    const message = await db_services.create({
        model: messageModel,
        data: {
            content,
            userId: user._id,
            attachments: attachments.map(file => ({
                secure_url: file.secure_url,
                public_id: file.public_id
            }))
        }
    })

    successResponse({
        res,
        status: 201,
        message: "message created successfully",
        data: message
    })
}

export const getMessage = async (req, res, next) => {
    const { messageId } = req.params

    const message = await db_services.findOne({
        model: messageModel,
        filter: { _id: messageId, userId: req.user._id }
    })

    if (!message) throw new Error("message not exist or not auth", { cause: 404 })

    successResponse({
        res,
        message: "done",
        data: message
    })
}

export const getMessages = async (req, res, next) => {

    const messages = await db_services.find({
        model: messageModel,
        filter: { userId: req.user._id }
    })

    successResponse({
        res,
        message: "done",
        data: messages
    })
}