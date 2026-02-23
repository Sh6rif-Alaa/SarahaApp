import { Router } from "express";
import { getProfile, signIn, signUp, signUpWithGmail } from './user.service.js';
import authorization from "../../common/middleware/authorization.js";
import authentication from "../../common/middleware/authentication.js";
import { roleEnum } from "../../common/enum/user.enum.js";

const userRouter = Router()

userRouter.post('/signup', signUp)
userRouter.post('/signup/gmail', signUpWithGmail)
userRouter.post('/signin', signIn)
userRouter.get('/profile', authentication, authorization([roleEnum.user]), getProfile)

export default userRouter