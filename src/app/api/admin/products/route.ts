import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    const db = adminDb();
    const snapshot = await db.collection("products").orderBy("createdAt", "desc").get();
    let products = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));

    if (products.length > 0) {
      const allCatIds = [...new Set(products.map((p: any) => p.category))].filter(Boolean);
      const catMap = new Map();
      
      for (let i = 0; i < allCatIds.length; i += 10) {
        const chunk = allCatIds.slice(i, i + 10);
        const catDocs = await db.collection("categories").where("__name__", "in", chunk).get();
        catDocs.forEach(d => {
          catMap.set(d.id, { _id: d.id, name: d.data().name });
        });
      }

      products.forEach((p: any) => {
        if (p.category && catMap.has(p.category)) {
          p.category = catMap.get(p.category);
        }
      });
    }

    return NextResponse.json({ products });
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
    const body = await request.json();
    const { name, description, price, category, stock, sizes, colors, images, isFeatured } = body;
    if (!name || !description || !price || !category) {
      return NextResponse.json({ error: "Name, description, price and category are required" }, { status: 400 });
    }
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "") + "-" + Date.now();
    
    const db = adminDb();
    const newProduct = {
      name,
      slug,
      description,
      price: Number(price),
      category,
      stock: Number(stock) || 0,
      sizes: sizes || [],
      colors: colors || [],
      images: images || [],
      isFeatured: isFeatured || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await db.collection("products").add(newProduct);
    
    return NextResponse.json({ success: true, product: { _id: docRef.id, ...newProduct } }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
