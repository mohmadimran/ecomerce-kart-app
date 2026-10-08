const mongoose = require("mongoose");
// NOTE - "validator" external library and not the custom middleware at src/middlewares/validate.js
const validator = require("validator");
const config = require("../config/config");
// Import bcryptjs to hash passwords and compare them
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      validate: {
        validator: (value) => validator.isEmail(value),
        message: "Invalid email format"
      }
    },
    password: {
      type: String,
      required: true,
      select: false,
      trim: true,
      minlength: 8,
      validate(value) {
        if (Buffer.byteLength(value, "utf8") > 72) {
          throw new Error("Password must not exceed 72 UTF-8 bytes");
        }
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error(
            "Password must contain at least one letter and one number"
          );
        }
      },
    },
    walletMoney: {
      type: Number,
      required: true,
      default: 500,
      min: 0,
    },
    address: {
      type: String,
      default: config.default_address,
      maxlength: 500,
    },
  },
  // Create createdAt and updatedAt fields automatically
  {
    timestamps: true,
    toJSON: {
      transform(_document, returnedObject) {
        delete returnedObject.password;
        return returnedObject;
      },
    },
  }
);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email) {
  const user = await this.findOne({ email });
  return !!user;
};

/**
 * Check if entered password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */


userSchema.methods.isPasswordMatch = async function (password) {
  return bcrypt.compare(password, this.password);
};


/**
 * Middleware to hash password before saving user to DB
 */
userSchema.pre("save", async function () {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, config.bcryptSaltRounds);
  }
});

/**
 * Check if user has set a non-default address
 * @returns {boolean}
 */
 userSchema.methods.hasSetNonDefaultAddress = function () {
  return this.address && this.address !== config.default_address;
};

/*
 * Create a Mongoose model out of userSchema and export the model as "User"
 * Note: The model should be accessible in a different module when imported like below
 * const User = require("<user.model file path>").User;
 */
/**
 * @typedef User
 */
const User = mongoose.model("User", userSchema);

module.exports = { User };


