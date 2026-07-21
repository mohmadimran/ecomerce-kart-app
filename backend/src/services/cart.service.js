const httpStatus = require("http-status");
const { Cart, Product } = require("../models");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");


/**
 * Fetches cart for a user
 * - Fetch user's cart from Mongo
 * - If cart doesn't exist, throw ApiError
 * --- status code  - 404 NOT FOUND
 * --- message - "User does not have a cart"

 * @param {User} user - User object
 * @param {string} productId - Product ID to add
 * @param {number} quantity - Quantity of product
 * @returns {Promise<Cart>} - Updated cart with populated products
 * @throws {ApiError} - Various error cases with appropriate status codes
 */

/**
 * Updates the quantity of an already existing product in cart
 * - Get user's cart object using "Cart" model's findOne() method
 * - If cart doesn't exist, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart. Use POST to create cart and add a product"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * - Otherwise, update the product's quantity in user's cart to the new quantity provided and return the cart object
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */

/**
 * Deletes an already existing product in cart
 * - If cart doesn't exist for user, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * Otherwise, remove the product from user's cart
 *
 * @param {User} user
 * @param {string} productId
 * @throws {ApiError}
 */
 
 /**
  * Get the cart for a user by email
  */
 const getCartByUser = async (user) => {
   const cart = await Cart.findOne({ email: user.email });
 
   if (!cart) {
     throw new ApiError(httpStatus.NOT_FOUND, "User does not have a cart");
   }
 
   return cart;
 };
 
 /**
  * Add a product to the user's cart
  * 
  */
  const addProductToCart = async (user, productId, quantity) => {
    // 1. Find the product
    const productData = await Product.findById(productId);
    if (!productData) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Product not found");
    }
  
    // 2. Try to find user's cart
    let cart = await Cart.findOne({ email: user.email });
  
    // 3. If cart doesn't exist, create a new one
    if (!cart) {
      cart = await Cart.create({
        email: user.email,
        cartItems: [{ product: productData.toObject(), quantity }],
      });
  
      // 4. Fail safe if creation fails 
      if (!cart) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to create cart");
      }
  
      return cart;
    }
  
    // 5. Check if product is already in cart
    const itemIndex = cart.cartItems.findIndex(
      (item) => item.product._id.toString() === productId
    );
  
    if (itemIndex > -1) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Product already in cart");
    }
  
    // 6. Add product to cart
    cart.cartItems.push({
      product: productData.toObject(),
      quantity,
    });
  
    await cart.save();
  
    return cart;
  };
  

  const updateProductInCart = async (user, productId, quantity) => {
    const cart = await Cart.findOne({ email: user.email });
  
    if (!cart) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Cart not found");
    }
  
    const itemIndex = cart.cartItems.findIndex(
      (item) => item.product._id.toString() === productId
    );
  
    if (itemIndex === -1) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Product not in cart");
    }
  
    // Update the quantity
    cart.cartItems[itemIndex].quantity = quantity;
  
    await cart.save();
  
    return cart;
  };
  
 
 /**
  * Remove a product from the cart
  */
 const deleteProductFromCart = async (user, productId) => {
   const cart = await Cart.findOne({ email: user.email });
   if (!cart) {
     throw new ApiError(httpStatus.BAD_REQUEST, "User does not have a cart");
   }
 
   const itemIndex = cart.cartItems.findIndex(
     (item) => item.product._id.toString() === productId
   );
 
   if (itemIndex === -1) {
     throw new ApiError(httpStatus.BAD_REQUEST, "Product not in cart");
   }
 
   cart.cartItems.splice(itemIndex, 1);
   await cart.save();
 };
 
 
 


const checkout = async (user) => {
  const cart = await Cart.findOne({ email: user.email });

  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, "User does not have a cart");
  }

  if (!cart.cartItems || cart.cartItems.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Cart is empty");
  }

  if (!user.hasSetNonDefaultAddress()) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Address is not set");
  }
  
  const totalAmount = cart.cartItems.reduce(
    (acc, item) => acc + item.product.cost * item.quantity,
    0
  );

  if (user.walletMoney < totalAmount) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Insufficient wallet balance");
  }

  user.walletMoney -= totalAmount;
  await user.save();

  cart.cartItems = [];
  await cart.save();
};

module.exports = {
  getCartByUser,
  addProductToCart,
  updateProductInCart,
  deleteProductFromCart,
  checkout,
};
