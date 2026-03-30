import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const db = adminDb();
    await db.collection("categories").doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const { name, parent } = await req.json();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
    
    const db = adminDb();
    const docRef = db.collection("categories").doc(id);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    await docRef.update({
      name,
      slug,
      parent: parent || null,
      updatedAt: new Date().toISOString()
    });

    const updatedData = { _id: id, ...(await docRef.get()).data() };

    return NextResponse.json({ success: true, category: updatedData });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
