import { NextRequest, NextResponse } from "next/server";
import {
  generateStyledImage,
  generateImageWithStyle,
  submitImageGeneration,
  getImageResult,
  STYLE_PRESETS,
  StylePreset,
  IMAGE_MODELS,
  ImageModel,
} from "@/lib/fal";

/**
 * POST /api/fal/image
 * Generate styled images
 *
 * Body:
 * - action: "generate" | "style" | "submit" | "result"
 * - imageUrl: string (for generate/style/submit)
 * - prompt?: string (for generate/submit - custom prompt)
 * - style?: StylePreset (for style action)
 * - model?: ImageModel (default: "flux2")
 * - requestId?: string (for result action)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      action = "style",
      imageUrl,
      prompt,
      negativePrompt,
      style,
      strength,
      model = "flux2",
      requestId,
    } = body;

    // Validate model
    if (model && !IMAGE_MODELS[model as ImageModel]) {
      return NextResponse.json(
        { error: "Invalid model", availableModels: Object.keys(IMAGE_MODELS) },
        { status: 400 }
      );
    }

    switch (action) {
      case "generate": {
        // Generate with custom prompt
        if (!imageUrl || !prompt) {
          return NextResponse.json(
            { error: "imageUrl and prompt are required" },
            { status: 400 }
          );
        }

        const result = await generateStyledImage(
          {
            imageUrl,
            prompt,
            negativePrompt,
            strength,
          },
          model as ImageModel
        );

        return NextResponse.json({
          success: true,
          image: result,
        });
      }

      case "style": {
        // Generate with preset style
        if (!imageUrl || !style) {
          return NextResponse.json(
            { error: "imageUrl and style are required" },
            { status: 400 }
          );
        }

        if (!STYLE_PRESETS[style as StylePreset]) {
          return NextResponse.json(
            { error: "Invalid style", availableStyles: Object.keys(STYLE_PRESETS) },
            { status: 400 }
          );
        }

        const result = await generateImageWithStyle(imageUrl, style as StylePreset);

        return NextResponse.json({
          success: true,
          image: result,
          style: STYLE_PRESETS[style as StylePreset],
        });
      }

      case "submit": {
        // Async generation
        if (!imageUrl) {
          return NextResponse.json(
            { error: "imageUrl is required" },
            { status: 400 }
          );
        }

        // Use style preset or custom prompt
        let finalPrompt = prompt;
        let finalNegativePrompt = negativePrompt;
        let finalStrength = strength;

        if (style && STYLE_PRESETS[style as StylePreset]) {
          const preset = STYLE_PRESETS[style as StylePreset];
          finalPrompt = preset.prompt;
          finalNegativePrompt = preset.negativePrompt;
          finalStrength = preset.strength;
        }

        if (!finalPrompt) {
          return NextResponse.json(
            { error: "prompt or style is required" },
            { status: 400 }
          );
        }

        const { requestId: newRequestId } = await submitImageGeneration(
          {
            imageUrl,
            prompt: finalPrompt,
            negativePrompt: finalNegativePrompt,
            strength: finalStrength,
          },
          model as ImageModel
        );

        return NextResponse.json({
          success: true,
          requestId: newRequestId,
          model,
        });
      }

      case "result": {
        // Get result of async generation
        if (!requestId) {
          return NextResponse.json(
            { error: "requestId is required" },
            { status: 400 }
          );
        }

        const result = await getImageResult(requestId, model as ImageModel);

        return NextResponse.json({
          success: true,
          image: result,
        });
      }

      case "styles": {
        // Return available styles
        return NextResponse.json({
          success: true,
          styles: STYLE_PRESETS,
        });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action", validActions: ["generate", "style", "submit", "result", "styles"] },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      {
        error: "Image generation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/fal/image/styles
 * Get available style presets
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get("action");

  if (action === "styles" || !action) {
    return NextResponse.json({
      success: true,
      styles: STYLE_PRESETS,
    });
  }

  // Get result by requestId
  const requestId = searchParams.get("requestId");
  const model = (searchParams.get("model") || "flux2") as ImageModel;

  if (requestId) {
    try {
      const result = await getImageResult(requestId, model);
      return NextResponse.json({
        success: true,
        image: result,
      });
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to get image result" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { error: "Invalid request" },
    { status: 400 }
  );
}
