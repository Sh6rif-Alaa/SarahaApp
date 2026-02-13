import { Router } from "express";
import { getProfile, signIn, signUp } from './user.service.js';
import auth from "../../common/middleware/auth.js";

const userRouter = Router()

userRouter.post('/signup', signUp)
userRouter.post('/signin', signIn)
userRouter.get('/profile', auth, getProfile)

export default userRouter