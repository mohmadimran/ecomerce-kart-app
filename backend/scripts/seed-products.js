const path = require("node:path");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const mongoose = require("mongoose");
const { Product } = require("../src/models/product.model");

const catalogProducts = [
  {
    _id: new mongoose.Types.ObjectId("6005913ffaa2bffe60466952"),
    name: "OnePlus 6",
    category: "Phones",
    rating: 5,
    cost: 100,
    image:
      "https://images.pexels.com/photos/63690/pexels-photo-63690.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=126",
  },
  {
    _id: new mongoose.Types.ObjectId("6005913ffaa2bffe60466953"),
    name: "Toothbrush",
    category: "Health",
    rating: 5,
    cost: 100,
    image:
      "https://images.pexels.com/photos/3588229/pexels-photo-3588229.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
  },
  {
    _id: new mongoose.Types.ObjectId("6005913ffaa2bffe60466954"),
    name: "Toothpaste",
    category: "Health",
    rating: 4,
    cost: 100,
    image:
      "https://images.pexels.com/photos/4465125/pexels-photo-4465125.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
  },
  {
    _id: new mongoose.Types.ObjectId("6005913ffaa2bffe60466955"),
    name: "Football",
    category: "Sports",
    rating: 5,
    cost: 100,
    image:
      "https://images.pexels.com/photos/3074920/pexels-photo-3074920.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
  },
  {
    _id: new mongoose.Types.ObjectId("6005913ffaa2bffe60466956"),
    name: "Basketball",
    category: "Sports",
    rating: 5,
    cost: 100,
    image:
      "https://images.pexels.com/photos/3558072/pexels-photo-3558072.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
  },
  {
    _id: new mongoose.Types.ObjectId("6005913ffaa2bffe60466957"),
    name: "IPhone XR",
    category: "Phones",
    rating: 5,
    cost: 100,
    image:
      "https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500",
  },
  {
    name: "bat",
    category: "Sports",
    rating: 3,
    cost: 20,
    image: "https://placehold.co/600x400?text=Cricket+Bat",
  },
  {
    name: "ball",
    category: "Sports",
    rating: 4,
    cost: 5,
    image: "https://placehold.co/600x400?text=Sports+Ball",
  },
  {
    name: "football",
    category: "Sports",
    rating: 5,
    cost: 25,
    image: "https://placehold.co/600x400?text=Football",
  },
  {
    name: "tennis racket",
    category: "Sports",
    rating: 4,
    cost: 45,
    image: "https://placehold.co/600x400?text=Tennis+Racket",
  },
  {
    name: "running shoes",
    category: "Footwear",
    rating: 5,
    cost: 60,
    image: "https://placehold.co/600x400?text=Running+Shoes",
  },
  {
    name: "water bottle",
    category: "Accessories",
    rating: 4,
    cost: 12,
    image: "https://placehold.co/600x400?text=Water+Bottle",
  },
  {
    name: "gym bag",
    category: "Accessories",
    rating: 4,
    cost: 35,
    image: "https://placehold.co/600x400?text=Gym+Bag",
  },
];

const seedProducts = async () => {
  const mongoUrl = process.env.MONGODB_URL;
  if (!mongoUrl) {
    throw new Error("MONGODB_URL must be set before seeding products.");
  }

  await mongoose.connect(mongoUrl);

  try {
    let insertedCount = 0;
    for (const product of catalogProducts) {
      const { _id } = product;
      if (_id) {
        const existingId = await Product.findById(_id);
        if (existingId) {
          if (
            existingId.name !== product.name.toLowerCase() ||
            existingId.category !== product.category
          ) {
            console.warn(
              `Skipped "${product.name}" because its original ID is already used by another product.`
            );
          }
          continue;
        }

        const existingProduct = await Product.findOne({
          name: product.name,
          category: product.category,
          image: product.image,
        });
        if (existingProduct) continue;
      } else {
        const existingProduct = await Product.findOne({
          name: product.name,
          category: product.category,
        });
        if (existingProduct) continue;
      }

      await Product.create(product);
      insertedCount += 1;
    }

    console.info(`Product seed complete: inserted ${insertedCount} missing products.`);
  } finally {
    await mongoose.disconnect();
  }
};

seedProducts().catch((error) => {
  console.error("Failed to seed sample products:", error);
  process.exitCode = 1;
});
