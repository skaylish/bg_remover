'use client';
// Transformers.js(BiRefNet_lite, MIT 라이선스) 기반 배경 제거 — WebGPU 우선, CPU(wasm) 폴백
// 모델/프로세서는 1회 로드 후 캐시(싱글톤). HF 모델 파일은 자체 프록시(/api/hf) 경유.
// Model: onnx-community/BiRefNet_lite (BiRefNet, MIT License — 상업적 사용 허용)

type ProgressFn = (stage: 'download' | 'compute', pct: number) => void;

const MODEL_ID = 'onnx-community/BiRefNet_lite';

let loadPromise: Promise<{ model: any; processor: any; RawImage: any }> | null = null;

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

async function load(onProgress?: ProgressFn) {
  if (!loadPromise) {
    loadPromise = (async () => {
      const { env, AutoModel, AutoProcessor, RawImage } = await import('@huggingface/transformers');

      // HF 모델 파일을 자체 프록시로 받아 지역 차단 우회
      env.allowLocalModels = false;
      env.remoteHost = `${window.location.origin}/api/hf`;
      env.remotePathTemplate = '{model}/resolve/{revision}/';

      const device = await detectDevice();
      const progress_callback = (p: any) => {
        if (p?.status === 'progress' && p.total) {
          onProgress?.('download', Math.round((p.loaded / p.total) * 100));
        }
      };

      const model = await AutoModel.from_pretrained(MODEL_ID, {
        device,
        dtype: 'fp32',
        progress_callback,
      });
      const processor = await AutoProcessor.from_pretrained(MODEL_ID);
      return { model, processor, RawImage };
    })();
  }
  return loadPromise;
}

export async function preloadBgModel() {
  try { await load(); } catch {}
}

export async function removeBg(file: File | Blob, onProgress?: ProgressFn): Promise<Blob> {
  const { model, processor, RawImage } = await load(onProgress);
  onProgress?.('compute', 5);

  const url = URL.createObjectURL(file);
  try {
    const image = await RawImage.fromURL(url);
    const { pixel_values } = await processor(image);
    onProgress?.('compute', 35);

    const result = await model({ input_image: pixel_values });
    const output = result.output_image ?? Object.values(result)[0];
    onProgress?.('compute', 80);

    const mask = await RawImage.fromTensor(output[0].sigmoid().mul(255).to('uint8'))
      .resize(image.width, image.height);
    const composed = image.clone().putAlpha(mask);
    const blob: Blob = await composed.toBlob('image/png');
    onProgress?.('compute', 100);
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}
