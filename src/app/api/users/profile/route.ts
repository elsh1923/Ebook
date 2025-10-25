import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import Book from "@/models/Book"; // ✅ MUST be imported to register schema
import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    
    if (!decoded || typeof decoded === "string") {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = await User.findById((decoded as { userId: string }).userId)
      .populate("purchasedBooks");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      purchasedBooks: user.purchasedBooks,
    });
  } catch (error: unknown) {
    console.error("Profile API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
