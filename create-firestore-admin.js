const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: ".env.local" });

async function createFirestoreAdmin() {
  try {
    if (!getApps().length) {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
        : undefined;

      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID || "dr-factor",
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
      });
    }

    const db = getFirestore();
    const email = "admin@gmail.com";
    const password = "admin";
    const hashedPassword = await bcrypt.hash(password, 10);

    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("email", "==", email).get();

    if (!snapshot.empty) {
      const docId = snapshot.docs[0].id;
      await usersRef.doc(docId).update({
        password: hashedPassword,
        role: "admin",
        updatedAt: new Date().toISOString()
      });
      console.log(`SUCCESS: Updated existing Firestore user to admin: ${email} / ${password}`);
    } else {
      await usersRef.add({
        name: "Admin User",
        email,
        password: hashedPassword,
        role: "admin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log(`SUCCESS: Created new Firestore admin: ${email} / ${password}`);
    }
  } catch (error) {
    console.error("Critical Error:", error);
  }
}

createFirestoreAdmin();
