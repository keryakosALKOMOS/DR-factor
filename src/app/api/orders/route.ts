import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { sendNotificationToAdmins } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { orderItems, shippingAddress, paymentMethod, totalPrice, notes, paymentProof, itemsPrice, shippingPrice } = body;

    if (!orderItems || orderItems.length === 0) {
      return NextResponse.json({ message: "No order items" }, { status: 400 });
    }

    const db = adminDb();
    const newOrder = {
      user: (session.user as any).id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice: itemsPrice || totalPrice,
      shippingPrice: shippingPrice || 0,
      totalPrice: totalPrice,
      notes: notes || "",
      paymentProof: paymentProof || "",
      isPaid: false,
      isDelivered: false,
      status: "Pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection("orders").add(newOrder);
    const createdOrder = { _id: docRef.id, ...newOrder };

    // Send push notification to admins
    try {
      await sendNotificationToAdmins({
        title: "New Order Received! 🛍️",
        body: `A new order has been placed for ${totalPrice} ج.م.`,
        data: { url: "/admin/orders" },
      });

      const itemsList = orderItems.map((item: any) => `- ${item.name} (${item.quantity})`).join("\n");
      const message = `🛍️ *New Order Received!*\n\n` +
        `👤 *Customer:* ${session?.user?.name || "Guest"}\n` +
        `💰 *Total:* ${totalPrice} EGP\n` +
        `📍 *Address:* ${shippingAddress.address}, ${shippingAddress.city}\n\n` +
        `📦 *Items:*\n${itemsList}\n\n` +
        `📝 *Notes:* ${notes || "None"}\n\n` +
        `👉 View order: ${process.env.NEXTAUTH_URL}/admin/orders`;

      const { notifyAdminsViaWhatsApp } = await import("@/lib/notifications");
      await notifyAdminsViaWhatsApp(message);
    } catch (err) {
      console.error("Failed to send admin notification:", err);
    }

    return NextResponse.json(createdOrder, { status: 201 });
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json({ message: error.message || "Failed to create order" }, { status: 400 });
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
    const snapshot = await db.collection("orders").where("user", "==", userId).get();

    const orders = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    // Sort in memory to avoid missing index errors
    orders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to fetch orders" }, { status: 500 });
  }
}
