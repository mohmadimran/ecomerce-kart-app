const { Product } = require("../models");

/**
 * Get Product by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getProductById = async (id) => {
  return Product.findById(id).lean();
};

/**
 * Fetch all products
 * @returns {Promise<List<Products>>}
 */
const getProducts = async ({ limit, after } = {}) => {
  const filter = after ? { _id: { $gt: after } } : {};
  const query = Product.find(filter);

  if (limit) {
    query.sort({ _id: 1 }).limit(limit);
  }

  return query.lean();
};

module.exports = {
  getProductById,
  getProducts,
};
