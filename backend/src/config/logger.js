const winston = require("winston");
const config = require("./config");

const logger = winston.createLogger({
  level: config.logLevel,
  format:
    config.env === "production"
      ? winston.format.combine(winston.format.timestamp(), winston.format.json())
      : winston.format.combine(winston.format.timestamp(), winston.format.simple()),
  transports: [new winston.transports.Console()],
});

module.exports = logger;
