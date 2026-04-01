import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { sendWhatsAppMessage } from "@/lib/notifications";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { number } = await request.json();
    if (!number) return NextResponse.json({ error: "No number provided" }, { status: 400 });

    const result = await sendWhatsAppMessage(number, "This is a test message from DOK-RAN! 🚀 \n\nWhatsApp Notifications are now enabled for this number.");
    
    if (result.success) {
      return NextResponse.json({ success: true, message: "Test message sent!" });
    } else {
      const errMsg = result.error instanceof Error ? result.error.message : String(result.error);
      return NextResponse.json({ success: false, message: "Failed to send message: " + errMsg }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
