import { NextRequest, NextResponse } from "next/server";
import {
  generateWithKling,
  generateKlingWithMultishot,
  startKlingGeneration,
  startKlingMultishotGeneration,
  batchStartKlingGeneration,
  getTaskStatus,
  MULTISHOT_PROMPTS,
  type KlingOptions,
  type MultishotPromptType,
} from "@/lib/kie";

/**
 * POST /api/kie/video
 * Generate videos using Kling 2.5
 *
 * Body:
 * - action: "generate" | "multishot" | "start" | "start-multishot" | "batch" | "status"
 * - imageUrl: string (required for generate/start actions)
 * - prompt: string (required for generate/start actions)
 * - promptType?: MultishotPromptType (for multishot actions)
 * - duration?: "5" | "10" (default: "5")
 * - model?: KlingModel (default: "v2.5-turbo-pro")
 * - taskId?: string (for status action)
 * - images?: Array<{imageUrl, prompt, promptType?}> (for batch action)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      action = "multishot",
      imageUrl,
      prompt,
      promptType = "romantic_generic",
      duration = "5",
      negativePrompt,
      cfgScale = 0.5,
      model = "v2.5-turbo-pro",
      callbackUrl,
      taskId,
      images,
    } = body;

    switch (action) {
      case "generate": {
        // Synchronous generation with custom prompt
        if (!imageUrl || !prompt) {
          return NextResponse.json(
            { error: "imageUrl and prompt are required" },
            { status: 400 }
          );
        }

        const options: KlingOptions = {
          imageUrl,
          prompt,
          negativePrompt,
          duration,
          cfgScale,
          model,
          callbackUrl,
        };

        const result = await generateWithKling(options);

        return NextResponse.json({
          success: true,
          video: result,
        });
      }

      case "multishot": {
        // Synchronous generation with optimized multishot prompt
        if (!imageUrl || !prompt) {
          return NextResponse.json(
            { error: "imageUrl and prompt are required" },
            { status: 400 }
          );
        }

        if (promptType && !MULTISHOT_PROMPTS[promptType as MultishotPromptType]) {
          return NextResponse.json(
            {
              error: "Invalid promptType",
              availableTypes: Object.keys(MULTISHOT_PROMPTS),
            },
            { status: 400 }
          );
        }

        const result = await generateKlingWithMultishot({
          imageUrl,
          prompt,
          promptType: promptType as MultishotPromptType,
          duration,
          cfgScale,
          model,
          callbackUrl,
        });

        return NextResponse.json({
          success: true,
          video: result,
        });
      }

      case "start": {
        // Async generation - returns taskId immediately
        if (!imageUrl || !prompt) {
          return NextResponse.json(
            { error: "imageUrl and prompt are required" },
            { status: 400 }
          );
        }

        const newTaskId = await startKlingGeneration({
          imageUrl,
          prompt,
          negativePrompt,
          duration,
          cfgScale,
          model,
          callbackUrl,
        });

        return NextResponse.json({
          success: true,
          taskId: newTaskId,
          model,
        });
      }

      case "start-multishot": {
        // Async generation with multishot optimization
        console.log("[API] start-multishot request:", { imageUrl, prompt, promptType, duration, model });

        if (!imageUrl || !prompt) {
          return NextResponse.json(
            { error: "imageUrl and prompt are required" },
            { status: 400 }
          );
        }

        try {
          const newTaskId = await startKlingMultishotGeneration({
            imageUrl,
            prompt,
            promptType: promptType as MultishotPromptType,
            duration,
            cfgScale,
            model,
            callbackUrl,
          });

          console.log("[API] Video generation started, taskId:", newTaskId);

          return NextResponse.json({
            success: true,
            taskId: newTaskId,
            model,
          });
        } catch (error) {
          console.error("[API] Error starting video generation:", error);
          throw error;
        }
      }

      case "batch": {
        // Batch start multiple video generations
        if (!images || !Array.isArray(images) || images.length === 0) {
          return NextResponse.json(
            { error: "images array is required with at least one item" },
            { status: 400 }
          );
        }

        const taskIds = await batchStartKlingGeneration(images, {
          duration,
          cfgScale,
          model,
          callbackUrl,
        });

        return NextResponse.json({
          success: true,
          taskIds,
          count: taskIds.length,
          model,
        });
      }

      case "status": {
        // Check task status
        if (!taskId) {
          return NextResponse.json(
            { error: "taskId is required" },
            { status: 400 }
          );
        }

        const status = await getTaskStatus(taskId);

        return NextResponse.json({
          success: true,
          ...status,
        });
      }

      case "prompts": {
        // Return available multishot prompts
        return NextResponse.json({
          success: true,
          prompts: Object.entries(MULTISHOT_PROMPTS).map(([key, value]) => ({
            id: key,
            ...value,
          })),
        });
      }

      default:
        return NextResponse.json(
          {
            error: "Invalid action",
            validActions: [
              "generate",
              "multishot",
              "start",
              "start-multishot",
              "batch",
              "status",
              "prompts",
            ],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Kling video generation error:", error);
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
 * GET /api/kie/video?taskId=xxx
 * Check status of a video generation task
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const taskId = searchParams.get("taskId");
  const action = searchParams.get("action");

  // Return available prompts
  if (action === "prompts" || !taskId) {
    if (action === "prompts") {
      return NextResponse.json({
        success: true,
        prompts: Object.entries(MULTISHOT_PROMPTS).map(([key, value]) => ({
          id: key,
          ...value,
        })),
      });
    }

    return NextResponse.json(
      { error: "taskId is required" },
      { status: 400 }
    );
  }

  try {
    console.log("[API] Checking status for taskId:", taskId);
    const status = await getTaskStatus(taskId);
    console.log("[API] Task status:", status);

    return NextResponse.json({
      success: true,
      ...status,
    });
  } catch (error) {
    console.error("[API] Task status check error:", error);
    return NextResponse.json(
      {
        error: "Failed to check task status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
