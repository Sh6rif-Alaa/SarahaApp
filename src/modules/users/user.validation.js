import joi from 'joi'
import { genderEnum } from '../../common/enum/user.enum.js'

export const signUpSchema = {
    body: joi.object({
        userName: joi.string().min(5).max(40).required(),
        email: joi.string().email().required(),
        password: joi.string().regex(/^[a-zA-Z0-9!@#$%^&*_-]{6,30}$/).required(),
        cPassword: joi.string().valid(joi.ref('password')).required().messages({
            'any.only': 'Confirm password does not match password',
            'any.required': 'Confirm password is required'
        }),
        phone: joi.string().regex(/^01[0125][0-9]{8}$/).required(),
        gender: joi.string().lowercase().valid(...Object.values(genderEnum)).default(genderEnum.male),
        age: joi.number().integer().positive().min(16).max(60).required()
    }).required()
}

export const signUpGmailSchema = {
    body: joi.object({
        idToken: joi.string().required()
    }).required()
}

export const signInSchema = {
    body: joi.object({
        email: joi.string().email().required(),
        password: joi.string().regex(/^[a-zA-Z0-9!@#$%^&*_-]{6,30}$/).required(),
    }).required()
}

