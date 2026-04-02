import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";

// GET /api/chat/conversation  → user fetches their own conversation
// POST /api/chat/conversation → user sends a message
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
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
    console.error("GET /api/chat/conversation error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  try {
    const { text } = await request.json();
    if (!text?.trim()) return NextResponse.json({ error: "Empty message" }, { status: 400 });

    const db = adminDb();
    const newMsg = {
      conversationId: userId,
      sender: userId,
      senderName: session.user?.name || "User",
      role: "user",
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

    return NextResponse.json({ message });
  } catch (error) {
    console.error("POST /api/chat/conversation error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
