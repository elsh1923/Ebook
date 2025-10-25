import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI not found in environment variables");
    }

    // Connect to MongoDB (only once per server runtime)
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri);
    }

    return NextResponse.json({ message: "✅ MongoDB connection successful!" });
  } catch (error: unknown) {
    console.error("MongoDB connection error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { message: "❌ MongoDB connection failed", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
