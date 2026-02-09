// =============================================================================
// KIE.AI API Types
// =============================================================================

// Base Types
export interface KieApiResponse<T = unknown> {
  code: number;
  msg: string;
  data: T;
}

export interface KieTaskResponse {
  taskId: string;
}

export interface KieTaskResult {
  taskId: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress?: number;
  resultUrls?: string[];
  originUrls?: string[];
  resolution?: string;
  error?: string;
}

// Raw state values returned by Kie.ai API
export type KieRawState = "waiting" | "generating" | "success" | "fail";

// =============================================================================
// Image Generation Types
// =============================================================================

export type ImageAspectRatio =
  | "1:1"
  | "4:3"
  | "3:4"
  | "16:9"
  | "9:16"
  | "3:2"
  | "2:3"
  | "5:4"
  | "4:5"
  | "21:9"
  | "auto";

export type ImageOutputFormat = "png" | "jpeg";
export type ImageResolution = "1K" | "2K";

// Nano Banana Pro
export interface NanoBananaProOptions {
  prompt: string;
  aspectRatio?: ImageAspectRatio;
  outputFormat?: ImageOutputFormat;
  callbackUrl?: string;
}

// Flux 2
export interface Flux2Options {
  prompt: string;
  aspectRatio?: ImageAspectRatio;
  resolution?: ImageResolution;
  callbackUrl?: string;
}

// Grok Imagine
export interface GrokImageOptions {
  prompt: string;
  aspectRatio?: "1:1" | "2:3" | "3:2" | "16:9" | "9:16";
  callbackUrl?: string;
}

// =============================================================================
// Video Generation Types
// =============================================================================

export type VideoAspectRatio = "16:9" | "9:16" | "Auto";
export type Veo3Model = "veo3" | "veo3_fast";
export type Veo3GenerationType =
  | "TEXT_2_VIDEO"
  | "FIRST_AND_LAST_FRAMES_2_VIDEO"
  | "REFERENCE_2_VIDEO";

// Veo 3.1
export interface Veo3Options {
  prompt: string;
  model?: Veo3Model;
  generationType?: Veo3GenerationType;
  aspectRatio?: VideoAspectRatio;
  imageUrls?: string[];
  seeds?: number;
  enableTranslation?: boolean;
  watermark?: string;
  callbackUrl?: string;
}

// Sora 2
export type Sora2AspectRatio = "portrait" | "landscape";
export type Sora2Frames = "10" | "15";

export interface Sora2Options {
  prompt: string;
  aspectRatio?: Sora2AspectRatio;
  nFrames?: Sora2Frames;
  removeWatermark?: boolean;
  characterIdList?: string[];
  callbackUrl?: string;
  progressCallbackUrl?: string;
}

// Kling 2.5
export type KlingDuration = "5" | "10";
export type KlingModel = "v2.5-turbo-pro" | "v2.5-turbo" | "v2.1-master" | "v2.1-standard";

export interface KlingOptions {
  prompt: string;
  imageUrl: string;
  tailImageUrl?: string;
  duration?: KlingDuration;
  negativePrompt?: string;
  cfgScale?: number;
  model?: KlingModel;
  callbackUrl?: string;
}

// =============================================================================
// Model Names
// =============================================================================

export const KIE_MODELS = {
  // Image Models
  NANO_BANANA: "google/nano-banana",
  NANO_BANANA_PRO: "nano-banana-pro",
  NANO_BANANA_EDIT: "google/nano-banana-edit",
  FLUX2_PRO_TEXT_TO_IMAGE: "flux-2/pro-text-to-image",
  FLUX2_PRO_IMAGE_TO_IMAGE: "flux-2/pro-image-to-image",
  FLUX2_FLEX_IMAGE_TO_IMAGE: "flux-2/flex-image-to-image",
  GROK_TEXT_TO_IMAGE: "grok-imagine/text-to-image",
  GROK_IMAGE_TO_IMAGE: "grok-imagine/image-to-image",
  GROK_IMAGE_UPSCALE: "grok-imagine/upscale",
  GROK_IMAGE_TO_VIDEO: "grok-imagine/image-to-video",

  // Video Models
  VEO3: "veo3",
  VEO3_FAST: "veo3_fast",
  SORA2_TEXT_TO_VIDEO: "sora-2-text-to-video",
  SORA2_IMAGE_TO_VIDEO: "sora-2-image-to-video",
  SORA2_PRO_TEXT_TO_VIDEO: "sora-2-pro-text-to-video",
  SORA2_PRO_IMAGE_TO_VIDEO: "sora-2-pro-image-to-video",
  SORA2_CHARACTERS: "sora-2-characters",

  // Kling Video Models
  KLING_V2_5_TURBO_PRO: "kling/v2-5-turbo-image-to-video-pro",
  KLING_V2_5_TURBO_STANDARD: "kling/v2-5-turbo-image-to-video",
  KLING_V2_1_MASTER: "kling/v2-1-master-image-to-video",
  KLING_V2_1_STANDARD: "kling/v2-1-standard-image-to-video",
} as const;

export type KieModelName = (typeof KIE_MODELS)[keyof typeof KIE_MODELS];
