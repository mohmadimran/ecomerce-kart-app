const express = require("express");
const compression = require("compression");
const cors = require("cors");
const httpStatus = require("http-status").default;
const { rateLimit } = require("express-rate-limit");
const routes = require("./routes/v1");
const { errorHandler } = require("./middlewares/error");
const ApiError = require("./utils/ApiError");
const jwtStrategy = require("./config/passport");
const helmet = require("helmet");
const passport = require("passport");
const config = require("./config/config");
const mongoose = require("mongoose");
const logger = require("./config/logger");
const { randomUUID } = require("crypto");

const app = express();

if (config.trustProxyHops > 0) {
  app.set("trust proxy", config.trustProxyHops);
}

// set security HTTP headers - https://helmetjs.github.io/
app.use(helmet());

// parse json request body
app.use(express.json({ limit: "100kb" }));

// parse urlencoded request body
app.use(
  express.urlencoded({ extended: false, limit: "100kb", parameterLimit: 100 })
);

// gzip compression
app.use(compression());

// enable cors
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.env !== "production") return callback(null, true);
      return callback(null, config.corsOrigins.includes(origin));
    },
  })
);

app.use((req, res, next) => {
  const requestId = randomUUID();
  const startedAt = Date.now();
  res.setHeader("X-Request-Id", requestId);
  res.on("finish", () => {
    logger.info("HTTP request", {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });
  next();
});

app.get("/health/live", (_req, res) => res.status(200).json({ status: "ok" }));
app.get("/health/ready", (_req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ status: ready ? "ok" : "unavailable" });
});

app.use(passport.initialize());
passport.use("jwt", jwtStrategy);

app.use(
  "/v1/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skip: () => config.env === "test",
    message: {
      code: httpStatus.TOO_MANY_REQUESTS,
      message: "Too many authentication attempts. Please try again later.",
    },
  })
);

// Reroute all API request starting with "/v1" route
app.use("/v1", routes);

// send back a 404 error for any unknown api request

app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

// handle error
app.use(errorHandler);

module.exports = app;



