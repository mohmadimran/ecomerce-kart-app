const httpStatus = require("http-status").default;
const config = require("../config/config");
const logger = require("../config/logger");

// Send response on errors
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const proposedStatus = err.statusCode || err.status;
  const statusCode =
    Number.isInteger(proposedStatus) && proposedStatus >= 400 && proposedStatus <= 599
      ? proposedStatus
      : httpStatus.INTERNAL_SERVER_ERROR;
  const message =
    statusCode >= 500 && config.env === "production"
      ? "Internal server error"
      : err.message || httpStatus[statusCode];

  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
    ...(config.env === "development" && { stack: err.stack }),
  };

  if (statusCode >= 500) {
    logger.error(err.message, { stack: err.stack });
  } else if (config.env === "development") {
    logger.warn(err.message);
  }

  res.status(statusCode).send(response);
};

module.exports = {
  errorHandler,
};
