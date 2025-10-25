import { NextResponse } from "next/server";
import cloudinary from "cloudinary";

// Configure Cloudinary with environment variables
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    // Get file data (Base64 encoded) and folder from frontend
    const { data, folder } = await req.json();

    // Upload to Cloudinary
    const uploadedResponse = await cloudinary.v2.uploader.upload(data, {
      folder: folder || "ebooks", // Use provided folder or default to ebooks
      resource_type: "raw", // Auto-detects file type (PDF, image, etc)
      access_mode: "public", // Make files publicly accessible
      type: "upload", // Ensure it's an upload type
    });

    // Return uploaded file URL
    return NextResponse.json({
      success: true,
      url: uploadedResponse.secure_url,
    });
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    return NextResponse.json(
      { success: false, message: "Upload failed", error: error.message },
      { status: 500 }
    );
  }
}
