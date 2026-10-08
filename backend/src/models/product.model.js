const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    cost: {
      type: Number,
      required: true,
      min: 0,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: false,
  }
);

/**
 * @typedef Product
 */
const Product = mongoose.model("Product", productSchema);

module.exports.Product = Product;
module.exports.productSchema = productSchema;
