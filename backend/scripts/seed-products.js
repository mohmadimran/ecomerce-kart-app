const path = require("node:path");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const mongoose = require("mongoose");
const { Product } = require("../src/models/product.model");

const sampleProducts = [
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
    const result = await Product.bulkWrite(
      sampleProducts.map((product) => ({
        updateOne: {
          filter: { name: product.name, category: product.category },
          update: { $setOnInsert: product },
          upsert: true,
        },
      }))
    );

    console.info(
      `Product seed complete: inserted ${result.upsertedCount} sample products; existing products were left unchanged.`
    );
  } finally {
    await mongoose.disconnect();
  }
};

seedProducts().catch((error) => {
  console.error("Failed to seed sample products:", error);
  process.exitCode = 1;
});
