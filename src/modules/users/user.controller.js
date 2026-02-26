import { Router } from "express";
import { getProfile, signIn, signUp, signUpWithGmail } from './user.service.js';
import authorization from "../../common/middleware/authorization.js";
import authentication from "../../common/middleware/authentication.js";
import { roleEnum } from "../../common/enum/user.enum.js";
import validation from "../../common/middleware/validation.js";
import { signInSchema, signUpGmailSchema, signUpSchema } from "./user.validation.js";
import multer_local from "../../common/middleware/multer.js";
import multerEnum from "../../common/enum/multer.enum.js";


const userRouter = Router()

userRouter.post('/signup', multer_local({ custom_path: 'users', custom_type: multerEnum.image }).single('image'), validation(signUpSchema), signUp)
userRouter.post('/signup/gmail', validation(signUpGmailSchema), signUpWithGmail)
userRouter.post('/signin', validation(signInSchema), signIn)
userRouter.get('/profile', authentication, authorization([roleEnum.user]), getProfile)

export default userRouter