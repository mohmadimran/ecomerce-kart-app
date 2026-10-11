const mongoose = require("mongoose");
const config = require("../config/config");

const setupTestDB = () => {
  beforeAll(async () => {
    await mongoose.connect(config.mongoose.url, {
      ...config.mongoose.options,
      serverSelectionTimeoutMS: 5000,
    });
  }, 10000);

  beforeEach(async () => {
    await Promise.all(
      Object.values(mongoose.connection.collections).map(async (collection) =>
        collection.deleteMany()
      )
    );
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }, 10000);
};

module.exports = setupTestDB;
