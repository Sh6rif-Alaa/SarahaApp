import checkConnection from './DB/connection.js'
import express from 'express'
import userRouter from './modules/users/user.controller.js'
import messageRouter from './modules/messages/message.service.js'
import successResponse from './common/utils/response.success.js'
import followerRouter from './modules/followers/follower.controller.js'
import 'dotenv/config'

const app = express()

const bootstrap = () => {
    app.use(express.json())
    checkConnection()

    app.get('/', (req, res) => successResponse({ res, message: 'Welcome on Saraha App' }))

    app.use('/users', userRouter)
    app.use('/messages', messageRouter)
    app.use('/followers', followerRouter)

    app.use((req, res) => { throw new Error(`Url ${req.originalUrl} not found`, { cause: 404 }) })

    // global error handling express v5 support it without making asyncHandler
    // catch throw Error
    app.use((err, req, res, next) => {
        console.log(err.stack)
        res.status(err.cause || 500).json({ message: err.message, stack: err.stack })
    })

    app.listen(process.env.PORT || 3000, () => console.log(`app running on port ${process.env.PORT || 3000}!`))
}

export default bootstrap