import cors from 'cors'
import checkConnection from './DB/connection.js'
import express from 'express'
import userRouter from './modules/users/user.controller.js'
import messageRouter from './modules/messages/message.service.js'
import successResponse from './common/utils/response.success.js'
import followerRouter from './modules/followers/follower.controller.js'
import { env } from '../config/config.service.js'
import cloudinary from './common/utils/cloudinary.js'
import fs from "node:fs"

const app = express()

const bootstrap = () => {
    app.use(cors(), express.json())
    checkConnection()

    app.get('/', (req, res) => successResponse({ res, message: 'Welcome on Saraha App' }))

    app.use('/uploads', express.static("uploads"))
    app.use('/users', userRouter)
    app.use('/messages', messageRouter)
    app.use('/followers', followerRouter)

    app.use((req, res) => { throw new Error(`Url ${req.originalUrl} not found`, { cause: 404 }) })

    // global error handling express v5 support it without making asyncHandler
    // catch throw Error
    app.use(async (err, req, res, next) => {
        console.log(err.stack)
        // // remove local file if there is any error
        // if (err && req.file?.path) fs.unlinkSync(req.file.path)

        // remove host file if there is any error
        if (err && req.file?.public_id) await cloudinary.uploader.destroy(req.file.public_id)
        res.status(err.cause || 500).json({ message: err.message, stack: err.stack })
    })

    app.listen(env.PORT, () => console.log(`app running on port ${env.PORT}!`))
}

export default bootstrap