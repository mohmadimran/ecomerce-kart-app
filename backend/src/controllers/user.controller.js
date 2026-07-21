const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { userService } = require("../services");
const ApiError = require("../utils/ApiError");

/**
 * Get user details
 * 
 * Handles two scenarios based on the query param:
 * - If `q=address`, return only the address field of the user.
 * - Otherwise, return the full user object.
 *
 * Validations:
 * - If the user does not exist in DB, return 404.
 * - If the requested user doesn't match the logged-in user, return 403.
 */
const getUser = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { q } = req.query;

  let user;

  if (q === "address") {
    user = await userService.getUserAddressById(userId);
  } else {
    user = await userService.getUserById(userId);
  }

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.email !== req.user.email) {
    throw new ApiError(httpStatus.FORBIDDEN, "User not authorized to access this resource");
  }

  if (q === "address") {
    return res.status(httpStatus.OK).send({ address: user.address });
  }

  return res.status(httpStatus.OK).send(user);
});

/**
 * Set the user's shipping address.
 *
 * Validations:
 * - User must exist.
 * - Requesting user must match logged-in user.
 * - `address` must be present and be at least 20 characters long.
 */
const setAddress = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const user = await userService.getUserById(userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.email !== req.user.email) {
    throw new ApiError(httpStatus.FORBIDDEN, "User not authorized to access this resource");
  }

  const address = req.body.address;

  if (!address) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Address is required");
  }

  if (address.length < 20) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Address must be at least 20 characters long");
  }

  const updatedAddress = await userService.setAddress(user, address);

  return res.status(httpStatus.OK).send({ address: updatedAddress });
});

module.exports = {
  getUser,
  setAddress,
};
