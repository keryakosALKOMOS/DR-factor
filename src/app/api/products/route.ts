import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("category");
    const isFeatured = searchParams.get("isFeatured");

    const db = adminDb();
    
    // Build array of allowed category IDs if category filter exists
    let allowedCategoryIds: string[] = [];
    if (categoryId) {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(categoryId);
      let targetCatId = "";
      
      if (isObjectId) {
        targetCatId = categoryId;
      } else {
        const catDocs = await db.collection("categories").where("slug", "==", categoryId.toLowerCase()).limit(1).get();
        if (!catDocs.empty) {
          targetCatId = catDocs.docs[0].id;
        } else {
          return NextResponse.json([]); // not found
        }
      }

      allowedCategoryIds.push(targetCatId);
      
      // Find subcategories
      const subCats = await db.collection("categories").where("parent", "==", targetCatId).get();
      subCats.docs.forEach(doc => allowedCategoryIds.push(doc.id));
    }

    // Now query products
    let productsRef: any = db.collection("products");
    
    if (isFeatured === "true") {
      productsRef = productsRef.where("isFeatured", "==", true);
    }
    
    if (allowedCategoryIds.length > 0) {
      // Chunk arrays to max 10 to satisfy Firestore 'in' limits
      if (allowedCategoryIds.length <= 10) {
        productsRef = productsRef.where("category", "in", allowedCategoryIds);
      } else {
        // Fallback if there are more than 10 subcategories: fetch all and filter in memory
        // (Just fetching the reference without IN clause)
      }
    }

    const snapshot = await productsRef.get();
    let products = snapshot.docs.map((doc: any) => ({ _id: doc.id, ...doc.data() }));

    // If we couldn't use IN query due to limits, filter here
    if (allowedCategoryIds.length > 10) {
      products = products.filter((p: any) => allowedCategoryIds.includes(p.category));
    }

    // Populate categories
    if (products.length > 0) {
      const allCatIds = [...new Set(products.map((p: any) => p.category))].filter(Boolean);
      const catMap = new Map();
      
      // Fetch each category (in chunks of 10 if needed)
      for (let i = 0; i < allCatIds.length; i += 10) {
        const chunk = allCatIds.slice(i, i + 10);
        const catDocs = await db.collection("categories").where("__name__", "in", chunk).get();
        catDocs.forEach(d => {
          catMap.set(d.id, { _id: d.id, name: d.data().name, slug: d.data().slug });
        });
      }

      products.forEach((p: any) => {
        if (p.category && catMap.has(p.category)) {
          p.category = catMap.get(p.category);
        }
      });
    }

    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 });
    }

    const data = await req.json();
    const db = adminDb();

    const productData = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection("products").add(productData);
    return NextResponse.json({ _id: docRef.id, ...productData }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to create product" }, { status: 400 });
  }
}
