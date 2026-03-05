import joi from 'joi'
import { genderEnum } from '../../common/enum/user.enum.js'
import { generalRules } from '../../common/utils/generalRules.js'

export const signUpSchema = {
    body: joi.object({
        userName: joi.string().min(5).max(40).required(),
        email: generalRules.email.required(),
        password: generalRules.password.required(),
        cPassword: generalRules.cPassword.required(),
        phone: joi.string().regex(/^(\+20|0|0020)1[0125][0-9]{8}$/).required(),
        gender: joi.string().lowercase().valid(...Object.values(genderEnum)).default(genderEnum.male),
        age: joi.number().integer().positive().min(16).max(60).required()
    }).required(),

    file: generalRules.file.required()
}

export const signUpGmailSchema = {
    body: joi.object({
        idToken: joi.string().required()
    }).required()
}

export const signInSchema = {
    body: joi.object({
        email: generalRules.email.required(),
        password: generalRules.password.required(),
    }).required()
}

export const shareProfileSchema = {
    params: joi.object({
        id: generalRules.id.required()
    }).required()
}

export const updateProfileSchema = {
    body: joi.object({
        firstName: joi.string().min(3).max(16),
        lastName: joi.string().min(3).max(16),
        phone: joi.string().regex(/^(\+20|0|0020)1[0125][0-9]{8}$/),
        gender: joi.string().lowercase().valid(...Object.values(genderEnum)),
        age: joi.number().integer().positive().min(16).max(60)
    }).min(1).required()
}

export const updatePasswordSchema = {
    body: joi.object({
        oldPassword: generalRules.password.required().required(),
        newPassword: generalRules.password.required().required(),
        cPassword: joi.string().valid(joi.ref('newPassword')).messages({
            'any.only': 'Confirm password does not match newPassword',
            'any.required': 'Confirm password is required'
        }).required(),
    }).required()
}
