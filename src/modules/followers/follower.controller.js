import { Router } from "express";
import authentication from "../../common/middleware/authentication.js";
import authorization from "../../common/middleware/authorization.js";
import { addFollow, unFollow } from "./follower.service.js";
import { roleEnum } from "../../common/enum/user.enum.js";
import validation from "../../common/middleware/validation.js";
import { followSchema } from "./follower.validation.js";

const followerRouter = Router()

followerRouter.post('/', validation(followSchema), authentication, authorization([roleEnum.user]), addFollow)
followerRouter.delete('/', validation(followSchema), authentication, authorization([roleEnum.user]), unFollow)

export default followerRouter