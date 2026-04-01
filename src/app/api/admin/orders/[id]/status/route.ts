import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";
import { sendNotificationToUser } from "@/lib/notifications";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { status, shippingPrice } = await request.json();

    const db = adminDb();
    const docRef = db.collection("orders").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updateData: any = { updatedAt: new Date().toISOString() };

    if (status) {
      const validStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      if (status === "Cancelled") {
        await docRef.delete();
        return NextResponse.json({ success: true, deleted: true });
      }
      updateData.status = status;
    }

    if (shippingPrice !== undefined) {
      const itemsPrice = docSnap.data()?.itemsPrice || docSnap.data()?.totalPrice || 0;
      updateData.shippingPrice = Number(shippingPrice);
      updateData.totalPrice = itemsPrice + Number(shippingPrice);
    }

    await docRef.update(updateData);
    const updatedOrder = { _id: id, ...docSnap.data(), ...updateData };

    const userId = docSnap.data()?.user;
    if (userId && status) {
      sendNotificationToUser(userId, {
        title: "Order Status Updated",
        body: `Your order status is now: ${status}`,
        data: { url: "/orders" }
      });
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
