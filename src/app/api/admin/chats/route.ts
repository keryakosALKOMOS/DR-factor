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

    // Get all users (except admins)
    const usersSnapshot = await db.collection("users").get();
    
    // Filter users to only include those who are not admins
    const docs = usersSnapshot.docs.filter(doc => doc.data().role !== "admin");

    const enrichedUsers = await Promise.all(docs.map(async userDoc => {
      const userData = userDoc.data();
      const u = { _id: userDoc.id, ...userData };
      
      // Get last message for this user
      const lastMsgSnap = await db.collection("chatMessages")
        .where("conversationId", "==", userDoc.id)
        .get();
      
      const allMessages = lastMsgSnap.docs.map(d => ({ _id: d.id, ...d.data() as any }));
      // Sort manually to find the last message
      allMessages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const lastMessage = allMessages.length > 0 ? allMessages[0] : null;

      const unreadCount = allMessages.filter(m => m.role === "user").length;

      return {
        ...u,
        lastMessage,
        unreadCount
      };
    }));

    // Sort by last message date
    enrichedUsers.sort((a, b) => {
      const dateA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt as any).getTime() : 0;
      const dateB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt as any).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json({ users: enrichedUsers });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
