import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized — Only admins can create admin accounts." }, { status: 401 });
  }

  try {
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
    }

    const db = adminDb();
    const usersRef = db.collection("users");

    const existingSnap = await usersRef.where("email", "==", email).limit(1).get();
    if (!existingSnap.empty) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    const newUser = {
      name,
      email,
      password: hashedPassword,
      role: role === "admin" ? "admin" : "user",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await usersRef.add(newUser);

    return NextResponse.json({ success: true, user: { id: docRef.id, name: newUser.name, email: newUser.email, role: newUser.role } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
