const { User } = require("../models");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");

/**
 * Get User by ID
 * - Fetch user object from Mongo using the "_id" field and return user object
 * @param {String} id
 * @returns {Promise<User>}
 */
async function getUserById(id) {
  return await User.findById(id);
}

/**
 * Get User by Email
 * - Fetch user object from Mongo using the "email" field and return user object
 * @param {String} email
 * @returns {Promise<User>}
 */
async function getUserByEmail(email) {
  return await User.findOne({ email });
}

/**
 * Create a new user
 * - If email is already taken, throw error
 * - Else, create and return user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
async function createUser(userBody) {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.OK, "Email already taken");
  }

  return await User.create(userBody);
}

/**
 * Get subset of user's data by id
 * - Should return only email and address fields (plus _id)
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */

const getUserAddressById = async (id) => {
  return await User.findOne(
    { _id: id },
    { email: 1, address: 1 }
  );
};

/**
 * Set user shipping address
 * - Updates address field and returns it
 * @param {User} user
 * @param {String} newAddress
 * @returns {Promise<String>}
 */
async function setAddress(user, newAddress) {
  user.address = newAddress;
  await user.save();
  return user.address;
}

module.exports = {
  getUserById,
  getUserByEmail,
  createUser,
  getUserAddressById,
  setAddress,
};


