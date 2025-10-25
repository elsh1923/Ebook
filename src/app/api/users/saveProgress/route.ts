import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import Book from "@/models/Book";
import ReadingProgress from "@/models/ReadingProgress";
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

    const userId = (decoded as { userId: string }).userId;

    // Parse request body
    const { bookId, currentPage, totalPages, readingTime } = await req.json();

    if (!bookId || !currentPage || !totalPages) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Check if user has purchased this book
    const hasPurchased = user.purchasedBooks.includes(book._id);
    if (!hasPurchased) {
      return NextResponse.json({ error: "You haven't purchased this book" }, { status: 403 });
    }

    // Update or create reading progress
    const progress = await ReadingProgress.findOneAndUpdate(
      { userId, bookId },
      {
        currentPage,
        totalPages,
        readingTime: readingTime || 0,
        lastReadAt: new Date(),
      },
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true
      }
    );

    return NextResponse.json({
      success: true,
      progress: {
        currentPage: progress.currentPage,
        totalPages: progress.totalPages,
        readingTime: progress.readingTime,
        lastReadAt: progress.lastReadAt,
      }
    });
  } catch (error: unknown) {
    console.error("Save progress API error:", error);
    return NextResponse.json(
      { error: "Failed to save progress", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
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

    const userId = (decoded as { userId: string }).userId;

    // Get bookId from query params
    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get('bookId');

    if (!bookId) {
      return NextResponse.json({ error: "Book ID is required" }, { status: 400 });
    }

    // Get reading progress
    const progress = await ReadingProgress.findOne({ userId, bookId });

    if (!progress) {
      return NextResponse.json({
        success: true,
        progress: null
      });
    }

    return NextResponse.json({
      success: true,
      progress: {
        currentPage: progress.currentPage,
        totalPages: progress.totalPages,
        readingTime: progress.readingTime,
        lastReadAt: progress.lastReadAt,
      }
    });
  } catch (error: unknown) {
    console.error("Get progress API error:", error);
    return NextResponse.json(
      { error: "Failed to get progress", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

