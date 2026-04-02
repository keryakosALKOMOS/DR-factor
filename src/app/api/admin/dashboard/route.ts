import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = adminDb();

    const [usersSnap, ordersSnap, customOrdersSnap] = await Promise.all([
      db.collection("users").get(),
      db.collection("orders").get(),
      db.collection("customOrders").get(),
    ]);

    const userCount = usersSnap.size;
    const standardOrdersCount = ordersSnap.size;
    const customOrdersCount = customOrdersSnap.size;

    // Calculate revenues
    let standardRevenue = 0;
    ordersSnap.docs.forEach(doc => {
      const data = doc.data();
      // Count revenue for standard orders that are not cancelled
      if (data.status !== "Cancelled") {
        standardRevenue += Number(data.totalPrice) || 0;
      }
    });

    let customRevenue = 0;
    customOrdersSnap.docs.forEach(doc => {
      const data = doc.data();
      // Count revenue for custom orders that are not rejected/cancelled
      if (data.status !== "Rejected" && data.status !== "Cancelled") {
        customRevenue += Number(data.totalPrice) || 0;
      }
    });

    const totalRevenue = standardRevenue + customRevenue;

    // Recent orders (last 5)
    const recentOrdersSnap = await db.collection("orders").orderBy("createdAt", "desc").limit(5).get();
    const recentOrders = await Promise.all(recentOrdersSnap.docs.map(async doc => {
      const data = doc.data();
      let userInfo = { name: "Unknown", email: "" };
      if (data.user) {
        const userDoc = await db.collection("users").doc(data.user).get();
        if (userDoc.exists) {
          userInfo = { name: userDoc.data()!.name, email: userDoc.data()!.email };
        }
      }
      return { _id: doc.id, ...data, user: { _id: data.user, ...userInfo } };
    }));

    // Recent custom orders (last 5)
    const recentCustomSnap = await db.collection("customOrders").orderBy("createdAt", "desc").limit(5).get();
    const recentCustomOrders = await Promise.all(recentCustomSnap.docs.map(async doc => {
      const data = doc.data();
      let userInfo = { name: "Unknown", email: "" };
      if (data.user) {
        const userDoc = await db.collection("users").doc(data.user).get();
        if (userDoc.exists) {
          userInfo = { name: userDoc.data()!.name, email: userDoc.data()!.email };
        }
      }
      return { _id: doc.id, ...data, user: { _id: data.user, ...userInfo } };
    }));

    // Count pending custom orders
    const newCustomSnap = await db.collection("customOrders").where("status", "==", "Pending").get();
    const newCustomCount = newCustomSnap.size;

    return NextResponse.json({
      userCount,
      standardOrdersCount,
      customOrdersCount,
      totalRevenue,
      recentOrders,
      recentCustomOrders,
      newCustomCount,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
