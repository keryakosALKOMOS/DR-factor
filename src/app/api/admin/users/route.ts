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
    const usersSnapshot = await db.collection("users").orderBy("createdAt", "desc").get();
    
    const users = usersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        _id: doc.id,
        name: data.name,
        email: data.email,
        role: data.role,
        createdAt: data.createdAt,
      };
    });

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
