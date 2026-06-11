'use client';
// Transformers.js(ormbg, Apache-2.0) 기반 배경 제거 — WebGPU 우선, 실패 시 CPU(wasm) 폴백
// background-removal 파이프라인이 전처리·마스크·알파를 모델별로 내부 처리.
// 파이프라인은 1회 로드 후 캐시(싱글톤). HF 모델 파일은 자체 프록시(/api/hf) 경유.
// Model: onnx-community/ormbg-ONNX (IS-Net/DIS 아키텍처, Apache-2.0 — 상업적 사용 허용)

type ProgressFn = (stage: 'download' | 'compute', pct: number) => void;

const MODEL_ID = 'onnx-community/ormbg-ONNX';

let loadPromise: Promise<any> | null = null;
let currentDevice: 'webgpu' | 'wasm' | null = null;

async function detectDevice(): Promise<'webgpu' | 'wasm'> {
  try {
    const gpu = (navigator as any).gpu;
    if (gpu) {
      const adapter = await gpu.requestAdapter();
      if (adapter) return 'webgpu';
    }
  } catch {}
  return 'wasm';
}

async function load(onProgress?: ProgressFn, forceDevice?: 'webgpu' | 'wasm') {
  if (!loadPromise) {
    loadPromise = (async () => {
      const { pipeline, env } = await import('@huggingface/transformers');

      // HF 모델 파일을 자체 프록시로 받아 지역 차단 우회
      env.allowLocalModels = false;
      env.remoteHost = `${window.location.origin}/api/hf`;
      env.remotePathTemplate = '{model}/resolve/{revision}/';

      const device = forceDevice ?? (await detectDevice());
      currentDevice = device;
      const progress_callback = (p: any) => {
        if (p?.status === 'progress' && p.total) {
          onProgress?.('download', Math.round((p.loaded / p.total) * 100));
        }
      };

      return pipeline('background-removal', MODEL_ID, {
        device,
        dtype: 'fp32',
        progress_callback,
      });
    })();
  }
  return loadPromise;
}

export async function preloadBgModel() {
  try { await load(); } catch {}
}

export async function removeBg(file: File | Blob, onProgress?: ProgressFn): Promise<Blob> {
  let segmenter = await load(onProgress);
  const url = URL.createObjectURL(file);
  try {
    onProgress?.('compute', 20);
    let result: any;
    try {
      result = await segmenter(url);
    } catch (err) {
      // WebGPU에서 실패(셰이더 한계/디바이스 등) 시 wasm으로 폴백 후 재시도
      if (currentDevice === 'webgpu') {
        loadPromise = null;
        segmenter = await load(onProgress, 'wasm');
        result = await segmenter(url);
      } else {
        throw err;
      }
    }
    const out = Array.isArray(result) ? result[0] : result;
    const blob: Blob = await out.toBlob('image/png');
    onProgress?.('compute', 100);
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}
