const Joi = require("joi");
const { objectId } = require("./custom.validation");

const getProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
};

const getProducts = {
  query: Joi.object().keys({
    limit: Joi.number().integer().min(1).max(100),
    after: Joi.string().custom(objectId),
  }).with("after", "limit"),
};

module.exports = {
  getProduct,
  getProducts,
};
