const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: ".env.local" });

async function resetAdmin() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error("MONGODB_URI not found in .env.local");
      return;
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    const usersCollection = mongoose.connection.db.collection("users");
    const email = "kero@gmail.com";
    const password = "admin"; // New simple password for the user

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await usersCollection.updateOne(
      { email },
      { 
        $set: { 
          password: hashedPassword,
          role: "admin",
          name: "Admin Kero" // Ensure the name is set
        } 
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      console.log(`SUCCESS: Created new admin user: ${email} with password: ${password}`);
    } else {
      console.log(`SUCCESS: Updated ${email} to ADMIN and reset password to: ${password}`);
    }

  } catch (error) {
    console.error("Error resetting admin:", error);
  } finally {
    await mongoose.disconnect();
  }
}

resetAdmin();
