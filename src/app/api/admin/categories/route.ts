import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    const db = adminDb();
    const snapshot = await db.collection("categories").orderBy("name").get();
    
    const catsMap = new Map();
    const categories: any[] = [];
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const cat = { _id: doc.id, ...data };
      catsMap.set(doc.id, cat);
      categories.push(cat);
    });

    categories.forEach(cat => {
      if (cat.parent && catsMap.has(cat.parent)) {
        cat.parent = {
          _id: catsMap.get(cat.parent)._id,
          name: catsMap.get(cat.parent).name,
        };
      } else {
        cat.parent = null;
      }
    });

    return NextResponse.json({ categories });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { name, parent } = await request.json();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
    
    const db = adminDb();
    const existingSnap = await db.collection("categories").where("slug", "==", slug).limit(1).get();
    
    if (!existingSnap.empty) return NextResponse.json({ error: "Category with this name already exists" }, { status: 409 });

    const newCat = {
      name,
      slug,
      parent: parent || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await db.collection("categories").add(newCat);
    return NextResponse.json({ success: true, category: { _id: docRef.id, ...newCat } }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
