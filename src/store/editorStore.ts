import { create } from 'zustand';
import type { EditorStore, EditorMode, BrushType, BackgroundType, GradientConfig, EffectsConfig } from '@/types';

const DEFAULT_GRADIENT: GradientConfig = { from: '#6366f1', to: '#a855f7', angle: 135 };
const DEFAULT_EFFECTS: EffectsConfig = {
  shadowType: 'none',
  shadowOpacity: 0.5,
  shadowBlur: 20,
  shadowOffsetX: 0,
  shadowOffsetY: 10,
  brightness: 100,
  contrast: 100,
  saturation: 100,
};

export const useEditorStore = create<EditorStore>((set) => ({
  originalFile: null,
  originalDataUrl: null,
  processedBlob: null,
  processedDataUrl: null,

  mode: 'view',
  brushSize: 20,
  brushType: 'erase',
  zoom: 1,

  backgroundColor: '#ffffff',
  backgroundType: 'transparent',
  backgroundImageUrl: null,
  backgroundGradient: DEFAULT_GRADIENT,
  backgroundBlur: 10,

  effects: DEFAULT_EFFECTS,

  showOriginal: false,

  isProcessing: false,
  processingProgress: 0,
  processingError: null,

  setOriginalFile: (file, dataUrl) => set({ originalFile: file, originalDataUrl: dataUrl }),
  setProcessedBlob: (blob, dataUrl) => set({ processedBlob: blob, processedDataUrl: dataUrl }),
  setMode: (mode: EditorMode) => set({ mode }),
  setBrushSize: (brushSize) => set({ brushSize }),
  setBrushType: (brushType: BrushType) => set({ brushType }),
  setZoom: (zoom) => set({ zoom }),
  setBackgroundColor: (backgroundColor) => set({ backgroundColor }),
  setBackgroundType: (backgroundType: BackgroundType) => set({ backgroundType }),
  setBackgroundImageUrl: (backgroundImageUrl) => set({ backgroundImageUrl }),
  setBackgroundGradient: (backgroundGradient: GradientConfig) => set({ backgroundGradient }),
  setBackgroundBlur: (backgroundBlur) => set({ backgroundBlur }),
  setEffects: (e: Partial<EffectsConfig>) => set((s) => ({ effects: { ...s.effects, ...e } })),
  setShowOriginal: (showOriginal) => set({ showOriginal }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  setProcessingProgress: (processingProgress) => set({ processingProgress }),
  setProcessingError: (processingError) => set({ processingError }),
  reset: () =>
    set({
      originalFile: null,
      originalDataUrl: null,
      processedBlob: null,
      processedDataUrl: null,
      mode: 'view',
      brushSize: 20,
      brushType: 'erase',
      zoom: 1,
      backgroundColor: '#ffffff',
      backgroundType: 'transparent',
      backgroundImageUrl: null,
      backgroundGradient: DEFAULT_GRADIENT,
      backgroundBlur: 10,
      effects: DEFAULT_EFFECTS,
      showOriginal: false,
      isProcessing: false,
      processingProgress: 0,
      processingError: null,
    }),
}));
