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
    const { status } = await request.json();

    const validStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const db = adminDb();
    const docRef = db.collection("orders").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (status === "Cancelled") {
      await docRef.delete();
      return NextResponse.json({ success: true, deleted: true });
    }

    await docRef.update({ status, updatedAt: new Date().toISOString() });
    const updatedOrder = { _id: id, ...docSnap.data(), status };

    const userId = docSnap.data()?.user;
    if (userId) {
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
