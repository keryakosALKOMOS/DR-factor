import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = adminDb();

    // Get all users with role "user"
    const usersSnapshot = await db.collection("users").where("role", "==", "user").get();

    const enrichedUsers = await Promise.all(usersSnapshot.docs.map(async userDoc => {
      const u = { _id: userDoc.id, ...userDoc.data() };
      
      // Get last message for this user
      const lastMsgSnap = await db.collection("chatMessages")
        .where("conversationId", "==", userDoc.id)
        .orderBy("createdAt", "desc")
        .limit(1)
        .get();

      const unreadSnap = await db.collection("chatMessages")
        .where("conversationId", "==", userDoc.id)
        .where("role", "==", "user")
        .get();

      const lastMessage = lastMsgSnap.empty ? null : {
        _id: lastMsgSnap.docs[0].id,
        ...lastMsgSnap.docs[0].data()
      };

      return {
        ...u,
        lastMessage,
        unreadCount: unreadSnap.size
      };
    }));

    // Sort by last message date
    enrichedUsers.sort((a, b) => {
      const dateA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt as string).getTime() : 0;
      const dateB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt as string).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json({ users: enrichedUsers });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
