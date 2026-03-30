import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 });
    }

    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ message: "Token is required" }, { status: 400 });
    }

    const userId = (session.user as any).id;
    const db = adminDb();
    
    // Add the token using arrayUnion
    await db.collection("users").doc(userId).update({
      fcmTokens: FieldValue.arrayUnion(token)
    });

    return NextResponse.json({ success: true, message: "FCM Token registered successfully." });
  } catch (error: any) {
    console.error("FCM Registration error:", error);
    return NextResponse.json({ message: "Failed to register FCM token" }, { status: 500 });
  }
}
