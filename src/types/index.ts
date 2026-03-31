export type EditorMode = 'foreground' | 'background' | 'view';
export type BrushType = 'add' | 'erase';
export type OutputFormat = 'png' | 'jpeg';
export type BackgroundType = 'transparent' | 'color' | 'gradient' | 'blur' | 'image';
export type ShadowType = 'none' | 'soft' | 'drop' | 'float';

export interface GradientConfig {
  from: string;
  to: string;
  angle: number; // degrees
}

export interface EffectsConfig {
  shadowType: ShadowType;
  shadowOpacity: number;   // 0–1
  shadowBlur: number;      // px
  shadowOffsetX: number;
  shadowOffsetY: number;
  brightness: number;      // 0–200 (100 = normal)
  contrast: number;        // 0–200 (100 = normal)
  saturation: number;      // 0–200 (100 = normal)
}

export interface EditorStore {
  originalFile: File | null;
  originalDataUrl: string | null;
  processedBlob: Blob | null;
  processedDataUrl: string | null;

  mode: EditorMode;
  brushSize: number;
  brushType: BrushType;
  zoom: number;

  // Background
  backgroundColor: string;
  backgroundType: BackgroundType;
  backgroundImageUrl: string | null;
  backgroundGradient: GradientConfig;
  backgroundBlur: number; // 0–40px

  // Effects
  effects: EffectsConfig;

  showOriginal: boolean;

  isProcessing: boolean;
  processingProgress: number;
  processingError: string | null;

  setOriginalFile: (file: File, dataUrl: string) => void;
  setProcessedBlob: (blob: Blob, dataUrl: string) => void;
  setMode: (mode: EditorMode) => void;
  setBrushSize: (size: number) => void;
  setBrushType: (type: BrushType) => void;
  setZoom: (zoom: number) => void;
  setBackgroundColor: (color: string) => void;
  setBackgroundType: (type: BackgroundType) => void;
  setBackgroundImageUrl: (url: string | null) => void;
  setBackgroundGradient: (g: GradientConfig) => void;
  setBackgroundBlur: (v: number) => void;
  setEffects: (e: Partial<EffectsConfig>) => void;
  setShowOriginal: (v: boolean) => void;
  setIsProcessing: (v: boolean) => void;
  setProcessingProgress: (p: number) => void;
  setProcessingError: (e: string | null) => void;
  reset: () => void;
}
