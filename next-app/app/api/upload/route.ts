import { NextRequest, NextResponse } from "next/server";
import {
  uploadFileToR2,
  generateUniqueKey,
  getPresignedUploadUrl,
} from "@/lib/cloudflare";

// POST: Upload a file directly to R2
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = formData.get("folder") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Generate unique key
    const key = generateUniqueKey(file.name, folder ?? "uploads");

    // Upload to R2
    const result = await uploadFileToR2(file, key);

    return NextResponse.json({
      success: true,
      key: result.key,
      url: result.url,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

// GET: Generate a presigned URL for direct upload
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filename = searchParams.get("filename");
    const contentType = searchParams.get("contentType") || "application/octet-stream";
    const folder = searchParams.get("folder");

    if (!filename) {
      return NextResponse.json(
        { error: "Filename is required" },
        { status: 400 }
      );
    }

    // Generate unique key
    const key = generateUniqueKey(filename, folder ?? "uploads");

    // Generate presigned URL (valid for 1 hour)
    const presignedUrl = await getPresignedUploadUrl(key, contentType, 3600);

    return NextResponse.json({
      key,
      presignedUrl,
    });
  } catch (error) {
    console.error("Presigned URL error:", error);
    return NextResponse.json(
      { error: "Failed to generate presigned URL" },
      { status: 500 }
    );
  }
}
