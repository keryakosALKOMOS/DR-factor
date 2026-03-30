require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

async function makeLastUserAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // We can't easily require the TypeScript model in raw Node without ts-node, 
    // so we access the DB directly using raw Mongoose schemas or native collections.
    const db = mongoose.connection.db;
    const usersCollection = db.collection("users");
    
    const lastUser = await usersCollection.find().sort({ createdAt: -1 }).limit(1).toArray();
    
    if (lastUser && lastUser.length > 0) {
      const user = lastUser[0];
      await usersCollection.updateOne({ _id: user._id }, { $set: { role: "admin" } });
      console.log(`SUCCESS: User ${user.email} has been upgraded to ADMIN!`);
    } else {
      console.log("No users found in the database. Please register first.");
    }
  } catch (error) {
    console.error("Error updating user:", error);
  } finally {
    await mongoose.disconnect();
  }
}

makeLastUserAdmin();
