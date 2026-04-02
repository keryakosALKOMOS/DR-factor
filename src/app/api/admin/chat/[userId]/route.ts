import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";
import { sendNotificationToUser } from "@/lib/notifications";

// GET /api/admin/chat/[userId]  → admin reads a specific user's conversation
// POST /api/admin/chat/[userId] → admin sends message to that user
export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await params;
  try {
    const db = adminDb();
    const snapshot = await db.collection("chatMessages")
      .where("conversationId", "==", userId)
      .get();

    const messages = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        _id: doc.id,
        ...data,
        sender: { _id: data.sender, name: data.senderName || "User" },
      };
    }).sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("GET /api/admin/chat/[userId] error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminId = (session.user as any).id;
  const { userId } = await params;

  try {
    const { text } = await request.json();
    if (!text?.trim()) return NextResponse.json({ error: "Empty message" }, { status: 400 });

    const db = adminDb();
    const newMsg = {
      conversationId: userId,
      sender: adminId,
      senderName: session.user?.name || "Admin",
      role: "admin",
      text: text.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection("chatMessages").add(newMsg);
    const message = {
      _id: docRef.id,
      ...newMsg,
      sender: { _id: adminId, name: newMsg.senderName },
    };

    // Send push notification to the user
    sendNotificationToUser(userId, {
      title: "New Message from Support",
      body: text.trim().substring(0, 100) + (text.length > 100 ? "..." : ""),
      data: { url: "/custom-design" }
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error("POST /api/admin/chat/[userId] error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
