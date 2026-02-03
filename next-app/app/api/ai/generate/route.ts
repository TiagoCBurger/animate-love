import { NextRequest, NextResponse } from "next/server";
import {
  // Image Models
  generateWithNanoBanana,
  generateWithFlux2,
  generateWithGrokImage,
  // Video Models
  generateWithVeo3,
  generateWithSora2,
  // Async starters
  startNanoBananaGeneration,
  startFlux2Generation,
  startGrokImageGeneration,
  startVeo3Generation,
  startSora2Generation,
  // Types
  KieApiError,
  type NanoBananaProOptions,
  type Flux2Options,
  type GrokImageOptions,
  type Veo3Options,
  type Sora2Options,
  type KieTaskResult,
} from "@/lib/kie";

type ModelName = "nano-banana" | "flux2" | "grok-image" | "veo3" | "sora2";

/**
 * POST /api/ai/generate
 *
 * Unified endpoint for AI generation
 *
 * Body:
 * {
 *   "model": "nano-banana" | "flux2" | "grok-image" | "veo3" | "sora2",
 *   "async": false,  // Set to true to get taskId immediately
 *   "options": {
 *     "prompt": "Your prompt here",
 *     "aspectRatio": "16:9",
 *     // ... model-specific options
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { model, async: isAsync, options } = body as {
      model: ModelName;
      async?: boolean;
      options: Record<string, unknown>;
    };

    if (!model || !options?.prompt) {
      return NextResponse.json(
        { error: "Model and prompt are required" },
        { status: 400 }
      );
    }

    // Use async starter if requested
    if (isAsync) {
      const taskId = await startAsyncGeneration(model, options);
      if (!taskId) {
        return NextResponse.json(
          { error: `Unknown model: ${model}` },
          { status: 400 }
        );
      }
      return NextResponse.json({
        success: true,
        taskId,
        status: "pending",
      });
    }

    // Use synchronous generator
    const result = await runGeneration(model, options);
    if (!result) {
      return NextResponse.json(
        { error: `Unknown model: ${model}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("AI generation error:", error);

    if (error instanceof KieApiError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          details: error.data,
        },
        { status: error.code === 402 ? 402 : 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}

async function runGeneration(
  model: ModelName,
  options: Record<string, unknown>
): Promise<KieTaskResult | null> {
  switch (model) {
    case "nano-banana":
      return generateWithNanoBanana(options as unknown as NanoBananaProOptions);
    case "flux2":
      return generateWithFlux2(options as unknown as Flux2Options);
    case "grok-image":
      return generateWithGrokImage(options as unknown as GrokImageOptions);
    case "veo3":
      return generateWithVeo3(options as unknown as Veo3Options);
    case "sora2":
      return generateWithSora2(options as unknown as Sora2Options);
    default:
      return null;
  }
}

async function startAsyncGeneration(
  model: ModelName,
  options: Record<string, unknown>
): Promise<string | null> {
  switch (model) {
    case "nano-banana":
      return startNanoBananaGeneration(options as unknown as NanoBananaProOptions);
    case "flux2":
      return startFlux2Generation(options as unknown as Flux2Options);
    case "grok-image":
      return startGrokImageGeneration(options as unknown as GrokImageOptions);
    case "veo3":
      return startVeo3Generation(options as unknown as Veo3Options);
    case "sora2":
      return startSora2Generation(options as unknown as Sora2Options);
    default:
      return null;
  }
}
