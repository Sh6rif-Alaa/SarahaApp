import joi from 'joi'
import { Types } from 'mongoose'

export const generalRules = {
    id: joi.string().custom((value, helper) => {
        const isValid = Types.ObjectId.isValid(value)
        return isValid ? value : helper.message('inValid id')
    }),
    
    email: joi.string().email({ tlds: { allow: true }, minDomainSegments: 2, maxDomainSegments: 3 }),
    password: joi.string().regex(/^[a-zA-Z0-9!@#$%^&*_-]{6,30}$/),
    cPassword: joi.string().valid(joi.ref('password')).messages({
        'any.only': 'Confirm password does not match password',
        'any.required': 'Confirm password is required'
    }),

    file: joi.object({
        fieldname: joi.string().required(),
        originalname: joi.string().required(),
        encoding: joi.string().required(),
        mimetype: joi.string().required(),
        destination: joi.string().required(),
        filename: joi.string().required(),
        path: joi.string().required(),
        size: joi.number().required()
    }).messages({
        'any:reqired': 'image is reqired'
    }),
}