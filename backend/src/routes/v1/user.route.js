// const express = require("express");
// // Middleware to validate incoming requests (if needed in the future)
// const validate = require("../../middlewares/validate");
// // Validation schema (currently not used for getUser, but imported for completeness)
// const userValidation = require("../../validations/user.validation");
// // Controller that handles business logic
// const userController = require("../../controllers/user.controller");
// // const catchAsync = require('../../utils/catchAsync');
// const catchAsync = require('../../utils/catchAsync');
// const auth = require("../../middlewares/auth");


// /**
//  * @route GET /v1/users/:userId
//  * @desc Get user details by userId
//  * @access Public
//  *
//  * Example:
//  * GET /v1/users/6010008e6c3477697e8eaba3
//  */


// const router = express.Router();

// router.get(
//   '/:userId',
//   auth,  
//   validate(userValidation.getUser),
//   catchAsync(userController.getUser))

// // router.put(
// //   "/:userId",
// //   auth,
// //   validate(userValidation.setAddress),
// //   userController.setAddress
// // );
// // router.put('/:userId/address', userController.setAddress);
// router.put(
//   "/:userId/address",
//   auth,
//   validate(userValidation.setAddress),
//   userController.setAddress
// );

// module.exports = router;

const express = require("express");
// Middleware to validate incoming requests (if needed in the future)
const validate = require("../../middlewares/validate");
// Validation schema (currently not used for getUser, but imported for completeness)
const userValidation = require("../../validations/user.validation");
// Controller that handles business logic
const userController = require("../../controllers/user.controller");
// const catchAsync = require('../../utils/catchAsync');
const catchAsync = require('../../utils/catchAsync');
const auth = require("../../middlewares/auth");

const router = express.Router();

router.get(
  "/:userId",
  auth,
  validate(userValidation.getUser),
  catchAsync(userController.getUser)
);

// Support both routes for setting address
router.put(
  "/:userId",
  auth,
  validate(userValidation.setAddress),
  userController.setAddress
);

router.put(
  "/:userId/address",
  auth,
  validate(userValidation.setAddress),
  userController.setAddress
);

module.exports = router;
