import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = adminDb();

    // Check if the id is a typical Firestore alphanumeric ID (usually 20 chars but can vary)
    // We can just try to fetch it by ID first, if not found, search by slug.
    let productDoc = await db.collection("products").doc(id).get();
    let productData: any = null;
    let productId = id;

    if (productDoc.exists) {
      productData = productDoc.data();
    } else {
      // Find by slug
      const slugDocs = await db.collection("products").where("slug", "==", id).limit(1).get();
      if (!slugDocs.empty) {
        productDoc = slugDocs.docs[0];
        productData = productDoc.data();
        productId = productDoc.id;
      }
    }

    if (!productData) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    const product = { _id: productId, ...productData };

    // Populate category
    if (product.category) {
      const catDoc = await db.collection("categories").doc(product.category).get();
      if (catDoc.exists) {
        product.category = {
          _id: catDoc.id,
          name: catDoc.data()?.name,
          slug: catDoc.data()?.slug,
        };
      }
    }

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Error fetching product details:", error);
    return NextResponse.json({ message: "Failed to fetch product details" }, { status: 500 });
  }
}
