const Joi = require("joi");
const { password } = require("./custom.validation");
/**
 * Check request *body* for fields (all are *required*)
 * - "email" : string and satisyfing email structure
 * - "password": string and satisifes the custom password structure defined in "src/validations/custom.validation.js"
 * - "name": string
 */

const register = {
  body: Joi.object().keys({
    name: Joi.string().trim().min(1).max(100).required(),
    email: Joi.string().trim().lowercase().email().max(254).required(),
    password: Joi.string()
      .min(8)
      .custom(password)
      .required(),
  }),
};
/**
 * Check request *body* for fields (all are *required*)
 * - "email" : string and satisyfing email structure
 * - "password": string and satisifes the custom password structure defined in "src/validations/custom.validation.js"
 */
 const login = {
  body: Joi.object().keys({
    email: Joi.string().trim().lowercase().email().max(254).required(),
    password: Joi.string().required().custom(password),
  }),
};

module.exports = {
  register,
  login,
};
