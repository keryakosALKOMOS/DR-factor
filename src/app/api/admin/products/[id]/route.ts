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
    await db.collection("products").doc(id).delete();
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
    const body = await req.json();
    const { name, description, price, category, stock, sizes, colors, images, isFeatured } = body;

    const updateData: any = {
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
      sizes,
      colors,
      images,
      isFeatured,
      updatedAt: new Date().toISOString()
    };

    // Update slug if name changed
    if (name) {
      updateData.slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "") + "-" + Date.now();
    }

    const db = adminDb();
    const docRef = db.collection("products").doc(id);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await docRef.update(updateData);
    const updatedProduct = { _id: id, ...(await docRef.get()).data() };

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
