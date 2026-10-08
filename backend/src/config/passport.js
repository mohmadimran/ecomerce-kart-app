/**
 * These config options are required
 * Option 1: jwt secret environment variable set in ".env"
 * Option 2: mechanism to fetch jwt token from request Authentication header with the "bearer" auth scheme
 */

/**
 * Logic to find the user matching the token passed
 * - If payload type isn't `tokenTypes.ACCESS` return an Error() with message, "Invalid token type" in the callback function
 * - Find user object matching the decoded jwt token
 * - If there's a valid user, return the user in the callback function
 * - If user not found, return `false` in the user field in the callback function
 * - If the function errs, return the error in the callback function
 *
 * @param payload - the payload the token was generated with
 * @param done - callback function
 */

const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const config = require("./config");
const { tokenTypes } = require("./tokens");
const { User } = require("../models");

// JWT Strategy Configuration
const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  algorithms: ["HS256"],
};

// Verify Callback for JWT Strategy
const jwtVerify = async (payload, done) => {
  try {
    // Check token type (must be ACCESS token)
    if (payload.type !== tokenTypes.ACCESS) {
      return done(new Error("Invalid token type"), false);
    }

    // Find user by ID (payload.sub should contain user ID)
    const user = await User.findById(payload.sub);
    if (!user) {
      return done(null, false); // User not found
    }

    return done(null, user); // Authentication successful
  } catch (error) {
    return done(error, false); 
  }
};

// Create and export JWT Strategy
const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

module.exports = jwtStrategy; 
