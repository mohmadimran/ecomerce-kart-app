const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { randomUUID } = require("node:crypto");
const { User } = require("../../src/models");

const password = "password1";
const salt = bcrypt.genSaltSync(8);
const hashedPassword = bcrypt.hashSync(password, salt);

const userOne = {
  _id: new mongoose.Types.ObjectId(),
  walletMoney: 200,
  name: "Test User One",
  email: `user-one-${randomUUID()}@example.com`,
  password,
  address:
    "This is my long random address hopefully satisfying the minimum length criteria",
};

const userTwo = {
  _id: new mongoose.Types.ObjectId(),
  walletMoney: 200,
  name: "Test User Two",
  email: `user-two-${randomUUID()}@example.com`,
  password,
  address: "ADDRESS_NOT_SET",
};

const insertUsers = async (users) => {
  await User.insertMany(
    users.map((user) => ({ ...user, password: hashedPassword }))
  );
};

module.exports = {
  userOne,
  userTwo,
  insertUsers,
};
