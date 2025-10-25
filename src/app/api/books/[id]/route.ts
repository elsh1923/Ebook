import { NextRequest, NextResponse } from "next/server";
import Book from "@/models/Book";
import { connectDB } from "@/lib/mongodb";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const book = await Book.findById(id);
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    return NextResponse.json(book);
  } catch (error: unknown) {
    console.error("Book details API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch book details", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
