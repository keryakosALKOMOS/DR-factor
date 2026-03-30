import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    const db = adminDb();
    const snapshot = await db.collection("categories").get();
    
    // Manual "populate"
    const catsMap = new Map();
    const categories: any[] = [];
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const cat = { _id: doc.id, ...data };
      catsMap.set(doc.id, cat);
      categories.push(cat);
    });

    // Populate parent
    categories.forEach(cat => {
      if (cat.parent && catsMap.has(cat.parent)) {
        const parentData = catsMap.get(cat.parent);
        cat.parent = {
          _id: parentData._id,
          name: parentData.name,
          slug: parentData.slug
        };
      } else {
        cat.parent = null;
      }
    });

    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 });
    }

    const { name, slug, parent } = await req.json();
    const db = adminDb();

    const newCategory = {
      name,
      slug,
      parent: parent || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection("categories").add(newCategory);
    return NextResponse.json({ _id: docRef.id, ...newCategory }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to create category" }, { status: 400 });
  }
}
