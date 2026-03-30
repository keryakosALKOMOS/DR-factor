require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

async function fixKoko() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const users = db.collection("users");
  
  const emailRegex = new RegExp("^koko@gmail\\.com$", "i");
  const user = await users.findOne({ email: emailRegex });
  
  const hash = await bcrypt.hash("koko", 10);
  
  if (!user) {
    await users.insertOne({
      name: "Koko Admin",
      email: "koko@gmail.com",
      password: hash,
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log("Created koko@gmail.com with password koko and admin role.");
  } else {
    await users.updateOne({ _id: user._id }, {
      $set: { password: hash, role: "admin", email: "koko@gmail.com" }
    });
    console.log("Updated existing koko user with password koko and admin role.");
  }
  await mongoose.disconnect();
}
fixKoko();
