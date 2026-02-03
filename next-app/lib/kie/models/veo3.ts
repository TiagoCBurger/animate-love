// =============================================================================
// Veo 3.1 - Google Video Generation
// =============================================================================

import { createVeoTask, waitForTask } from "../client";
import type { Veo3Options, KieTaskResult } from "../types";

/**
 * Generate a video using Veo 3.1 (Text to Video)
 *
 * @example
 * ```ts
 * // Fast generation
 * const result = await generateWithVeo3({
 *   prompt: "A cat playing piano in a jazz club",
 *   model: "veo3_fast",
 *   aspectRatio: "16:9"
 * });
 *
 * // Quality generation
 * const result = await generateWithVeo3({
 *   prompt: "Cinematic drone shot of mountains at sunrise",
 *   model: "veo3",
 *   aspectRatio: "16:9"
 * });
 * ```
 */
export async function generateWithVeo3(
  options: Veo3Options
): Promise<KieTaskResult> {
  const taskId = await createVeoTask({
    prompt: options.prompt,
    model: options.model || "veo3_fast",
    generationType: options.generationType,
    aspectRatio: options.aspectRatio || "16:9",
    imageUrls: options.imageUrls,
    seeds: options.seeds,
    enableTranslation: options.enableTranslation,
    watermark: options.watermark,
    callbackUrl: options.callbackUrl,
  });

  if (options.callbackUrl) {
    return {
      taskId,
      status: "pending",
    };
  }

  // Video generation takes longer, use 10 minute timeout
  return waitForTask(taskId, {
    maxWaitMs: 10 * 60 * 1000,
    pollIntervalMs: 5000,
    isVeoTask: true,
  });
}

/**
 * Generate video from images using Veo 3.1 (First and Last Frames)
 *
 * @example
 * ```ts
 * const result = await generateVeo3FromFrames({
 *   prompt: "Smooth transition between scenes",
 *   imageUrls: [
 *     "https://example.com/start-frame.jpg",
 *     "https://example.com/end-frame.jpg"
 *   ]
 * });
 * ```
 */
export async function generateVeo3FromFrames(
  options: Omit<Veo3Options, "generationType"> & { imageUrls: string[] }
): Promise<KieTaskResult> {
  return generateWithVeo3({
    ...options,
    generationType: "FIRST_AND_LAST_FRAMES_2_VIDEO",
  });
}

/**
 * Generate video using reference images with Veo 3.1
 *
 * @example
 * ```ts
 * const result = await generateVeo3FromReference({
 *   prompt: "Create a video inspired by this style",
 *   imageUrls: ["https://example.com/reference.jpg"]
 * });
 * ```
 */
export async function generateVeo3FromReference(
  options: Omit<Veo3Options, "generationType"> & { imageUrls: string[] }
): Promise<KieTaskResult> {
  return generateWithVeo3({
    ...options,
    generationType: "REFERENCE_2_VIDEO",
  });
}

/**
 * Start Veo 3 generation (async, returns taskId)
 */
export async function startVeo3Generation(options: Veo3Options): Promise<string> {
  return createVeoTask({
    prompt: options.prompt,
    model: options.model || "veo3_fast",
    generationType: options.generationType,
    aspectRatio: options.aspectRatio || "16:9",
    imageUrls: options.imageUrls,
    seeds: options.seeds,
    enableTranslation: options.enableTranslation,
    watermark: options.watermark,
    callbackUrl: options.callbackUrl,
  });
}
