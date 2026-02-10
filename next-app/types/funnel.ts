import type { Scene, SceneDuration, SceneType } from "./scene";

// =============================================================================
// Character Types
// =============================================================================

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  originalFile: File | null;
  originalPreview: string;
  uploadedUrl?: string;
  cropData?: CropData;
  croppedPreview?: string;
  croppedUploadedUrl?: string;
  styledUrl?: string;
  styleStatus?: "idle" | "generating" | "done" | "error";
}

// =============================================================================
// Funnel Step Types
// =============================================================================

export type FunnelStep =
  | "landing"
  | "characters"
  | "style"
  | "scenes"
  | "email-verification"
  | "scene-preview"
  | "paywall"
  | "loading"
  | "result";

// =============================================================================
// Generation Progress
// =============================================================================

export interface GenerationProgress {
  stage:
    | "uploading"
    | "generating-images"
    | "generating-videos"
    | "concatenating"
    | "complete";
  currentScene: number;
  totalScenes: number;
  currentStage: "image" | "video";
  message: string;
  percentage: number;
}

// =============================================================================
// Funnel State
// =============================================================================

export interface FunnelState {
  step: FunnelStep;
  characters: Character[];
  selectedStyle: string | null;
  scenes: Scene[];
  generationProgress: GenerationProgress | null;
  generationError: string | null;
  videoUrls: string[];
}

// =============================================================================
// Funnel Actions
// =============================================================================

export interface SerializableDraft {
  step: FunnelStep;
  characters: Array<Omit<Character, "originalFile">>;
  selectedStyle: string | null;
  scenes: Scene[];
  videoUrls: string[];
}

export type FunnelAction =
  | { type: "SET_STEP"; step: FunnelStep }
  | { type: "ADD_CHARACTER"; character: Character }
  | { type: "UPDATE_CHARACTER"; id: string; updates: Partial<Character> }
  | { type: "REMOVE_CHARACTER"; id: string }
  | { type: "SET_STYLE"; styleId: string | null }
  | { type: "ADD_SCENE"; sceneType: SceneType; duration: SceneDuration; referencePhotoId?: string }
  | { type: "UPDATE_SCENE"; id: string; updates: Partial<Scene> }
  | { type: "REMOVE_SCENE"; id: string }
  | { type: "SET_SCENES"; scenes: Scene[] }
  | { type: "SET_GENERATION_PROGRESS"; progress: GenerationProgress | null }
  | { type: "SET_GENERATION_ERROR"; error: string | null }
  | { type: "SET_VIDEO_URLS"; urls: string[] }
  | { type: "RESTORE_DRAFT"; draft: SerializableDraft }
  | { type: "RESET" };
