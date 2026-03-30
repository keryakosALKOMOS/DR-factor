// scripts/seed-admin.mjs
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env.local");
  process.exit(1);
}

const ADMIN_EMAIL = process.argv[2] || "admin@ds.com";
const ADMIN_PASSWORD = process.argv[3] || "admin123456";

async function seedAdmin() {
  try {
    console.log(`Connecting to MongoDB Atlas...`);
    await mongoose.connect(MONGODB_URI);
    
    const db = mongoose.connection.db;
    const usersCollection = db.collection("users");

    // Check if user already exists
    const existingAdmin = await usersCollection.findOne({ email: ADMIN_EMAIL });
    
    if (existingAdmin) {
      console.log(`⚠️ Admin user ${ADMIN_EMAIL} already exists. Upgrading to admin role...`);
      await usersCollection.updateOne(
        { _id: existingAdmin._id },
        { $set: { role: "admin" } }
      );
      console.log("✅ Role updated successfully!");
    } else {
      console.log(`Creating new Admin: ${ADMIN_EMAIL}`);
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
      
      const res = await usersCollection.insertOne({
        name: "DOK-RAN Admin",
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      console.log(`✅ Admin created successfully! ID: ${res.insertedId}`);
    }
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedAdmin();
