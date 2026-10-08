const { User } = require("../models");
const httpStatus = require("http-status").default;
const ApiError = require("../utils/ApiError");

/**
 * Get User by ID
 * - Fetch user object from Mongo using the "_id" field and return user object
 * @param {String} id
 * @returns {Promise<User>}
 */
async function getUserById(id) {
  return User.findById(id);
}

/**
 * Get User by Email
 * - Fetch user object from Mongo using the "email" field and return user object
 * @param {String} email
 * @returns {Promise<User>}
 */
async function getUserByEmail(email) {
  return User.findOne({ email: email.trim().toLowerCase() }).select("+password");
}

/**
 * Create a new user
 * - If email is already taken, throw error
 * - Else, create and return user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
async function createUser(userBody) {
  const normalizedEmail = userBody.email.trim().toLowerCase();
  if (await User.isEmailTaken(normalizedEmail)) {
    throw new ApiError(httpStatus.CONFLICT, "Email already taken");
  }

  try {
    return await User.create({ ...userBody, email: normalizedEmail });
  } catch (error) {
    // The unique index is the source of truth when concurrent registrations race.
    if (error.code === 11000) {
      throw new ApiError(httpStatus.CONFLICT, "Email already taken");
    }
    throw error;
  }
}

/**
 * Get subset of user's data by id
 * - Should return only email and address fields (plus _id)
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */

const getUserAddressById = async (id) => {
  return User.findOne(
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


