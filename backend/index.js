const mongoose = require("mongoose");
const app = require("./src/app");
const config = require("./src/config/config");
const logger = require("./src/config/logger");

const startServer = async () => {
  await mongoose.connect(config.mongoose.url, config.mongoose.options);
  logger.info("Connected to MongoDB");

  const server = app.listen(config.port, () => {
    logger.info(`Listening to port ${config.port}`);
  });

  server.on("error", (error) => {
    logger.error("HTTP server error", { message: error.message, stack: error.stack });
    process.exitCode = 1;
    mongoose.disconnect().catch((disconnectError) => {
      logger.error("MongoDB shutdown error", { message: disconnectError.message });
    });
  });

  mongoose.connection.on("disconnected", () => logger.warn("MongoDB disconnected"));
  mongoose.connection.on("error", (error) => {
    logger.error("MongoDB connection error", { message: error.message });
  });

  let shuttingDown = false;
  const shutdown = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info(`Received ${signal}; shutting down`);
    const forceExit = setTimeout(() => {
      logger.error("Graceful shutdown timed out");
      process.exit(1);
    }, 10_000);
    forceExit.unref();
    try {
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
      await mongoose.disconnect();
    } catch (error) {
      logger.error("Shutdown failed", { message: error.message, stack: error.stack });
      process.exitCode = 1;
    } finally {
      clearTimeout(forceExit);
    }
  };

  process.once("SIGINT", () => void shutdown("SIGINT"));
  process.once("SIGTERM", () => void shutdown("SIGTERM"));
};

startServer().catch((error) => {
  logger.error("Backend startup failed", { message: error.message, stack: error.stack });
  process.exitCode = 1;
});


