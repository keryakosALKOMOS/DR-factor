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
    const { status, totalPrice } = await request.json();

    const validStatuses = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Rejected"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const db = adminDb();
    const docRef = db.collection("customOrders").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (status === "Rejected") {
      await docRef.delete();
      return NextResponse.json({ success: true, deleted: true });
    }

    const updateData: any = { status, updatedAt: new Date().toISOString() };
    if (totalPrice !== undefined) {
      updateData.totalPrice = totalPrice;
    }

    await docRef.update(updateData);
    const updatedOrder = { _id: id, ...docSnap.data(), ...updateData };

    const userId = docSnap.data()?.user;
    if (status === "Confirmed" && userId) {
      try {
        await sendNotificationToUser(userId, {
          title: "Custom Order Pricing Confirmed! 🎉",
          body: "Your custom design has been reviewed and priced. Please check your profile to proceed with payment.",
          data: { url: "/profile" },
        });
      } catch (err) {
        console.error("Error sending user notification out:", err);
      }
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
