import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = adminDb();
    const snapshot = await db.collection("orders").orderBy("createdAt", "desc").get();

    const orders = await Promise.all(snapshot.docs.map(async doc => {
      const data = doc.data();
      let userInfo = { name: "Unknown", email: "" };
      
      if (data.user) {
        const userDoc = await db.collection("users").doc(data.user).get();
        if (userDoc.exists) {
          const userData = userDoc.data()!;
          userInfo = { name: userData.name, email: userData.email };
        }
      }

      return { _id: doc.id, ...data, user: { _id: data.user, ...userInfo } };
    }));

    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
