import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password, phone, address } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Please enter all required fields" }, { status: 400 });
    }

    const db = adminDb();
    const usersRef = db.collection("users");
    
    // Check if user exists
    const existingSnap = await usersRef.where("email", "==", email).limit(1).get();

    if (!existingSnap.empty) {
      return NextResponse.json({ message: "User already exists with this email" }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      name,
      email,
      password: hashedPassword,
      phone: phone || "",
      address: address || "",
      role: "user",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await usersRef.add(newUser);

    return NextResponse.json(
      {
        _id: docRef.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to register user" }, { status: 500 });
  }
}
