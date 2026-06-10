'use client';

import { useCallback, useRef, useState } from 'react';

export function useBackgroundRemoval() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const process = useCallback(async (file: File): Promise<Blob> => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    abortRef.current = new AbortController();

    try {
      const { removeBackground } = await import('@imgly/background-removal');

      const publicPath = `${window.location.origin}/bgremoval-cdn/`;
      let blob: Blob;
      try {
        blob = await removeBackground(file, {
          debug: false,
          model: 'isnet' as const,
          device: 'gpu' as const,
          publicPath,
          proxyToWorker: true,
          output: { format: 'image/png' as const, quality: 1 },
          progress: (_key: string, current: number, total: number) => {
            if (total > 0) setProgress(Math.round((current / total) * 100));
          },
        });
      } catch {
        // GPU 실패 시 CPU fallback
        setProgress(0);
        blob = await removeBackground(file, {
          debug: false,
          model: 'isnet' as const,
          device: 'cpu' as const,
          publicPath,
          proxyToWorker: true,
          output: { format: 'image/png' as const, quality: 1 },
          progress: (_key: string, current: number, total: number) => {
            if (total > 0) setProgress(Math.round((current / total) * 100));
          },
        });
      }

      setProgress(100);
      return blob;
    } catch (err) {
      const msg = err instanceof Error ? err.message : '배경 제거 중 오류가 발생했습니다.';
      setError(msg);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setIsProcessing(false);
    setProgress(0);
  }, []);

  return { process, progress, isProcessing, error, cancel };
}
