import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

const initializeFirebaseAdmin = () => {
  if (!getApps().length) {
    try {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
        : undefined;

      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID || "dr-factor-4a824",
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
      });
      console.log("Firebase Admin initialized successfully.");
    } catch (error) {
      console.error("Firebase Admin initialization error:", error);
    }
  }
};

initializeFirebaseAdmin();

export const adminDb = getFirestore;
export const adminMessaging = getMessaging;
