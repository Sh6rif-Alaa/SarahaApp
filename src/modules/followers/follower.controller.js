import { Router } from "express";
import authentication from "../../common/middleware/auth.js";
import { addFollow, unFollow } from "./follower.service.js";

const followerRouter = Router()

followerRouter.post('/', authentication, addFollow)
followerRouter.delete('/', authentication, unFollow)

export default followerRouter