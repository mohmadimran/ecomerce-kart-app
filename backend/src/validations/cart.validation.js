const Joi = require("joi");
const { objectId } = require("./custom.validation");

const addProductToCart = {
  body: Joi.object().keys({
    productId: Joi.string().required().custom(objectId),
    quantity: Joi.number().integer().min(1).max(10000).required(),
  }),
};

const updateProductInCart = {
  body: Joi.object().keys({
    productId: Joi.string().required().custom(objectId),
    quantity: Joi.number().integer().min(0).max(10000).required(),
  }),
};

module.exports = {
  addProductToCart,
  updateProductInCart,
};
