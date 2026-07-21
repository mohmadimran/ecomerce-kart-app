const express = require("express");

// Import the user.route.js file which handles /:userId and other user routes
const userRoute = require("./user.route");

const authRoute = require("./auth.route");
const productRoute = require("./product.route");
const cartRoute = require("./cart.route");

const router = express.Router();
/**
 * @desc Reroute all requests starting with /v1/users
 * to userRoute (defined in user.route.js)
 *
 * Example:
 * - /v1/users/12345 -> handled in user.route.js
 */

router.use("/users", userRoute);  
router.use('/auth', authRoute);
router.use("/products", productRoute);
router.use("/cart", cartRoute);

module.exports = router;
