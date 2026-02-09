"use client";

import { useState, useCallback } from "react";
import CropperRaw from "react-easy-crop";
import type { Area, CropperProps } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { X, Check, RotateCcw } from "lucide-react";

// react-easy-crop is a class component - cast for React 19 compatibility
const Cropper = CropperRaw as unknown as React.FC<Partial<CropperProps>>;

interface ImageCropModalProps {
  imageSrc: string;
  onCropComplete: (croppedAreaPixels: Area) => void;
  onClose: () => void;
}

const ASPECT_OPTIONS = [
  { label: "Livre", value: 0 },
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "3:4", value: 3 / 4 },
  { label: "16:9", value: 16 / 9 },
  { label: "9:16", value: 9 / 16 },
] as const;

export function ImageCropModal({
  imageSrc,
  onCropComplete,
  onClose,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropCompleteInternal = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleConfirm = () => {
    if (croppedAreaPixels) {
      onCropComplete(croppedAreaPixels);
    }
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/80 border-b border-zinc-800">
        <button
          onClick={onClose}
          className="p-2 text-zinc-400 hover:text-white transition"
        >
          <X className="w-6 h-6" />
        </button>
        <span className="text-white font-medium">Recortar Imagem</span>
        <button
          onClick={handleReset}
          className="p-2 text-zinc-400 hover:text-white transition"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Crop area */}
      <div className="flex-1 relative">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          {...(aspect > 0 ? { aspect } : {})}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropCompleteInternal}
          showGrid
          style={{
            containerStyle: { background: "#000" },
            cropAreaStyle: { border: "2px solid #ec4899" },
          }}
        />
      </div>

      {/* Aspect ratio selector */}
      <div className="px-4 py-2 bg-zinc-900/80 border-t border-zinc-800">
        <div className="flex items-center gap-2 justify-center">
          {ASPECT_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => setAspect(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                aspect === opt.value
                  ? "bg-pink-500 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Zoom slider */}
      <div className="px-6 py-3 bg-zinc-900/80">
        <div className="flex items-center gap-4">
          <span className="text-xs text-zinc-400">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-pink-500"
          />
          <span className="text-xs text-zinc-400 w-10 text-right">
            {zoom.toFixed(1)}x
          </span>
        </div>
      </div>

      {/* Confirm button */}
      <div className="px-4 py-4 bg-zinc-900/80 border-t border-zinc-800">
        <Button
          onClick={handleConfirm}
          disabled={!croppedAreaPixels}
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white border-0 rounded-xl"
        >
          <Check className="w-5 h-5 mr-2" />
          Confirmar Recorte
        </Button>
      </div>
    </div>
  );
}
