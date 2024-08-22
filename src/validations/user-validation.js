import Joi from "joi";

const createOrUpdateUserValidation = Joi.object({
    username: Joi.string().max(25).required(),
    account_number: Joi.string().max(25).required(),
    email: Joi.string().max(200).email().required(),
    identity_number: Joi.string().max(16).required(),
})

export {
    createOrUpdateUserValidation
}