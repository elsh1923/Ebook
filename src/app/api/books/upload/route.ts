import { NextRequest, NextResponse } from "next/server";
import Book from "@/models/Book";
import { connectDB } from "@/lib/mongodb";
import { getUserFromToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Get token from headers
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    const user = getUserFromToken(token);

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Not authorized, admin only" }, { status: 403 });
    }

    const { title, author, description, price, fileUrl, coverImageUrl, category } = await req.json();

    const book = new Book({
      title,
      author,
      description,
      price,
      fileUrl,
      coverImageUrl,
      category,
      uploadedBy: user.id,
    });

    await book.save();

    return NextResponse.json({ message: "Book uploaded successfully", book });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ error: "Failed to upload book", details: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
