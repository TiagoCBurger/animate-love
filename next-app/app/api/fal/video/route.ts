import { NextRequest, NextResponse } from "next/server";
import {
  generateVideoFromImage,
  submitVideoGeneration,
  checkVideoStatus,
  getVideoResult,
  VIDEO_MODELS,
  VideoModel,
} from "@/lib/fal";

/**
 * POST /api/fal/video
 * Generate a video from images
 *
 * Body:
 * - action: "generate" | "submit" | "status" | "result"
 * - imageUrl: string (for generate/submit)
 * - prompt: string (for generate/submit)
 * - model?: VideoModel (default: "framepack")
 * - requestId?: string (for status/result)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      action = "generate",
      imageUrl,
      prompt,
      negativePrompt,
      aspectRatio = "16:9",
      numFrames = 120,
      model = "framepack",
      requestId,
    } = body;

    // Validate model
    if (model && !VIDEO_MODELS[model as VideoModel]) {
      return NextResponse.json(
        { error: "Invalid model", availableModels: Object.keys(VIDEO_MODELS) },
        { status: 400 }
      );
    }

    switch (action) {
      case "generate": {
        // Synchronous generation (waits for completion)
        if (!imageUrl || !prompt) {
          return NextResponse.json(
            { error: "imageUrl and prompt are required" },
            { status: 400 }
          );
        }

        const result = await generateVideoFromImage(
          {
            imageUrl,
            prompt,
            negativePrompt,
            aspectRatio,
            numFrames,
          },
          model as VideoModel
        );

        return NextResponse.json({
          success: true,
          video: result,
        });
      }

      case "submit": {
        // Async generation (returns immediately with requestId)
        if (!imageUrl || !prompt) {
          return NextResponse.json(
            { error: "imageUrl and prompt are required" },
            { status: 400 }
          );
        }

        const { requestId: newRequestId } = await submitVideoGeneration(
          {
            imageUrl,
            prompt,
            negativePrompt,
            aspectRatio,
            numFrames,
          },
          model as VideoModel
        );

        return NextResponse.json({
          success: true,
          requestId: newRequestId,
          model,
        });
      }

      case "status": {
        // Check status of a queued request
        if (!requestId) {
          return NextResponse.json(
            { error: "requestId is required" },
            { status: 400 }
          );
        }

        const status = await checkVideoStatus(requestId, model as VideoModel);

        return NextResponse.json({
          success: true,
          ...status,
        });
      }

      case "result": {
        // Get result of a completed request
        if (!requestId) {
          return NextResponse.json(
            { error: "requestId is required" },
            { status: 400 }
          );
        }

        const result = await getVideoResult(requestId, model as VideoModel);

        return NextResponse.json({
          success: true,
          video: result,
        });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action", validActions: ["generate", "submit", "status", "result"] },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Video generation error:", error);
    return NextResponse.json(
      {
        error: "Video generation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/fal/video?requestId=xxx&model=framepack&action=status
 * Check status or get result of a video generation
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const requestId = searchParams.get("requestId");
  const model = (searchParams.get("model") || "framepack") as VideoModel;
  const action = searchParams.get("action") || "status";

  if (!requestId) {
    return NextResponse.json(
      { error: "requestId is required" },
      { status: 400 }
    );
  }

  try {
    if (action === "result") {
      const result = await getVideoResult(requestId, model);
      return NextResponse.json({
        success: true,
        video: result,
      });
    }

    const status = await checkVideoStatus(requestId, model);
    return NextResponse.json({
      success: true,
      ...status,
    });
  } catch (error) {
    console.error("Video status check error:", error);
    return NextResponse.json(
      { error: "Failed to check video status" },
      { status: 500 }
    );
  }
}
