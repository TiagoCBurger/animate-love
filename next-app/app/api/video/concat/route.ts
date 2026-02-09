import { NextRequest, NextResponse } from "next/server";
import {
  createPlaylist,
  concatenateVideosWithFfmpeg,
  createVideoManifest,
  isFfmpegAvailable,
  type VideoSegment,
} from "@/lib/video";

/**
 * POST /api/video/concat
 * Concatenate multiple videos into one
 *
 * Body:
 * - action: "concat" | "playlist" | "manifest"
 * - videos: Array<{ url: string, duration?: number }>
 * - userId?: string (for manifest action)
 * - outputKey?: string (for concat action)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action = "playlist", videos, userId, outputKey } = body;

    if (!videos || !Array.isArray(videos) || videos.length === 0) {
      return NextResponse.json(
        { error: "videos array is required with at least one item" },
        { status: 400 }
      );
    }

    // Validate video segments
    const validatedVideos: VideoSegment[] = videos.map((v: VideoSegment) => ({
      url: v.url,
      duration: v.duration || 5,
    }));

    switch (action) {
      case "playlist": {
        // Create a simple playlist for sequential playback
        const playlist = createPlaylist(validatedVideos);

        return NextResponse.json({
          success: true,
          ...playlist,
        });
      }

      case "manifest": {
        // Create a video manifest and upload to R2
        if (!userId) {
          return NextResponse.json(
            { error: "userId is required for manifest action" },
            { status: 400 }
          );
        }

        const manifest = await createVideoManifest(validatedVideos, userId);

        return NextResponse.json({
          success: true,
          ...manifest,
        });
      }

      case "concat": {
        // Check if ffmpeg is available
        const ffmpegAvailable = await isFfmpegAvailable();

        if (!ffmpegAvailable) {
          return NextResponse.json(
            {
              error: "Server-side video concatenation not available",
              suggestion: "Use 'playlist' or 'manifest' action instead",
            },
            { status: 501 }
          );
        }

        // Generate output key if not provided
        const finalOutputKey =
          outputKey || `videos/concat/${Date.now()}_merged.mp4`;

        const result = await concatenateVideosWithFfmpeg(
          validatedVideos.map((v) => v.url),
          finalOutputKey
        );

        return NextResponse.json({
          success: true,
          ...result,
        });
      }

      default:
        return NextResponse.json(
          {
            error: "Invalid action",
            validActions: ["concat", "playlist", "manifest"],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Video concatenation error:", error);
    return NextResponse.json(
      {
        error: "Video concatenation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/video/concat?action=check
 * Check if server-side concatenation is available
 */
export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get("action");

  if (action === "check") {
    const ffmpegAvailable = await isFfmpegAvailable();

    return NextResponse.json({
      success: true,
      ffmpegAvailable,
      recommendation: ffmpegAvailable
        ? "Server-side concatenation available"
        : "Use client-side playlist or manifest for video playback",
    });
  }

  return NextResponse.json(
    { error: "Invalid action" },
    { status: 400 }
  );
}
