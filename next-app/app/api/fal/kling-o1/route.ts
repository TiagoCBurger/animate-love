import { NextRequest, NextResponse } from "next/server";
import {
  generateKlingO1Video,
  submitKlingO1Video,
  checkKlingO1Status,
  getKlingO1Result,
  KlingO1Element,
} from "@/lib/fal";

/**
 * POST /api/fal/kling-o1
 * Generate video using Kling O1 with character element references
 *
 * Body:
 * - action: "generate" | "submit" | "status" | "result"
 * - prompt: string (use @Element1 to reference character, @Image1 for style)
 * - elements: Array of { referenceImageUrls: string[], frontalImageUrl?: string }
 * - imageUrls?: string[] (additional reference images for style)
 * - duration?: "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10"
 * - aspectRatio?: "16:9" | "9:16" | "1:1"
 * - usePro?: boolean (use Pro model for higher quality)
 * - requestId?: string (for status/result actions)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      action = "generate",
      prompt,
      elements,
      imageUrls,
      duration = "5",
      aspectRatio = "9:16",
      usePro = false,
      requestId,
    } = body;

    console.log("[Kling O1 API] Action:", action);
    console.log("[Kling O1 API] Body:", JSON.stringify(body, null, 2));

    switch (action) {
      case "generate": {
        // Synchronous generation (waits for completion)
        if (!prompt) {
          return NextResponse.json(
            { error: "prompt is required" },
            { status: 400 }
          );
        }

        const result = await generateKlingO1Video(
          {
            prompt,
            elements: elements as KlingO1Element[],
            imageUrls,
            duration,
            aspectRatio,
          },
          usePro
        );

        return NextResponse.json({
          success: true,
          video: result,
        });
      }

      case "submit": {
        // Async generation (returns immediately with requestId)
        if (!prompt) {
          return NextResponse.json(
            { error: "prompt is required" },
            { status: 400 }
          );
        }

        const { requestId: newRequestId } = await submitKlingO1Video(
          {
            prompt,
            elements: elements as KlingO1Element[],
            imageUrls,
            duration,
            aspectRatio,
          },
          usePro
        );

        return NextResponse.json({
          success: true,
          requestId: newRequestId,
          usePro,
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

        const status = await checkKlingO1Status(requestId, usePro);

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

        const result = await getKlingO1Result(requestId, usePro);

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
    console.error("[Kling O1 API] Error:", error);
    return NextResponse.json(
      {
        error: "Kling O1 video generation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/fal/kling-o1?requestId=xxx&action=status&usePro=false
 * Check status or get result of a Kling O1 video generation
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const requestId = searchParams.get("requestId");
  const action = searchParams.get("action") || "status";
  const usePro = searchParams.get("usePro") === "true";

  if (!requestId) {
    return NextResponse.json(
      { error: "requestId is required" },
      { status: 400 }
    );
  }

  try {
    if (action === "result") {
      const result = await getKlingO1Result(requestId, usePro);
      return NextResponse.json({
        success: true,
        video: result,
      });
    }

    const status = await checkKlingO1Status(requestId, usePro);
    return NextResponse.json({
      success: true,
      ...status,
    });
  } catch (error) {
    console.error("[Kling O1 API] Status check error:", error);
    return NextResponse.json(
      { error: "Failed to check Kling O1 video status" },
      { status: 500 }
    );
  }
}
