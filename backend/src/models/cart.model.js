const mongoose = require('mongoose');
const { productSchema } = require('./product.model');

const cartSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
  },
  paymentOption: {
    type: String,
    required: true,
    default: "PAYMENT_OPTION_DEFAULT",
  },
  cartItems: [
    {
      product: {
        type: productSchema, // Embedded full product schema
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
        max: 10000,
        validate: {
          validator: Number.isInteger,
          message: "Quantity must be a whole number",
        },
      },
    },
  ],
});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
