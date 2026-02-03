import { NextRequest, NextResponse } from "next/server";
import {
  downloadFromR2,
  deleteFromR2,
  listR2Objects,
  getPresignedDownloadUrl,
} from "@/lib/cloudflare";

// GET: Download a file or list files
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get("key");
    const prefix = searchParams.get("prefix");
    const presigned = searchParams.get("presigned") === "true";

    // If no key, list files
    if (!key) {
      const files = await listR2Objects(prefix ?? undefined, 100);
      return NextResponse.json({ files });
    }

    // If presigned, return presigned download URL
    if (presigned) {
      const url = await getPresignedDownloadUrl(key, 3600);
      return NextResponse.json({ url });
    }

    // Download file directly
    const { body, contentType } = await downloadFromR2(key);

    if (!body) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    // Return the file as a stream
    return new NextResponse(body as unknown as BodyInit, {
      headers: {
        "Content-Type": contentType ?? "application/octet-stream",
        "Content-Disposition": `attachment; filename="${key.split("/").pop()}"`,
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a file from R2
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { error: "Key is required" },
        { status: 400 }
      );
    }

    await deleteFromR2(key);

    return NextResponse.json({
      success: true,
      message: `File ${key} deleted successfully`,
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
