const httpStatus = require("http-status").default;
const { userOne, userTwo } = require("../fixtures/user.fixture");
const mongoose = require("mongoose");
const { Cart, User, Product } = require("../../src/models");
const { cartService } = require("../../src/services");
const {
  cartWithProductsUserOne,
  emptyCart,
  cartWithProductsUserTwo,
} = require("../fixtures/cart.fixture");
const ApiError = require("../../src/utils/ApiError");
const mockingoose = require("mockingoose").default;
const config = require("../config/config");

// Tests related to the Cart layer
describe("Cart test", () => {
  // Reset any mocked objects after each individual test
  beforeEach(() => {
    mockingoose.resetAll();
    jest.spyOn(mongoose, "startSession").mockResolvedValue({
      withTransaction: async (callback) => callback(),
      endSession: jest.fn(),
    });
    mockingoose(User).toReturn(userOne, "findOne");
    mockingoose(Product).toReturn([
      { _id: "5f71c1ca04c69a5874e9fd45", cost: 20 },
    ], "find");
    mockingoose(User).toReturn({ matchedCount: 0 }, "updateOne");
  });

  // Tests for checking checkout functionality
  describe("Checkout", () => {
    // Test a particular scenario of the checkout functionality
    it("should throw 404 error if cart is not present", async () => {
      // Mock Cart model to return `null` as output to `Cart.findOne()` call
      mockingoose(Cart).toReturn(null, "findOne");

      // const res = cartService.checkout(userOne);

      // TODO: CRIO_TASK_MODULE_TEST - Assert if
      /* - ApiError is thrown
       * - the "statusCode" field of response is "404 NOT FOUND"
       *
       * Example ApiError output
       * {
       *  "statusCode": 404,
       *  "message": "User does not have a cart",
       *  "stack": "<Error-stack-trace-if-present>"
       * }
       */
      // 1. Check that ApiError is thrown
  await expect(cartService.checkout(userOne)).rejects.toThrow(ApiError);

  // 2. Check that error has statusCode: 404 and correct message
  await expect(cartService.checkout(userOne)).rejects.toMatchObject({
    statusCode: httpStatus.NOT_FOUND,
    message: "User does not have a cart",
  });
});

    it("should throw 400 error if user's cart doesn't have any product", async () => {
      // Mock Cart model to return `emptyCart` object as output to `Cart.findOne()` call
      mockingoose(Cart).toReturn(emptyCart, "findOne");

      // const res = cartService.checkout(userOne);

      // TODO: CRIO_TASK_MODULE_TEST - Assert if
      // - ApiError is thrown
      // - the "statusCode" field of response is "400 BAD REQUEST"
      // Step 2: Assert that checkout throws an ApiError with 400 status
  await expect(cartService.checkout(userOne)).rejects.toThrow(ApiError);
  await expect(cartService.checkout(userOne)).rejects.toMatchObject({
    statusCode: httpStatus.BAD_REQUEST,
    message: "Cart is empty",
  });
    });

    it("should throw 400 error if address is not set - when User.hasSetNonDefaultAddress() returns false", async () => {
      expect(userTwo.address).toEqual(config.default_address);

      mockingoose(Cart).toReturn(cartWithProductsUserTwo, "findOne");
      mockingoose(User).toReturn(userTwo, "findOne");

      // create a mock function for User model's hasSetNonDefaultAddress() instance method
      const hasSetNonDefaultAddressMock = jest.fn();
      userTwo.hasSetNonDefaultAddress =
        hasSetNonDefaultAddressMock.mockReturnValue(false);

      // const res = cartService.checkout(userTwo);

      // TODO: CRIO_TASK_MODULE_TEST - Assert if
      // - ApiError is thrown
      // - the "statusCode" field of response is "400 BAD REQUEST"
      await expect(cartService.checkout(userTwo)).rejects.toThrow(ApiError);
      await expect(cartService.checkout(userTwo)).rejects.toMatchObject({
        statusCode: httpStatus.BAD_REQUEST,
        message: "Address is not set",
      });
    });

    it("should throw 400 error if wallet balance is insufficient", async () => {
      mockingoose(Cart).toReturn(cartWithProductsUserOne, "findOne");

      const userOneWithZeroBalance = { ...userOne, walletMoney: 0 };

      // create a mock function for User model's hasSetNonDefaultAddress() instance method
      const hasSetNonDefaultAddressMock = jest.fn();
      userOneWithZeroBalance.hasSetNonDefaultAddress = hasSetNonDefaultAddressMock.mockReturnValue(
        true
      );

      // const res = cartService.checkout(userOneWithZeroBalance);

      // TODO: CRIO_TASK_MODULE_TEST - Assert if
      // - ApiError is thrown
      // - the "statusCode" field of response is "400 BAD REQUEST"
      await expect(cartService.checkout(userOneWithZeroBalance)).rejects.toThrow(ApiError);
  await expect(cartService.checkout(userOneWithZeroBalance)).rejects.toMatchObject({
    statusCode: httpStatus.BAD_REQUEST,
    message: "Insufficient wallet balance",
  });
    });

    it("should update user balance and empty the cart on success", async () => {
      jest.spyOn(User.prototype, "hasSetNonDefaultAddress").mockReturnValue(true);
      const updateUserMock = jest
        .spyOn(User, "updateOne")
        .mockResolvedValue({ matchedCount: 1 });

      // define a mock object for `cart.save()` call - assert saved Cart object
      let cartSaveMock = (...args) => {
        // Check if the cart was emptied on calling save()
        expect(args[0].cartItems.length).toEqual(0);
        return args[0];
      };

      // Return `cartSaveMock` object on calling `save()` function of Cart model
      mockingoose(Cart).toReturn(cartSaveMock, "save");
      mockingoose(Cart).toReturn(cartWithProductsUserOne, "findOne");
      mockingoose(User).toReturn(userOne, "findOne");
      mockingoose(User).toReturn({ matchedCount: 1 }, "updateOne");

      // Call the method to be tested - `checkout()`
      await cartService.checkout(userOne);

      expect(User.prototype.hasSetNonDefaultAddress).toHaveBeenCalled();
      expect(updateUserMock).toHaveBeenCalledWith(
        expect.objectContaining({ _id: userOne._id }),
        { $inc: { walletMoney: -40 } },
        expect.objectContaining({ session: expect.anything() })
      );
    });
  });
});
