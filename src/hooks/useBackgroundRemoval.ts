'use client';

// 배경 제거 처리 훅 — 모델 다운로드와 이미지 처리(추론) 진행률 분리
import { useCallback, useRef, useState } from 'react';
import { removeBg } from '@/lib/bgRemoval';

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

    try {
      const blob = await removeBg(file, (stage, pct) => {
        if (stage === 'download') {
          setIsDownloadingModel(true);
          setModelProgress(pct);
        } else {
          setIsDownloadingModel(false);
          setProgress(pct);
        }
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
