import { Router } from "express";
import { getProfile, signIn, signUp, signUpWithGmail } from './user.service.js';
import authorization from "../../common/middleware/authorization.js";
import authentication from "../../common/middleware/authentication.js";
import { roleEnum } from "../../common/enum/user.enum.js";
import validation from "../../common/middleware/validation.js";
import { signInSchema, signUpGmailSchema, signUpSchema } from "./user.validation.js";


const userRouter = Router()

userRouter.post('/signup', validation(signUpSchema), signUp)
userRouter.post('/signup/gmail', validation(signUpGmailSchema), signUpWithGmail)
userRouter.post('/signin', validation(signInSchema), signIn)
userRouter.get('/profile', authentication, authorization([roleEnum.user]), getProfile)

export default userRouter