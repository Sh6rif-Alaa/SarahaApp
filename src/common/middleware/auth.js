import jwt from "jsonwebtoken"
import { findById } from "../../DB/db.service.js"
import userModel from "../../DB/models/user.model.js"

const authentication = async (req, res, next) => {
    const { authentication } = req.headers
    if (!authentication) throw new Error('no authentication', { cause: 404 })

    const [prefix, token] = authentication.split(' ')

    if (prefix !== 'bearer') throw new Error('invalid bearer', { cause: 404 })

    const decode = jwt.verify(token, "sherif")

    const user = await findById({ model: userModel, id: decode.id, select: "-password" })

    if (!user) throw new Error('user not exist', { cause: 404 })

    req.user = user

    next()
}


export default authentication