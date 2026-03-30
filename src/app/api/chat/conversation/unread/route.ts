import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";

// GET /api/chat/conversation/unread → returns count of unread admin messages
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ count: 0 });

  const userId = (session.user as any).id;
  try {
    const db = adminDb();
    // Count messages from admin in this conversation
    const snapshot = await db.collection("chatMessages")
      .where("conversationId", "==", userId)
      .where("role", "==", "admin")
      .get();

    return NextResponse.json({ count: snapshot.size });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
