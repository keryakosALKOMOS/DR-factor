import { adminMessaging, adminDb } from "./firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

type NotificationPayload = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

export async function sendNotificationToUser(userId: string, payload: NotificationPayload) {
  try {
    const db = adminDb();
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      console.log(`User ${userId} not found`);
      return;
    }

    const fcmTokens: string[] = userDoc.data()?.fcmTokens || [];

    if (fcmTokens.length === 0) {
      console.log(`No tokens found for user ${userId}`);
      return;
    }

    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
      tokens: fcmTokens,
    };

    const response = await adminMessaging().sendEachForMulticast(message);
    console.log(`Successfully sent ${response.successCount} messages to user ${userId}`);

    // Clean up stale tokens
    if (response.failureCount > 0) {
      const failedTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(fcmTokens[idx]);
        }
      });
      console.log(`Cleaning up ${failedTokens.length} stale tokens for user ${userId}`);
      await db.collection("users").doc(userId).update({
        fcmTokens: FieldValue.arrayRemove(...failedTokens)
      });
    }
  } catch (error) {
    console.error("Error sending notification to user:", error);
  }
}

export async function sendNotificationToAdmins(payload: NotificationPayload) {
  try {
    const db = adminDb();
    const adminsSnap = await db.collection("users").where("role", "==", "admin").get();

    let allTokens: string[] = [];
    adminsSnap.docs.forEach(doc => {
      const tokens: string[] = doc.data()?.fcmTokens || [];
      allTokens.push(...tokens);
    });

    if (allTokens.length === 0) {
      console.log("No FCM tokens found for admins.");
      return;
    }

    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
      tokens: allTokens,
    };

    const response = await adminMessaging().sendEachForMulticast(message);
    console.log(`Successfully sent ${response.successCount} messages to admins.`);
  } catch (error) {
    console.error("Error sending notification to admins:", error);
  }
}

/**
 * Sends a WhatsApp message using a third-party service (e.g., Ultramsg, Twilio, CallMeBot)
 */
export async function sendWhatsAppMessage(to: string, message: string) {
  try {
    const apiUrl = process.env.WHATSAPP_API_URL;
    const apiToken = process.env.WHATSAPP_API_TOKEN;
    const instanceId = process.env.WHATSAPP_INSTANCE_ID;

    if (!apiUrl || (!apiToken && !instanceId)) {
      console.warn("WhatsApp API configuration missing. Skip sending message.");
      return { success: false, error: "Configuration missing" };
    }

    const url = apiUrl.replace("{instance_id}", instanceId || "");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        token: apiToken || "",
        to: to,
        body: message,
      }),
      signal: AbortSignal.timeout(5000),
    });

    const data = await response.json();
    console.log("WhatsApp API Response:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return { success: false, error };
  }
}

/**
 * Fetches admin WhatsApp settings and sends a notification if enabled.
 */
export async function notifyAdminsViaWhatsApp(message: string) {
  try {
    const db = adminDb();
    const docSnap = await db.collection("settings").doc("payment").get();
    const settings = docSnap.data();

    if (!settings || !settings.whatsAppNotificationsEnabled || !settings.adminWhatsAppNumber) {
      console.log("WhatsApp notifications are disabled or no number is set.");
      return;
    }

    console.log(`Sending WhatsApp notification to ${settings.adminWhatsAppNumber}`);
    await sendWhatsAppMessage(settings.adminWhatsAppNumber, message);
  } catch (error) {
    console.error("Error notifying admins via WhatsApp:", error);
  }
}
