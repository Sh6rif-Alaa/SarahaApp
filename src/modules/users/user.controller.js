import { Router } from "express";
import { getProfile, refreshToken, shareProfile, signIn, signUp, signUpWithGmail, updatePassowrd, updateProfile } from './user.service.js';
import authorization from "../../common/middleware/authorization.js";
import authentication from "../../common/middleware/authentication.js";
import { roleEnum } from "../../common/enum/user.enum.js";
import validation from "../../common/middleware/validation.js";
import { shareProfileSchema, signInSchema, signUpGmailSchema, signUpSchema, updatePasswordSchema, updateProfileSchema } from "./user.validation.js";
import { multer_host } from "../../common/middleware/multer.js";
import multerEnum from "../../common/enum/multer.enum.js";
import { env } from "../../../config/config.service.js";


const userRouter = Router()

userRouter.post('/signup', multer_host(multerEnum.image).single('image'), validation(signUpSchema), signUp)
userRouter.post('/signup/gmail', validation(signUpGmailSchema), signUpWithGmail)
userRouter.post('/signin', validation(signInSchema), signIn)
userRouter.post('/refreshToken', authentication(env.REFRESH_TOKEN_KEY), authorization([roleEnum.user]), refreshToken)
userRouter.patch('/updateProfile', validation(updateProfileSchema), authentication(env.TOKEN_KEY), authorization([roleEnum.user]), updateProfile)
userRouter.patch('/updatePassword', validation(updatePasswordSchema), authentication(env.TOKEN_KEY), authorization([roleEnum.user]), updatePassowrd)
userRouter.get('/profile', authentication(env.TOKEN_KEY), authorization([roleEnum.user]), getProfile)
userRouter.get('/shareProfile/:id', validation(shareProfileSchema), shareProfile)

export default userRouter