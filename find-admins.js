require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

async function findAdmins() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const usersCollection = db.collection("users");
    
    const admins = await usersCollection.find({ role: "admin" }).project({ email: 1, name: 1, role: 1 }).toArray();
    
    console.log("=== ADMIN ACCOUNTS ===");
    if (admins.length > 0) {
      admins.forEach(admin => {
        console.log(`Name: ${admin.name} | Email: ${admin.email}`);
      });
    } else {
      console.log("No admin accounts found in the database. You will need to create one.");
    }
  } catch (error) {
    console.error("Error finding admins:", error);
  } finally {
    await mongoose.disconnect();
  }
}

findAdmins();
