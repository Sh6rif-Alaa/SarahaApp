import { env } from "../../../config/config.service.js"
import { findById, findOne } from "../../DB/db.service.js"
import revokeTokenModel from "../../DB/models/revokeToken.model.js"
import userModel from "../../DB/models/user.model.js"
import { getValue, revoke_key } from "../../DB/redis/redis.service.js"
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

        if (user.changeCredential?.getTime() > decode.iat * 1000) throw new Error('invalid all token', { cause: 400 })

        const revokeToken = await getValue(revoke_key({ userId: user._id, jti: decode.jti }))

        if (revokeToken)
            throw new Error('invalid token revokeToken', { cause: 400 })

        req.user = user
        req.decode = decode

        next()
    }
}


export default authentication