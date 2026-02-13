import jwt from "jsonwebtoken"
import { findById } from "../../DB/db.service.js"
import userModel from "../../DB/models/user.model.js"
import { decrypt } from "../utils/security/encrypt.security.js"

const authentication = async (req, res, next) => {
    const { authentication } = req.headers

    if (!authentication) throw new Error('no authentication', { cause: 404 })

    const [prefix, token] = authentication.split(' ')

    if (prefix !== 'Bearer') throw new Error('invalid Bearer', { cause: 404 })

    const decode = jwt.verify(token, process.env.TOKEN_KEY)

    const user = await findById({ model: userModel, id: decode.id, select: "-password" ,populate:'' })

    if (!user) throw new Error('user not exist', { cause: 404 })

    req.user = { ...user._doc, phone: decrypt({ cipherText: user.phone }), userName: user.userName }

    next()
}


export default authentication