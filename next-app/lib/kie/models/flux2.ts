// =============================================================================
// Flux 2 - Advanced Image Generation
// =============================================================================

import { createTask, waitForTask } from "../client";
import { KIE_MODELS, type Flux2Options, type KieTaskResult } from "../types";

/**
 * Generate an image using Flux 2 Pro (Text to Image)
 *
 * @example
 * ```ts
 * const result = await generateWithFlux2({
 *   prompt: "A serene mountain landscape at golden hour",
 *   aspectRatio: "16:9",
 *   resolution: "2K"
 * });
 * console.log(result.resultUrls);
 * ```
 */
export async function generateWithFlux2(
  options: Flux2Options
): Promise<KieTaskResult> {
  const input: Record<string, unknown> = {
    prompt: options.prompt,
    aspect_ratio: options.aspectRatio || "1:1",
    resolution: options.resolution || "1K",
  };

  const taskId = await createTask(
    KIE_MODELS.FLUX2_PRO_TEXT_TO_IMAGE,
    input,
    options.callbackUrl
  );

  if (options.callbackUrl) {
    return {
      taskId,
      status: "pending",
    };
  }

  return waitForTask(taskId);
}

/**
 * Generate image from another image using Flux 2 Pro (Image to Image)
 * Follows the official API specification
 */
export async function generateWithFlux2ImageToImage(
  options: Flux2Options & { imageUrl: string | string[]; strength?: number }
): Promise<KieTaskResult> {
  // Convert single imageUrl to array format required by API
  const imageUrls = Array.isArray(options.imageUrl)
    ? options.imageUrl
    : [options.imageUrl];

  console.log("=== [Flux2 Image-to-Image] FINAL API CALL ===");
  console.log(`[Flux2 Image-to-Image] input_urls count: ${imageUrls.length}`);
  imageUrls.forEach((url, i) => {
    console.log(`[Flux2 Image-to-Image] input_urls[${i}]: ${url}`);
  });

  const input: Record<string, unknown> = {
    input_urls: imageUrls,
    prompt: options.prompt,
    aspect_ratio: options.aspectRatio || "1:1",
    resolution: options.resolution || "1K",
  };

  // Note: strength is not in the official API spec for this model
  // Keeping it for backward compatibility but it may not have effect
  if (options.strength !== undefined) {
    input.strength = options.strength;
  }

  const taskId = await createTask(
    KIE_MODELS.FLUX2_PRO_IMAGE_TO_IMAGE,
    input,
    options.callbackUrl
  );

  if (options.callbackUrl) {
    return {
      taskId,
      status: "pending",
    };
  }

  return waitForTask(taskId);
}

/**
 * Start Flux 2 generation (async, returns taskId)
 */
export async function startFlux2Generation(options: Flux2Options): Promise<string> {
  const input: Record<string, unknown> = {
    prompt: options.prompt,
    aspect_ratio: options.aspectRatio || "1:1",
    resolution: options.resolution || "1K",
  };

  return createTask(KIE_MODELS.FLUX2_PRO_TEXT_TO_IMAGE, input, options.callbackUrl);
}
