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
      // CPU(wasm) 단일 경로 — WebGPU는 이 환경에서 불안정(디바이스 손실/빈 출력/크래시).
      // 풀 정밀도 isnet(fp32)은 CPU에서도 참조 정밀도 그대로 고품질 출력.
      // crossOriginIsolated=true이므로 멀티스레드 wasm으로 처리.
      const blob = await removeBackground(file, {
        debug: false,
        model: 'isnet' as const,
        publicPath,
        device: 'cpu' as const,
        proxyToWorker: true,
        output: { format: 'image/png' as const, quality: 1 },
        progress: onProgress,
      });

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
