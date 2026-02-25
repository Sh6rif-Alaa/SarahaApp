import joi from 'joi'

export const followSchema = {
    body: joi.object({
        following_id: joi.string().required()
    }).required()
}