import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";
import { sendNotificationToAdmins } from "@/lib/notifications";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;

  try {
    const body = await request.json();
    const { description, uploadedLogoUrl, uploadedDesignUrl, quantity, shippingAddress } = body;

    if (!description?.trim()) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }
    if (!shippingAddress?.fullName || !shippingAddress?.address || !shippingAddress?.city || !shippingAddress?.country) {
      return NextResponse.json({ error: "Complete shipping address is required" }, { status: 400 });
    }

    const db = adminDb();
    const newOrder: any = {
      user: userId,
      description: description.trim(),
      quantity: quantity || 1,
      shippingAddress,
      totalPrice: 0,
      status: "Pending",
      paymentStatus: "Pending",
      hexColors: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (uploadedLogoUrl) newOrder.uploadedLogoUrl = uploadedLogoUrl;
    if (uploadedDesignUrl) newOrder.uploadedDesignUrl = uploadedDesignUrl;

    const docRef = await db.collection("customOrders").add(newOrder);
    const order = { _id: docRef.id, ...newOrder };

    // Send push notification to admins
    try {
      await sendNotificationToAdmins({
        title: "New Custom Order Received! 🎨",
        body: `A new custom design order has been submitted.`,
        data: { url: "/admin/orders" },
      });

      const message = `🎨 *New Custom Order!*\n\n` +
        `👤 *Customer:* ${session?.user?.name || "Guest"}\n` +
        `📝 *Description:* ${description.trim()}\n` +
        `🔢 *Quantity:* ${quantity || 1}\n` +
        `📍 *Address:* ${shippingAddress.fullName}, ${shippingAddress.city}\n\n` +
        `👉 View custom orders: ${process.env.NEXTAUTH_URL}/admin/custom-orders`;

      const { notifyAdminsViaWhatsApp } = await import("@/lib/notifications");
      await notifyAdminsViaWhatsApp(message);
    } catch (err) {
      console.error("Failed to send admin notification:", err);
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (error: any) {
    console.error("Custom order creation error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const isAdmin = (session.user as any).role === "admin";

  try {
    const db = adminDb();
    let snapshot;
    
    if (isAdmin) {
      snapshot = await db.collection("customOrders").get();
    } else {
      snapshot = await db.collection("customOrders").where("user", "==", userId).get();
    }

    const orders = await Promise.all(snapshot.docs.map(async doc => {
      const data = doc.data();
      let userInfo = { name: "Unknown", email: "" };
      
      if (data.user) {
        const userDoc = await db.collection("users").doc(data.user).get();
        if (userDoc.exists) {
          const userData = userDoc.data()!;
          userInfo = { name: userData.name, email: userData.email };
        }
      }

      return { _id: doc.id, ...data, user: { _id: data.user, ...userInfo } };
    }));

    // Sort in memory to avoid missing index errors
    orders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
