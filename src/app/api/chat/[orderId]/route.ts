import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderId } = await params;
  const isAdmin = (session.user as any).role === "admin";
  const userId = (session.user as any).id;

  try {
    const db = adminDb();
    const orderDoc = await db.collection("customOrders").doc(orderId).get();
    if (!orderDoc.exists) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // Only order owner or admin can view messages
    if (!isAdmin && orderDoc.data()?.user !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const snapshot = await db.collection("chatMessages")
      .where("orderId", "==", orderId)
      .orderBy("createdAt", "asc")
      .get();

    const messages = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        _id: doc.id,
        ...data,
        sender: { _id: data.sender, name: data.senderName || "User" },
      };
    });

    return NextResponse.json({ messages });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderId } = await params;
  const isAdmin = (session.user as any).role === "admin";
  const userId = (session.user as any).id;

  try {
    const { text } = await request.json();
    if (!text?.trim()) return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });

    const db = adminDb();
    const orderDoc = await db.collection("customOrders").doc(orderId).get();
    if (!orderDoc.exists) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // Only order owner or admin can send messages
    if (!isAdmin && orderDoc.data()?.user !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const newMsg = {
      orderId,
      sender: userId,
      senderName: session.user?.name || (isAdmin ? "Admin" : "User"),
      role: isAdmin ? "admin" : "user",
      text: text.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection("chatMessages").add(newMsg);
    const message = {
      _id: docRef.id,
      ...newMsg,
      sender: { _id: userId, name: newMsg.senderName },
    };

    // WhatsApp Notification for admin (if message is from user)
    if (!isAdmin) {
      try {
        const messageText = `💬 *New Message From User!*\n\n` +
          `👤 *User:* ${session?.user?.name || "Guest"}\n` +
          `📦 *Order ID:* ${orderId.slice(-6).toUpperCase()}\n` +
          `✉️ *Message:* ${text.trim()}\n\n` +
          `👉 Reply: ${process.env.NEXTAUTH_URL}/admin/chats`;

        const { notifyAdminsViaWhatsApp } = await import("@/lib/notifications");
        await notifyAdminsViaWhatsApp(messageText);
      } catch (err) {
        console.error("Failed to send WhatsApp chat notification:", err);
      }
    }

    return NextResponse.json({ message });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
