import { fal } from "@fal-ai/client";

// Configure fal client
const apiKey = process.env.FAL_KEY;

if (apiKey) {
  fal.config({
    credentials: apiKey,
  });
}

// Available models for video generation
export const VIDEO_MODELS = {
  // Image to Video models
  framepack: "fal-ai/framepack",
  minimaxVideo: "fal-ai/minimax/video-01",
  runwayGen3: "fal-ai/runway-gen3/turbo/image-to-video",
  klingVideo: "fal-ai/kling-video/v1/standard/image-to-video",

  // Kling O1 Reference to Video (with elements support for character consistency)
  klingO1Standard: "fal-ai/kling-video/o1/standard/reference-to-video",
  klingO1Pro: "fal-ai/kling-video/o1/pro/reference-to-video",

  // Text to Video models
  animateDiff: "fal-ai/fast-animatediff/text-to-video",
} as const;

export type VideoModel = keyof typeof VIDEO_MODELS;

// Available models for image generation
export const IMAGE_MODELS = {
  // Image to Image (style transfer)
  flux2: "fal-ai/flux/dev/image-to-image",
  fluxPro: "fal-ai/flux-pro/v1.1",
  fluxSchnell: "fal-ai/flux/schnell",

  // IP Adapter (face/style preservation)
  fluxIpAdapter: "fal-ai/flux-lora-fast-training",
} as const;

export type ImageModel = keyof typeof IMAGE_MODELS;

// Input types
export interface ImageToVideoInput {
  imageUrl: string;
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
  duration?: number; // in seconds
  numFrames?: number;
}

/**
 * Element for Kling O1 Reference-to-Video
 * Used to define characters/objects that can be referenced in prompts as @Element1, @Element2, etc.
 */
export interface KlingO1Element {
  /** Reference images for the element (different angles/poses) */
  referenceImageUrls: string[];
  /** Optional frontal image for better face/character consistency */
  frontalImageUrl?: string;
}

/**
 * Input for Kling O1 Reference-to-Video
 */
export interface KlingO1Input {
  /** Prompt with @Element1, @Element2, @Image1, @Image2 references */
  prompt: string;
  /** Elements (characters/objects) to include. Referenced as @Element1, @Element2 in prompt */
  elements?: KlingO1Element[];
  /** Additional reference images for style. Referenced as @Image1, @Image2 in prompt */
  imageUrls?: string[];
  /** Duration in seconds (3-10) */
  duration?: "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10";
  /** Aspect ratio */
  aspectRatio?: "16:9" | "9:16" | "1:1";
}

export interface TextToVideoInput {
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: "16:9" | "9:16" | "1:1";
  duration?: number;
}

// Image generation input types
export interface ImageToImageInput {
  imageUrl: string;
  prompt: string;
  negativePrompt?: string;
  strength?: number; // 0-1, how much to transform the image
  numInferenceSteps?: number;
  guidanceScale?: number;
  seed?: number;
}

export interface ImageResult {
  imageUrl: string;
  width?: number;
  height?: number;
  seed?: number;
}

// Response types
export interface VideoResult {
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  width?: number;
  height?: number;
}

export interface QueueStatus {
  requestId: string;
  status: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  position?: number;
  eta?: number;
}

// Style presets for Animalove
export const STYLE_PRESETS = {
  pixar: {
    id: "pixar",
    name: "Pixar 3D",
    description: "Estilo 3D cartoon da Pixar/Disney",
    prompt: "pixar style 3d render, disney animation style, cute characters, big expressive eyes, smooth skin, vibrant colors, studio lighting, high quality 3d animation",
    negativePrompt: "realistic photo, anime, 2d, sketch, ugly, deformed",
    strength: 0.7,
    icon: "film",
  },
  comic: {
    id: "comic",
    name: "Quadrinho",
    description: "Estilo Spider-Verse com traços marcantes",
    prompt: "Comic book art style inspired by Spider-Verse animation, bold black ink outlines with varying line weights, Ben-Day dots halftone patterns, cel-shading with cinematic color grading, warm natural color palette, hand-drawn sketch texture, cross-hatching in shadow areas, graphic novel aesthetic, characters with exaggerated caricature features, bold expressive eyes with thick ink outlines, dramatic expressions, comic book anatomy, Pixar-like charm and expressiveness",
    negativePrompt: "realistic photo, blurry, low quality, teal color grading, green cast, cool color dominance",
    strength: 0.75,
    icon: "book-open",
  },
  oilpainting: {
    id: "oilpainting",
    name: "Pintura a Óleo",
    description: "Pinceladas marcantes e traços expressivos",
    prompt: "oil painting masterpiece, bold visible expressive brushstrokes emphasizing distinctive features, dramatic chiaroscuro lighting, rich deep saturated colors, strong impasto technique, renaissance master quality, museum-worthy composition",
    negativePrompt: "photo, modern, digital, cartoon, anime, flat colors, smooth surface",
    strength: 0.7,
    icon: "brush",
  },
  watercolor: {
    id: "watercolor",
    name: "Aquarela",
    description: "Estilo artístico com toque caricato Pixar",
    prompt: "elegant watercolor painting with subtle Pixar-inspired caricature, slightly exaggerated charming features, larger expressive eyes, softly rounded forms, soft artistic brushstrokes, wet-on-wet technique, beautiful color bleeds, pastel color palette, romantic dreamy atmosphere, whimsical appeal",
    negativePrompt: "photo, realistic, digital art, 3d, sharp edges, dark colors, harsh lines",
    strength: 0.7,
    icon: "palette",
  },
} as const;

export type StylePreset = keyof typeof STYLE_PRESETS;

/**
 * Generate styled image from original image using Flux2
 * Uses image-to-image transformation with style prompts
 */
export async function generateStyledImage(
  input: ImageToImageInput,
  model: ImageModel = "flux2"
): Promise<ImageResult> {
  const modelId = IMAGE_MODELS[model];

  const result = await fal.subscribe(modelId, {
    input: {
      image_url: input.imageUrl,
      prompt: input.prompt,
      negative_prompt: input.negativePrompt || "",
      strength: input.strength || 0.65,
      num_inference_steps: input.numInferenceSteps || 28,
      guidance_scale: input.guidanceScale || 7.5,
      seed: input.seed,
    } as any,
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === "IN_PROGRESS") {
        console.log(`Image generation in progress...`);
      }
    },
  });

  const data = result.data as any;

  // Handle different response formats
  const image = data.images?.[0] || data.image || data.output;

  return {
    imageUrl: image?.url || image,
    width: image?.width || data.width,
    height: image?.height || data.height,
    seed: data.seed,
  };
}

/**
 * Generate styled image using a preset style
 */
export async function generateImageWithStyle(
  imageUrl: string,
  style: StylePreset
): Promise<ImageResult> {
  const preset = STYLE_PRESETS[style];

  return generateStyledImage({
    imageUrl,
    prompt: preset.prompt,
    negativePrompt: preset.negativePrompt,
    strength: preset.strength,
  });
}

/**
 * Batch generate styled images for multiple photos
 */
export async function batchGenerateStyledImages(
  imageUrls: string[],
  style: StylePreset,
  onProgress?: (completed: number, total: number) => void
): Promise<ImageResult[]> {
  const results: ImageResult[] = [];
  const total = imageUrls.length;

  for (let i = 0; i < imageUrls.length; i++) {
    const result = await generateImageWithStyle(imageUrls[i], style);
    results.push(result);
    onProgress?.(i + 1, total);
  }

  return results;
}

/**
 * Submit image generation to queue (async)
 */
export async function submitImageGeneration(
  input: ImageToImageInput,
  model: ImageModel = "flux2"
): Promise<{ requestId: string }> {
  const modelId = IMAGE_MODELS[model];

  const { request_id } = await fal.queue.submit(modelId, {
    input: {
      image_url: input.imageUrl,
      prompt: input.prompt,
      negative_prompt: input.negativePrompt || "",
      strength: input.strength || 0.65,
      num_inference_steps: input.numInferenceSteps || 28,
      guidance_scale: input.guidanceScale || 7.5,
      seed: input.seed,
    } as any,
  });

  return { requestId: request_id };
}

/**
 * Get image generation result
 */
export async function getImageResult(
  requestId: string,
  model: ImageModel = "flux2"
): Promise<ImageResult> {
  const modelId = IMAGE_MODELS[model];

  const result = await fal.queue.result(modelId, {
    requestId,
  });

  const data = result.data as any;
  const image = data.images?.[0] || data.image || data.output;

  return {
    imageUrl: image?.url || image,
    width: image?.width || data.width,
    height: image?.height || data.height,
    seed: data.seed,
  };
}

/**
 * Generate video from image using Framepack model
 * Good for creating dynamic videos from static images
 */
export async function generateVideoFromImage(
  input: ImageToVideoInput,
  model: VideoModel = "framepack"
): Promise<VideoResult> {
  const modelId = VIDEO_MODELS[model];

  const result = await fal.subscribe(modelId, {
    input: {
      prompt: input.prompt,
      image_url: input.imageUrl,
      negative_prompt: input.negativePrompt || "",
      aspect_ratio: input.aspectRatio || "16:9",
      num_frames: input.numFrames || 120,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === "IN_PROGRESS") {
        console.log(`Video generation in progress...`);
      }
    },
  });

  // Handle different response formats from different models
  const data = result.data as any;

  return {
    videoUrl: data.video?.url || data.video_url || data.output?.video_url,
    thumbnailUrl: data.thumbnail?.url || data.thumbnail_url,
    duration: data.duration,
    width: data.width,
    height: data.height,
  };
}

/**
 * Generate video from text prompt
 */
export async function generateVideoFromText(
  input: TextToVideoInput
): Promise<VideoResult> {
  const result = await fal.subscribe(VIDEO_MODELS.animateDiff, {
    input: {
      prompt: input.prompt,
      negative_prompt: input.negativePrompt || "",
      video_size: input.aspectRatio === "9:16" ? "portrait_16_9" : "landscape_16_9",
    },
    logs: true,
  });

  const data = result.data as any;

  return {
    videoUrl: data.video?.url || data.video_url,
    thumbnailUrl: data.thumbnail?.url,
    duration: data.duration,
  };
}

/**
 * Submit a video generation request to the queue
 * Returns immediately with a request ID for polling
 */
export async function submitVideoGeneration(
  input: ImageToVideoInput,
  model: VideoModel = "framepack"
): Promise<{ requestId: string }> {
  const modelId = VIDEO_MODELS[model];

  const { request_id } = await fal.queue.submit(modelId, {
    input: {
      prompt: input.prompt,
      image_url: input.imageUrl,
      negative_prompt: input.negativePrompt || "",
      aspect_ratio: input.aspectRatio || "16:9",
      num_frames: input.numFrames || 120,
    },
  });

  return { requestId: request_id };
}

/**
 * Check the status of a queued request
 */
export async function checkVideoStatus(
  requestId: string,
  model: VideoModel = "framepack"
): Promise<QueueStatus> {
  const modelId = VIDEO_MODELS[model];

  const status = await fal.queue.status(modelId, {
    requestId,
    logs: true,
  });

  // Cast to any to handle different response shapes
  const statusData = status as any;

  return {
    requestId,
    status: statusData.status as QueueStatus["status"],
    position: statusData.queue_position ?? statusData.position,
    eta: statusData.eta,
  };
}

/**
 * Get the result of a completed video generation
 */
export async function getVideoResult(
  requestId: string,
  model: VideoModel = "framepack"
): Promise<VideoResult> {
  const modelId = VIDEO_MODELS[model];

  const result = await fal.queue.result(modelId, {
    requestId,
  });

  const data = result.data as any;

  return {
    videoUrl: data.video?.url || data.video_url || data.output?.video_url,
    thumbnailUrl: data.thumbnail?.url || data.thumbnail_url,
    duration: data.duration,
    width: data.width,
    height: data.height,
  };
}

/**
 * Upload a file to fal storage (for images that need to be processed)
 */
export async function uploadToFalStorage(file: File | Blob): Promise<string> {
  const url = await fal.storage.upload(file);
  return url;
}

// =============================================================================
// Kling O1 Reference-to-Video (with Elements for Character Consistency)
// =============================================================================

/**
 * Generate video using Kling O1 with character/element references
 * This model allows referencing characters as @Element1 in prompts for consistency
 *
 * @example
 * // Single character scene
 * generateKlingO1Video({
 *   prompt: "The character from @Element1 walks through a beautiful garden, smiling happily",
 *   elements: [{ referenceImageUrls: [characterPhotoUrl], frontalImageUrl: characterPhotoUrl }],
 *   duration: "5",
 *   aspectRatio: "9:16"
 * })
 */
export async function generateKlingO1Video(
  input: KlingO1Input,
  usePro: boolean = false
): Promise<VideoResult> {
  const modelId = usePro ? VIDEO_MODELS.klingO1Pro : VIDEO_MODELS.klingO1Standard;

  console.log("[Kling O1] Generating video with model:", modelId);
  console.log("[Kling O1] Input:", JSON.stringify(input, null, 2));

  const requestInput: Record<string, unknown> = {
    prompt: input.prompt,
    duration: input.duration || "5",
    aspect_ratio: input.aspectRatio || "9:16",
  };

  if (input.elements && input.elements.length > 0) {
    requestInput.elements = input.elements.map((el) => ({
      reference_image_urls: el.referenceImageUrls,
      frontal_image_url: el.frontalImageUrl,
    }));
  }

  if (input.imageUrls && input.imageUrls.length > 0) {
    requestInput.image_urls = input.imageUrls;
  }

  const result = await fal.subscribe(modelId, {
    input: requestInput,
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === "IN_PROGRESS") {
        console.log("[Kling O1] Video generation in progress...");
      }
    },
  });

  const data = result.data as any;
  console.log("[Kling O1] Result:", JSON.stringify(data, null, 2));

  return {
    videoUrl: data.video?.url || data.video_url,
    thumbnailUrl: data.thumbnail?.url,
    duration: parseInt(input.duration || "5"),
    width: data.width,
    height: data.height,
  };
}

/**
 * Submit Kling O1 video generation to queue (async)
 */
export async function submitKlingO1Video(
  input: KlingO1Input,
  usePro: boolean = false
): Promise<{ requestId: string }> {
  const modelId = usePro ? VIDEO_MODELS.klingO1Pro : VIDEO_MODELS.klingO1Standard;

  const requestInput: Record<string, unknown> = {
    prompt: input.prompt,
    duration: input.duration || "5",
    aspect_ratio: input.aspectRatio || "9:16",
  };

  if (input.elements && input.elements.length > 0) {
    requestInput.elements = input.elements.map((el) => ({
      reference_image_urls: el.referenceImageUrls,
      frontal_image_url: el.frontalImageUrl,
    }));
  }

  if (input.imageUrls && input.imageUrls.length > 0) {
    requestInput.image_urls = input.imageUrls;
  }

  const { request_id } = await fal.queue.submit(modelId, {
    input: requestInput,
  });

  return { requestId: request_id };
}

/**
 * Check status of Kling O1 video generation
 */
export async function checkKlingO1Status(
  requestId: string,
  usePro: boolean = false
): Promise<QueueStatus> {
  const modelId = usePro ? VIDEO_MODELS.klingO1Pro : VIDEO_MODELS.klingO1Standard;

  const status = await fal.queue.status(modelId, {
    requestId,
    logs: true,
  });

  const statusData = status as any;

  return {
    requestId,
    status: statusData.status as QueueStatus["status"],
    position: statusData.queue_position ?? statusData.position,
    eta: statusData.eta,
  };
}

/**
 * Get result of completed Kling O1 video generation
 */
export async function getKlingO1Result(
  requestId: string,
  usePro: boolean = false
): Promise<VideoResult> {
  const modelId = usePro ? VIDEO_MODELS.klingO1Pro : VIDEO_MODELS.klingO1Standard;

  const result = await fal.queue.result(modelId, {
    requestId,
  });

  const data = result.data as any;

  return {
    videoUrl: data.video?.url || data.video_url,
    thumbnailUrl: data.thumbnail?.url,
    duration: data.duration,
    width: data.width,
    height: data.height,
  };
}

// Re-export fal client for advanced usage
export { fal };
