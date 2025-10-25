import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import mongoose from "mongoose";
import cloudinary from "cloudinary";
import User from "@/models/User";
import Book from "@/models/Book";
import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/lib/jwt";

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Get token from header or query
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : new URL(req.url).searchParams.get("token");

    if (!token) return NextResponse.json({ error: "No token provided" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || typeof decoded === "string") {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = (decoded as { userId: string }).userId;

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const book = await Book.findById(id);
    if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

    // Convert book ID to ObjectId for proper comparison
    const bookObjectId = new mongoose.Types.ObjectId(id);
    const hasPurchased = user.purchasedBooks.some((purchasedBookId: mongoose.Types.ObjectId) => 
      purchasedBookId.toString() === bookObjectId.toString()
    );

    if (!hasPurchased) {
      return NextResponse.json({ error: "You haven't purchased this book" }, { status: 403 });
    }

    // Check if fileUrl is a Cloudinary URL or local file
    if (book.fileUrl.startsWith('http')) {
      // Handle Cloudinary URL - use Cloudinary API to download directly
      try {
        // Extract public ID from Cloudinary URL
        const urlParts = book.fileUrl.split('/');
        const publicId = urlParts[urlParts.length - 1].split('.')[0];
        const folder = urlParts[urlParts.length - 2];
        const fullPublicId = `${folder}/${publicId}`;
        
        console.log("Attempting to download PDF from Cloudinary:");
        console.log("- Public ID:", fullPublicId);
        console.log("- Original URL:", book.fileUrl);

        // Use Cloudinary API to download the file directly
        const result = await cloudinary.v2.api.resource(fullPublicId, {
          resource_type: 'raw'
        });

        // If the resource exists, try to download it using the secure URL
        const secureUrl = cloudinary.v2.url(fullPublicId, {
          resource_type: 'raw',
          secure: true,
          sign_url: true
        });

        console.log("Generated secure URL:", secureUrl);

        // Try to fetch using the secure URL
        const response = await fetch(secureUrl);
        if (!response.ok) {
          console.error("Failed to fetch with secure URL, trying direct URL");
          // Fallback: try the original URL
          const directResponse = await fetch(book.fileUrl);
          if (!directResponse.ok) {
            throw new Error(`Failed to fetch PDF from Cloudinary: ${response.status}`);
          }
          const pdfBuffer = await directResponse.arrayBuffer();
          const uint8Array = new Uint8Array(pdfBuffer);

          const headers = new Headers();
          headers.set("Content-Type", "application/pdf");
          headers.set("Content-Disposition", `inline; filename="${book.title}.pdf"`);
          headers.set("Content-Length", uint8Array.byteLength.toString());
          headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate");

          return new Response(uint8Array, { status: 200, headers });
        }
        
        const pdfBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(pdfBuffer);

        const headers = new Headers();
        headers.set("Content-Type", "application/pdf");
        headers.set("Content-Disposition", `inline; filename="${book.title}.pdf"`);
        headers.set("Content-Length", uint8Array.byteLength.toString());
        headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate");

        return new Response(uint8Array, { status: 200, headers });
      } catch (error) {
        console.error("Error fetching PDF from Cloudinary:", error);
        return NextResponse.json({ error: "Failed to fetch PDF from Cloudinary" }, { status: 500 });
      }
    } else {
      // Handle local file (fallback for existing books)
      const fileName = book.fileUrl.split("/").pop() || "";
      const filePath = join(process.cwd(), "public", "uploads", "books", fileName);

      const fileBuffer = await readFile(filePath);

      // ✅ Convert Node Buffer to Uint8Array for Response body
      const uint8Array = new Uint8Array(fileBuffer);

      const headers = new Headers();
      headers.set("Content-Type", "application/pdf");
      headers.set("Content-Disposition", `inline; filename="${book.title}.pdf"`);
      headers.set("Content-Length", uint8Array.byteLength.toString());
      headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate");

      return new Response(uint8Array, { status: 200, headers });
    }
  } catch (error: unknown) {
    console.error("PDF route error:", error);
    return NextResponse.json(
      { error: "Failed to serve book", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
