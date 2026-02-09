import { NextRequest, NextResponse } from "next/server";
import {
  generateWithNanoBanana,
  generateWithNanoBananaEdit,
  generateWithFlux2,
  generateWithFlux2ImageToImage,
  getTaskStatus,
} from "@/lib/kie";
import { uploadToR2, generateUniqueKey } from "@/lib/cloudflare/r2";

/**
 * Download an image from a temporary URL and re-upload to R2 for permanent storage.
 * Returns the permanent R2 public URL.
 */
async function persistToR2(tempUrl: string, folder: string = "styled"): Promise<string> {
  const response = await fetch(tempUrl);
  if (!response.ok) {
    throw new Error(`Failed to download image from ${tempUrl}: ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type") || "image/png";
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const filename = tempUrl.split("/").pop() || "image.png";
  const key = generateUniqueKey(filename, folder);
  const result = await uploadToR2(key, buffer, contentType);

  if (!result.url) {
    throw new Error("R2 upload succeeded but no public URL returned");
  }

  console.log(`[persistToR2] Saved ${tempUrl.substring(0, 60)}... -> ${result.url}`);
  return result.url;
}

// Style presets matching the funnel page
const STYLE_PRESETS = {
  romantic: {
    prompt:
      "romantic style, soft lighting, warm colors, dreamy atmosphere, bokeh background, golden hour, tender, emotional, cinematic quality. IMPORTANT: maintain original skin tone and facial features exactly as in the reference image",
  },
  anime: {
    prompt:
      "anime style, studio ghibli inspired, detailed anime art, vibrant colors, clean lines, sparkles, cherry blossoms. IMPORTANT: maintain original skin tone and facial features exactly as in the reference image",
  },
  pixar: {
    prompt:
      "pixar style 3d render, disney animation style, big expressive eyes, smooth skin, vibrant colors, studio lighting, high quality 3d animation. IMPORTANT: maintain original skin tone and facial features exactly as in the reference image",
  },
  watercolor: {
    prompt:
      "watercolor painting, soft brushstrokes, pastel colors, artistic, delicate, flowing paint, paper texture, beautiful watercolor art. IMPORTANT: maintain original skin tone and facial features exactly as in the reference image",
  },
  vintage: {
    prompt:
      "vintage photograph style, 1970s aesthetic, film grain, warm vintage tones, nostalgic atmosphere, soft focus, light leaks, analog photography feel. IMPORTANT: maintain original skin tone and facial features exactly as in the reference image",
  },
  oilpainting: {
    prompt:
      "oil painting masterpiece, renaissance style, dramatic lighting, rich colors, visible brushstrokes, classical art, museum quality. IMPORTANT: maintain original skin tone and facial features exactly as in the reference image",
  },
  lego: {
    prompt:
      "LEGO brick style, colorful plastic blocks construction, toy photography aesthetic, vibrant primary colors, playful blocky shapes, smooth plastic texture, studio lighting, high saturation, sharp edges, miniature LEGO world. IMPORTANT: maintain original skin tone and facial features exactly as in the reference image",
  },
} as const;

type StylePreset = keyof typeof STYLE_PRESETS;

/**
 * POST /api/kie/image
 * Generate styled images using Kie.ai
 *
 * Body:
 * - action: "style" | "status" | "generate-with-reference"
 * - imageUrl: string (for style action)
 * - imageUrls: string[] (for generate-with-reference - all character styled images)
 * - style: StylePreset (for style and generate-with-reference actions)
 * - prompt: string (for generate-with-reference action - the scene description)
 * - taskId: string (for status action)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action = "style", imageUrl, imageUrls, style, taskId, prompt } = body;

    switch (action) {
      case "style": {
        // Generate with preset style using Nano Banana Edit (image-to-image)
        if (!imageUrl || !style) {
          return NextResponse.json(
            { error: "imageUrl and style are required" },
            { status: 400 }
          );
        }

        if (!STYLE_PRESETS[style as StylePreset]) {
          return NextResponse.json(
            {
              error: "Invalid style",
              availableStyles: Object.keys(STYLE_PRESETS),
            },
            { status: 400 }
          );
        }

        const preset = STYLE_PRESETS[style as StylePreset];

        const result = await generateWithNanoBananaEdit({
          imageUrl,
          prompt: preset.prompt,
          aspectRatio: "1:1",
          outputFormat: "png",
        });

        const tempUrl = result.resultUrls?.[0];
        if (!tempUrl) {
          throw new Error("Style generation returned no image URL");
        }

        // Re-upload styled image to R2 for permanent storage
        // (Nano Banana Edit returns temporary URLs that expire)
        const permanentUrl = await persistToR2(tempUrl, "styled");
        console.log(`[style] Persisted styled image: ${permanentUrl}`);

        return NextResponse.json({
          success: true,
          image: {
            url: permanentUrl,
            imageUrl: permanentUrl,
          },
          style: preset,
          taskId: result.taskId,
        });
      }

      case "generate-with-reference": {
        // Generate scene image using character references
        // Uses Flux 2 Pro Image-to-Image which natively supports 1-8 input images
        if (!style || !prompt) {
          return NextResponse.json(
            { error: "style and prompt are required for generate-with-reference" },
            { status: 400 }
          );
        }

        if (!STYLE_PRESETS[style as StylePreset]) {
          return NextResponse.json(
            {
              error: "Invalid style",
              availableStyles: Object.keys(STYLE_PRESETS),
            },
            { status: 400 }
          );
        }

        const stylePreset = STYLE_PRESETS[style as StylePreset];

        // Resolve all reference image URLs (prefer array, fallback to single)
        const refUrls: string[] = imageUrls?.length
          ? imageUrls
          : imageUrl
            ? [imageUrl]
            : [];

        // Build the scene prompt with style
        const combinedPrompt = refUrls.length > 0
          ? `Style: ${stylePreset.prompt}. Scene: ${prompt}. Maintain the exact character appearance and features from all reference images. All characters from the reference images must appear together in the scene.`
          : `Style: ${stylePreset.prompt}. Scene: ${prompt}.`;

        console.log("=== [generate-with-reference] DEBUG START ===");
        console.log("[generate-with-reference] Raw body.imageUrls:", JSON.stringify(imageUrls));
        console.log("[generate-with-reference] Raw body.imageUrl:", imageUrl);
        console.log("[generate-with-reference] Resolved refUrls count:", refUrls.length);
        refUrls.forEach((url: string, i: number) => {
          console.log(`[generate-with-reference] input_urls[${i}]: ${url}`);
        });
        console.log("[generate-with-reference] Scene prompt:", prompt);
        console.log("[generate-with-reference] Combined prompt:", combinedPrompt);
        console.log("[generate-with-reference] Using model:", refUrls.length > 0 ? "flux-2/pro-image-to-image" : "flux-2/pro-text-to-image");
        console.log("=== [generate-with-reference] DEBUG END ===");

        // Use Flux 2 Pro Image-to-Image when reference images exist (supports 1-8 input_urls natively)
        // Use Flux 2 Pro Text-to-Image when no reference images
        const result = refUrls.length > 0
          ? await generateWithFlux2ImageToImage({
              imageUrl: refUrls,
              prompt: combinedPrompt,
              aspectRatio: "9:16",
              resolution: "1K",
            })
          : await generateWithFlux2({
              prompt: combinedPrompt,
              aspectRatio: "9:16",
              resolution: "1K",
            });

        const sceneTempUrl = result.resultUrls?.[0];
        if (!sceneTempUrl) {
          throw new Error("Scene generation returned no image URL");
        }

        // Re-upload scene image to R2 for permanent storage
        const sceneUrl = await persistToR2(sceneTempUrl, "scenes");
        console.log(`[generate-with-reference] Persisted scene image: ${sceneUrl}`);

        return NextResponse.json({
          success: true,
          image: {
            url: sceneUrl,
            imageUrl: sceneUrl,
          },
          prompt: combinedPrompt,
          taskId: result.taskId,
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
          status: status.status,
          resultUrls: status.resultUrls,
          taskId,
        });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action", validActions: ["style", "status", "generate-with-reference"] },
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
 * GET /api/kie/image?taskId=xxx
 * Get status of image generation task
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json(
        { error: "taskId is required" },
        { status: 400 }
      );
    }

    const status = await getTaskStatus(taskId);

    return NextResponse.json({
      success: true,
      status: status.status,
      resultUrls: status.resultUrls,
      taskId,
    });
  } catch (error) {
    console.error("Task status error:", error);
    return NextResponse.json(
      { error: "Failed to get task status" },
      { status: 500 }
    );
  }
}
