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
// CHARACTER_PREFIX is prepended to all character styling prompts
const CHARACTER_PREFIX = "Character portrait for animated story. Create a detailed stylized version of this character that can be used consistently across multiple scenes. Focus on capturing the character's unique identifying features, expression, and personality.";

const STYLE_PRESETS = {
  pixar: {
    prompt:
      `${CHARACTER_PREFIX} Style: Pixar/Disney 3D animation render with big expressive eyes, smooth stylized features, vibrant saturated colors, professional studio lighting, high quality 3D character design. CRITICAL: Preserve the exact appearance, proportions, fur color/pattern (if pet), skin tone, and distinctive features from the reference image. The character must be instantly recognizable.`,
  },
  comic: {
    prompt:
      `${CHARACTER_PREFIX} Style: Comic book art style inspired by Spider-Verse animation as the dominant visual style, bold black ink outlines with varying line weights, Ben-Day dots halftone patterns, cel-shading with cinematic color grading, warm and natural color palette, muted earthy tones, golden hour warm lighting influence, accurate naturalistic skin tones, rich warm shadows with soft amber undertones, hand-drawn sketch texture overlaid on clean shapes, cross-hatching in shadow areas, subtle off-register printing effect, kinetic motion lines, graphic novel panel aesthetic, visible brushstroke textures, analog film grain overlay, atmospheric depth, no teal color grading, no green cast, no cool color dominance, characters with exaggerated caricature features, strong and defined facial structure, bold expressive eyes with thick ink outlines, exaggerated jawlines and cheekbones, dramatic and expressive facial expressions, comic book anatomy with defined muscle lines, thick expressive eyebrows, hand-inked character details, editorial cartoon influence on facial features, subtle Pixar animation influence on character softness and volume, slightly rounded and smooth facial geometry beneath the ink lines, soft subsurface skin quality reminiscent of CGI animation, warm appealing character design with Pixar-like charm and expressiveness, 3D volume suggestion under 2D comic rendering, Pixar influence is secondary and subtle never dominant. CRITICAL: Preserve the exact appearance, proportions, fur color/pattern (if pet), skin tone, and distinctive features from the reference image. The character must be instantly recognizable.`,
  },
  oilpainting: {
    prompt:
      `${CHARACTER_PREFIX} Style: Classical oil painting masterpiece with dramatic chiaroscuro lighting, rich deep saturated colors, bold visible expressive brushstrokes that emphasize the character's defining features. Exaggerate and enhance the most distinctive traits of the character - prominent facial features, unique markings, characteristic expressions. Strong impasto technique with thick textured paint on key features like eyes, nose, and any unique physical characteristics. Renaissance master quality with museum-worthy dramatic composition. Deep shadows and luminous highlights that sculpt the character's form. Each brushstroke should reinforce the character's personality and most recognizable attributes. CRITICAL: Preserve AND EMPHASIZE the exact appearance, proportions, fur color/pattern (if pet), skin tone, and distinctive features from the reference image. Accentuate what makes this character unique and memorable. The character must be instantly recognizable with their defining traits boldly expressed through the painterly style.`,
  },
  watercolor: {
    prompt:
      `${CHARACTER_PREFIX} Style: Elegant watercolor painting with subtle Pixar-inspired caricature influence. Slightly exaggerated and stylized facial features with charming appeal - larger expressive eyes, softly rounded forms, and endearing proportions that highlight the character's personality. Soft artistic brushstrokes with delicate wet-on-wet technique creating beautiful color bleeds and gradients. Pastel and muted color palette with occasional vibrant accents. Visible paper texture showing through transparent washes, loose expressive edges that fade into white space. The character should feel like a Pixar character painted in watercolor - warm, appealing, and full of life with romantic dreamy atmosphere. Layered translucent washes building depth and form with a touch of whimsy. CRITICAL: Preserve the essential appearance, fur color/pattern (if pet), skin tone, and distinctive features from the reference image while adding subtle caricature charm. The character must be instantly recognizable with their defining traits expressed through flowing watercolor aesthetic and gentle stylization.`,
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
    const { action = "style", imageUrl, imageUrls, style, taskId, prompt, aspectRatio } = body;

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

        // Build the scene prompt with strict character constraints and trait fidelity
        // Using structured prompt engineering with explicit negative instructions
        const characterCount = refUrls.length;

        // SCENE_CONTEXT with character fidelity as top priority
        const SCENE_CONTEXT = `[SCENE GENERATION - STRICT CHARACTER FIDELITY MODE]

RULE #1 - CHARACTER TRAIT PRESERVATION (HIGHEST PRIORITY):
- Copy character appearance EXACTLY as shown in reference images
- DO NOT modify, reinterpret, or stylize character features differently
- Same face structure, same eye shape, same nose, same proportions
- Same fur pattern/skin tone, same colors, same distinctive marks
- The scene style applies to ENVIRONMENT and LIGHTING only, NOT to character traits

RULE #2 - FIXED CAST:
- Reference images show the ONLY protagonists allowed
- DO NOT create, invent, or add any new main characters
- Background extras must be blurred silhouettes only`;

        const combinedPrompt = refUrls.length > 0
          ? `${SCENE_CONTEXT}

[PROTAGONISTS]: Exactly ${characterCount} character(s) - reproduce with 100% visual fidelity from references.

[SCENE DESCRIPTION]: ${prompt}

[ENVIRONMENT STYLE ONLY]: ${stylePreset.prompt}
(Apply style to background, lighting, atmosphere - NOT to character physical traits)

[CHARACTER FIDELITY CHECKLIST]:
✓ Face structure: IDENTICAL to reference
✓ Body proportions: IDENTICAL to reference
✓ Colors (fur/skin/hair): IDENTICAL to reference
✓ Distinctive features: IDENTICAL to reference
✓ Expression style: Consistent with reference character personality

[FORBIDDEN]:
✗ Modifying character facial features
✗ Changing character proportions or body type
✗ Altering character colors or patterns
✗ Adding new prominent characters
✗ Reinterpreting character design

[COMPOSITION]: Cinematic framing, professional lighting, protagonists as clear focal point with supporting environment.`
          : `[SCENE DESCRIPTION]: ${prompt}

[VISUAL STYLE]: ${stylePreset.prompt}

[COMPOSITION]: Cinematic framing, professional lighting, high quality illustration.`;

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
        const sceneAspectRatio = aspectRatio || "9:16";

        const result = refUrls.length > 0
          ? await generateWithFlux2ImageToImage({
              imageUrl: refUrls,
              prompt: combinedPrompt,
              aspectRatio: sceneAspectRatio,
              resolution: "1K",
            })
          : await generateWithFlux2({
              prompt: combinedPrompt,
              aspectRatio: sceneAspectRatio,
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
