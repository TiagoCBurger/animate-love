import {
  Film,
  Brush,
  BookOpen,
  Palette,
} from "lucide-react";

export const STYLE_PRESETS = {
  pixar: {
    id: "pixar",
    name: "Pixar 3D",
    description: "Estilo 3D cartoon Disney/Pixar",
    icon: Film,
    color: "from-blue-500 to-cyan-500",
    bgColor: "from-blue-500/20 to-cyan-500/20",
    prompt: "3D cartoon style, Disney Pixar animation, smooth rendering, vibrant",
  },
  comic: {
    id: "comic",
    name: "Quadrinho",
    description: "Estilo Spider-Verse com tracos marcantes",
    icon: BookOpen,
    color: "from-violet-500 to-purple-500",
    bgColor: "from-violet-500/20 to-purple-500/20",
    prompt: "Comic book Spider-Verse style, bold ink outlines, halftone dots, cinematic",
  },
  oilpainting: {
    id: "oilpainting",
    name: "Pintura a Oleo",
    description: "Pinceladas marcantes e tracos expressivos",
    icon: Brush,
    color: "from-red-500 to-rose-600",
    bgColor: "from-red-500/20 to-rose-600/20",
    prompt: "oil painting style, bold brushstrokes, dramatic lighting, expressive features",
  },
  watercolor: {
    id: "watercolor",
    name: "Aquarela",
    description: "Estilo artistico com toque caricato Pixar",
    icon: Palette,
    color: "from-teal-500 to-emerald-500",
    bgColor: "from-teal-500/20 to-emerald-500/20",
    prompt: "watercolor painting with Pixar caricature influence, soft brushstrokes, charming stylized features",
  },
} as const;

export type StyleId = keyof typeof STYLE_PRESETS;
