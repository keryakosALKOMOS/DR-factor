import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";
import { sendNotificationToAdmins } from "@/lib/notifications";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const { paymentMethod, paymentProofUrl } = await request.json();

    const db = adminDb();
    const docRef = db.collection("customOrders").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    
    const orderData = docSnap.data()!;
    if (orderData.status !== "Confirmed") {
      return NextResponse.json({ error: "Order is not ready for payment" }, { status: 400 });
    }

    const updateData: any = {
      status: "Processing",
      paymentMethod,
      updatedAt: new Date().toISOString(),
    };
    
    if (paymentProofUrl) updateData.paymentProofUrl = paymentProofUrl;
    
    // Auto-mark Paid if it's Credit/Debit Card
    if (paymentMethod === "Credit/Debit Card") {
      updateData.paymentStatus = "Paid";
    }

    await docRef.update(updateData);
    const order = { _id: id, ...orderData, ...updateData };

    // Alert Admins
    try {
      await sendNotificationToAdmins({
        title: "Custom Order Payment Confirmed! 💳",
        body: `Order ${id.slice(-8).toUpperCase()} has been confirmed for processing via ${paymentMethod}.`,
        data: { url: "/admin/custom-orders" },
      });
    } catch (err) {
      console.error("Admin notification failed:", err);
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Checkout custom order error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
