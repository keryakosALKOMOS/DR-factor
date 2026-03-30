const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const products = await mongoose.connection.collection("products").find({}).toArray();
  console.log("Total products", products.length);
  if (products.length > 0) {
    console.log("First product ID:", products[0]._id.toString());
  }
  process.exit(0);
}
run();
