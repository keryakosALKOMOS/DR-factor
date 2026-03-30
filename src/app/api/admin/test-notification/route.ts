import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { sendNotificationToUser } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Not authorized" }, { status: 401 });
  }

  try {
    const userId = (session.user as any).id;
    
    await sendNotificationToUser(userId.toString(), {
      title: "Test Notification Received! 🔔",
      body: "This is a diagnostic notification to verify that your Android device is correctly registered for push alerts.",
      data: { 
        url: "/admin",
        timestamp: new Date().toISOString()
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Test notification sent successfully." 
    });
  } catch (error: any) {
    console.error("Test notification error:", error);
    return NextResponse.json({ 
      message: "Failed to send test notification",
      error: error.message 
    }, { status: 500 });
  }
}
