const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: ".env.local" });

async function createAdmin() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error("MONGODB_URI not found");
      process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("Connected successfully.");

    const db = mongoose.connection.db;
    const usersCollection = db.collection("users");

    const email = "admin@gmail.com";
    const password = "admin";
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await usersCollection.updateOne(
      { email },
      { 
        $set: { 
          name: "Admin User",
          password: hashedPassword,
          role: "admin",
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      console.log(`SUCCESS: Created new admin: ${email} / ${password}`);
    } else {
      console.log(`SUCCESS: Updated existing user to admin: ${email} / ${password}`);
    }

  } catch (error) {
    console.error("Critical Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

createAdmin();
