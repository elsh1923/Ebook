import { NextRequest, NextResponse } from "next/server";
import Book from "@/models/Book";
import { connectDB } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    const query: Record<string, unknown> = {};
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const [books, totalCount] = await Promise.all([
      Book.find(query)
        .select('title author price coverImageUrl description category createdAt')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Book.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    const response = NextResponse.json({
      books,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

    // Add caching headers for better performance
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    
    return response;
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch books", details: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
