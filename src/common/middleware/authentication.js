import { env } from "../../../config/config.service.js"
import { findById } from "../../DB/db.service.js"
import userModel from "../../DB/models/user.model.js"
import { decrypt } from "../utils/security/encrypt.security.js"
import { verifyToken } from "../utils/token.service.js"

const authentication = (secret_key) => {
    return async (req, res, next) => {
        const { authorization } = req.headers

        if (!authorization) throw new Error('no authentication (token)', { cause: 404 })

        const [prefix, token] = authorization.split(' ')

        if (prefix !== env.PREFIX) throw new Error('invalid prefix', { cause: 404 })

        const decode = verifyToken({ token, secret_key })

        if (!decode || !decode?.id) throw new Error('invalid token', { cause: 400 })

        const user = await findById({ model: userModel, id: decode.id })

        if (!user) throw new Error('user not exist', { cause: 404 })

        req.user = user

        next()
    }
}


export default authentication