import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const data = await req.json();
    const db = adminDb();

    const newOrder = {
      user: (session.user as any).id,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection("customOrders").add(newOrder);
    return NextResponse.json({ _id: docRef.id, ...newOrder }, { status: 201 });
  } catch (error: any) {
    console.error("Custom Order creation error:", error);
    return NextResponse.json({ message: error.message || "Failed to create custom order" }, { status: 400 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const db = adminDb();
    const userId = (session.user as any).id;
    const snapshot = await db.collection("customOrders").where("user", "==", userId).orderBy("createdAt", "desc").get();

    const orders = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to fetch custom orders" }, { status: 500 });
  }
}
