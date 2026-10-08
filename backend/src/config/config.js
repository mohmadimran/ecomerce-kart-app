const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

const DEFAULT_WALLET_MONEY = 500;
const DEFAULT_PAYMENT_OPTION = "PAYMENT_OPTION_DEFAULT";
const DEFAULT_ADDRESS = "ADDRESS_NOT_SET";

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .valid("production", "development", "test")
      .required(),
    PORT: Joi.number().integer().min(1).max(65535).default(3000),
    MONGO_MAX_POOL_SIZE: Joi.number().integer().min(1).max(1000).default(20),
    TRUST_PROXY_HOPS: Joi.number().integer().min(0).max(10).default(0),
    MONGODB_URL: Joi.string()
      .uri({ scheme: ["mongodb", "mongodb+srv"] })
      .required()
      .description("Mongo DB url"),
    JWT_SECRET: Joi.string()
      .when("NODE_ENV", {
        is: "production",
        then: Joi.string().trim().min(32),
      })
      .required()
      .description("JWT secret key"),
    CORS_ORIGINS: Joi.string().when("NODE_ENV", {
      is: "production",
      then: Joi.string()
        .trim()
        .min(1)
        .custom((value, helpers) => {
          const origins = value.split(",").map((origin) => origin.trim());
          const invalidOrigin = origins.some((origin) => {
            try {
              const parsedOrigin = new URL(origin);
              return (
                !["http:", "https:"].includes(parsedOrigin.protocol) ||
                parsedOrigin.origin !== origin
              );
            } catch {
              return true;
            }
          });
          return invalidOrigin
            ? helpers.error("any.invalid")
            : value;
        })
        .required(),
      otherwise: Joi.string().allow("").default(""),
    }),
    BCRYPT_SALT_ROUNDS: Joi.number()
      .integer()
      .when("NODE_ENV", {
        is: "test",
        then: Joi.number().min(4).max(15).default(4),
        otherwise: Joi.number().min(10).max(15).default(12),
      }),
    LOG_LEVEL: Joi.string().valid("error", "warn", "info", "http", "verbose", "debug", "silly").default("info"),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number()
      .integer()
      .min(1)
      .max(1440)
      .default(30)
      .description("minutes after which access tokens expire"),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const mongoUrl = new URL(envVars.MONGODB_URL);
const configuredDatabaseName = decodeURIComponent(mongoUrl.pathname.replace(/^\/+/, "")) || "qkart";

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  logLevel: envVars.LOG_LEVEL,
  trustProxyHops: envVars.TRUST_PROXY_HOPS,
  corsOrigins: envVars.CORS_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean),
  bcryptSaltRounds: envVars.BCRYPT_SALT_ROUNDS,
  // Set mongoose configuration
  mongoose: {
    url: envVars.MONGODB_URL,
    options: {
      maxPoolSize: envVars.MONGO_MAX_POOL_SIZE,
      ...(envVars.NODE_ENV === "test" && { dbName: `${configuredDatabaseName}-test` }),
    },
  },
  default_wallet_money: DEFAULT_WALLET_MONEY,
  default_payment_option: DEFAULT_PAYMENT_OPTION,
  default_address: DEFAULT_ADDRESS,
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
  },
};
