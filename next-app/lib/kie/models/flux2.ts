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
 */
export async function generateWithFlux2ImageToImage(
  options: Flux2Options & { imageUrl: string; strength?: number }
): Promise<KieTaskResult> {
  const input: Record<string, unknown> = {
    prompt: options.prompt,
    image_url: options.imageUrl,
    aspect_ratio: options.aspectRatio || "1:1",
    resolution: options.resolution || "1K",
  };

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
