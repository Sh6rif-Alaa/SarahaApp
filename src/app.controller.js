import checkConnection from './DB/connection.js'
import express from 'express'
import userRouter from './modules/users/user.controller.js'
import messageRouter from './modules/messages/message.service.js'
import successResponse from './common/utils/response.success.js'

const app = express()
const port = 3000

const bootstrap = () => {
    app.use(express.json())
    checkConnection()

    app.get('/', (req, res) => successResponse({ res, message: 'Welcome on Saraha App' }))

    app.use('/users', userRouter)
    app.use('/messages', messageRouter)

    app.use((req, res) => { throw new Error(`Url ${req.originalUrl} not found`, { cause: 404 }) })

    // global error handling express v5 support it without making asyncHandler
    // catch throw Error
    app.use((err, req, res, next) => {
        console.log(err.stack)
        res.status(err.cause || 500).json({ message: err.message, stack: err.stack })
    })

    app.listen(port, () => console.log(`app running on port ${port}!`))
}

export default bootstrap