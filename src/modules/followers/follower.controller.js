import { Router } from "express";
import authentication from "../../common/middleware/authentication.js";
import authorization from "../../common/middleware/authorization.js";
import { addFollow, unFollow } from "./follower.service.js";
import { roleEnum } from "../../common/enum/user.enum.js";

const followerRouter = Router()

followerRouter.post('/', authentication, authorization([roleEnum.user]), addFollow)
followerRouter.delete('/', authentication, authorization([roleEnum.user]), unFollow)

export default followerRouter