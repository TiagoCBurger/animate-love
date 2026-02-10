"use client";

import { useReducer, useCallback, useEffect, useRef } from "react";
import type { FunnelState, FunnelAction, FunnelStep, Character, SerializableDraft } from "@/types/funnel";
import type { Scene, SceneDuration, SceneType } from "@/types/scene";
import { createScene } from "@/types/scene";

const DRAFT_KEY = "funnel_draft";

// Steps that represent meaningful progress worth saving
const SAVEABLE_STEPS: FunnelStep[] = ["characters", "style", "scenes", "email-verification", "scene-preview", "paywall"];

const initialState: FunnelState = {
  step: "landing",
  characters: [],
  selectedStyle: null,
  scenes: [],
  generationProgress: null,
  generationError: null,
  videoUrls: [],
};

function funnelReducer(state: FunnelState, action: FunnelAction): FunnelState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.step };

    case "ADD_CHARACTER":
      return { ...state, characters: [...state.characters, action.character] };

    case "UPDATE_CHARACTER":
      return {
        ...state,
        characters: state.characters.map((c) =>
          c.id === action.id ? { ...c, ...action.updates } : c
        ),
      };

    case "REMOVE_CHARACTER":
      return {
        ...state,
        characters: state.characters.filter((c) => c.id !== action.id),
      };

    case "SET_STYLE":
      return { ...state, selectedStyle: action.styleId };

    case "ADD_SCENE": {
      const newScene = createScene(
        action.sceneType,
        action.duration,
        action.referencePhotoId
      );
      // Auto-include all characters that have photos in new scenes
      const characterIds = state.characters
        .filter((c) => c.originalPreview)
        .map((c) => c.id);
      newScene.referenceCharacterIds = characterIds;
      return { ...state, scenes: [...state.scenes, newScene] };
    }

    case "UPDATE_SCENE":
      return {
        ...state,
        scenes: state.scenes.map((s) =>
          s.id === action.id ? { ...s, ...action.updates } : s
        ),
      };

    case "REMOVE_SCENE":
      return {
        ...state,
        scenes: state.scenes.filter((s) => s.id !== action.id),
      };

    case "SET_SCENES":
      return { ...state, scenes: action.scenes };

    case "SET_GENERATION_PROGRESS":
      return { ...state, generationProgress: action.progress };

    case "SET_GENERATION_ERROR":
      return { ...state, generationError: action.error };

    case "SET_VIDEO_URLS":
      return { ...state, videoUrls: action.urls };

    case "RESTORE_DRAFT":
      return {
        ...state,
        step: action.draft.step,
        characters: action.draft.characters.map((c) => ({
          ...c,
          originalFile: null,
        })),
        selectedStyle: action.draft.selectedStyle,
        scenes: action.draft.scenes,
        videoUrls: action.draft.videoUrls,
      };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

export function useFunnelState() {
  const [state, dispatch] = useReducer(funnelReducer, initialState);

  const setStep = useCallback(
    (step: FunnelStep) => dispatch({ type: "SET_STEP", step }),
    []
  );

  const addCharacter = useCallback(
    (character: Character) => dispatch({ type: "ADD_CHARACTER", character }),
    []
  );

  const updateCharacter = useCallback(
    (id: string, updates: Partial<Character>) =>
      dispatch({ type: "UPDATE_CHARACTER", id, updates }),
    []
  );

  const removeCharacter = useCallback(
    (id: string) => dispatch({ type: "REMOVE_CHARACTER", id }),
    []
  );

  const setStyle = useCallback(
    (styleId: string | null) => dispatch({ type: "SET_STYLE", styleId }),
    []
  );

  const addScene = useCallback(
    (sceneType: SceneType, duration: SceneDuration, referencePhotoId?: string) =>
      dispatch({ type: "ADD_SCENE", sceneType, duration, referencePhotoId }),
    []
  );

  const updateScene = useCallback(
    (id: string, updates: Partial<Scene>) =>
      dispatch({ type: "UPDATE_SCENE", id, updates }),
    []
  );

  const removeScene = useCallback(
    (id: string) => dispatch({ type: "REMOVE_SCENE", id }),
    []
  );

  const setScenes = useCallback(
    (scenes: Scene[]) => dispatch({ type: "SET_SCENES", scenes }),
    []
  );

  const setGenerationProgress = useCallback(
    (progress: FunnelState["generationProgress"]) =>
      dispatch({ type: "SET_GENERATION_PROGRESS", progress }),
    []
  );

  const setGenerationError = useCallback(
    (error: string | null) =>
      dispatch({ type: "SET_GENERATION_ERROR", error }),
    []
  );

  const setVideoUrls = useCallback(
    (urls: string[]) => dispatch({ type: "SET_VIDEO_URLS", urls }),
    []
  );

  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  // localStorage draft functions
  const saveDraft = useCallback(() => {
    try {
      const draft: SerializableDraft = {
        step: state.step,
        characters: state.characters.map(({ originalFile, ...rest }) => rest),
        selectedStyle: state.selectedStyle,
        scenes: state.scenes,
        videoUrls: state.videoUrls,
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      console.error("Failed to save draft to localStorage");
    }
  }, [state]);

  const loadDraft = useCallback((): boolean => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return false;
      const draft: SerializableDraft = JSON.parse(raw);
      if (!draft.characters?.length && !draft.scenes?.length) return false;
      dispatch({ type: "RESTORE_DRAFT", draft });
      return true;
    } catch {
      return false;
    }
  }, []);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      // Ignore
    }
  }, []);

  // Auto-load draft on mount (works for logged and non-logged users)
  const hasLoadedDraft = useRef(false);
  useEffect(() => {
    if (!hasLoadedDraft.current) {
      hasLoadedDraft.current = true;
      loadDraft();
    }
  }, [loadDraft]);

  // Auto-save draft whenever user reaches a meaningful step
  useEffect(() => {
    if (SAVEABLE_STEPS.includes(state.step) && state.characters.length > 0) {
      saveDraft();
    }
  }, [state.step, state.characters.length, state.selectedStyle, state.scenes, saveDraft]);

  return {
    state,
    dispatch,
    setStep,
    addCharacter,
    updateCharacter,
    removeCharacter,
    setStyle,
    addScene,
    updateScene,
    removeScene,
    setScenes,
    setGenerationProgress,
    setGenerationError,
    setVideoUrls,
    reset,
    saveDraft,
    loadDraft,
    clearDraft,
  };
}
