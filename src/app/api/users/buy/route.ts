import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import Book from "@/models/Book";
import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    
    if (!decoded || typeof decoded === 'string') {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { userId, bookId } = await req.json();

    // Verify that the userId matches the token
    if ((decoded as { userId: string }).userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const book = await Book.findById(bookId);
    if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

    // Check if already purchased
    if (user.purchasedBooks.includes(bookId)) {
      return NextResponse.json({ message: "Book already purchased", book });
    }

    // Add book to user's purchased books
    user.purchasedBooks.push(bookId);
    await user.save();

    return NextResponse.json({ 
      message: "Book purchased successfully", 
      book: {
        _id: book._id,
        title: book.title,
        author: book.author,
        price: book.price,
        coverImageUrl: book.coverImageUrl,
        fileUrl: book.fileUrl,
        description: book.description,
        category: book.category,
        createdAt: book.createdAt
      }
    });
  } catch (error: unknown) {
    console.error("Buy API error:", error);
    return NextResponse.json({ 
      error: "Failed to purchase book", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
