'use client';

// 배경 제거 처리 훅 — 모델 다운로드(fetch)와 이미지 처리(compute) 진행률 분리
import { useCallback, useRef, useState } from 'react';

export function useBackgroundRemoval() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [modelProgress, setModelProgress] = useState(0);
  const [isDownloadingModel, setIsDownloadingModel] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const process = useCallback(async (file: File): Promise<Blob> => {
    setIsProcessing(true);
    setProgress(0);
    setModelProgress(0);
    setIsDownloadingModel(false);
    setError(null);

    abortRef.current = new AbortController();

    // fetch: → 모델 다운로드(전역, 1회), compute: → 실제 이미지 처리
    const onProgress = (key: string, current: number, total: number) => {
      if (key.startsWith('fetch:')) {
        setIsDownloadingModel(true);
        if (total > 0) setModelProgress(Math.round((current / total) * 100));
      } else {
        setIsDownloadingModel(false);
        if (total > 0) setProgress(Math.round((current / total) * 100));
      }
    };

    try {
      const { removeBackground } = await import('@imgly/background-removal');

      const publicPath = `${window.location.origin}/bgmodel/`;
      const baseOpts = {
        debug: false,
        model: 'isnet' as const,
        publicPath,
        proxyToWorker: true,
        output: { format: 'image/png' as const, quality: 1 },
        progress: onProgress,
      };

      let blob: Blob;
      try {
        blob = await removeBackground(file, { ...baseOpts, device: 'gpu' as const });
      } catch {
        // GPU 실패 시 CPU fallback
        setProgress(0);
        blob = await removeBackground(file, { ...baseOpts, device: 'cpu' as const });
      }

      setProgress(100);
      return blob;
    } catch (err) {
      const msg = err instanceof Error ? err.message : '배경 제거 중 오류가 발생했습니다.';
      setError(msg);
      throw err;
    } finally {
      setIsProcessing(false);
      setIsDownloadingModel(false);
    }
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setIsProcessing(false);
    setProgress(0);
  }, []);

  return { process, progress, modelProgress, isDownloadingModel, isProcessing, error, cancel };
}
