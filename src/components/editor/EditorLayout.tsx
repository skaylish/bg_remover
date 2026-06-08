'use client';

import { useRef, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useEditorStore } from '@/store/editorStore';
import { useCreditStore } from '@/store/creditStore';
import { useBackgroundRemoval } from '@/hooks/useBackgroundRemoval';
import { ToolSidebar } from './ToolSidebar';
import { RightPanel } from './RightPanel';
import { TopBar } from './TopBar';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { PurchaseModal } from '@/components/shared/PurchaseModal';
import type { CanvasEditorHandle } from './CanvasEditor';

// sensitivity(0~100)를 gamma curve로 적용해 processedDataUrl 재생성
// sensitivity 50 = gamma 1.0 (원본 그대로)
// sensitivity > 50 = gamma < 1 (alpha 강화 → 전경 보존)
// sensitivity < 50 = gamma > 1 (alpha 약화 → 배경 제거 강화)
async function applyAlphaSensitivity(rawDataUrl: string, sensitivity: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // sensitivity 50 → gamma = 1 (변화 없음)
      const gamma = Math.pow(2, (50 - sensitivity) / 25);
      if (Math.abs(gamma - 1) > 0.01) {
        for (let i = 3; i < data.length; i += 4) {
          data[i] = Math.round(255 * Math.pow(data[i] / 255, gamma));
        }
        ctx.putImageData(imageData, 0, 0);
      }

      resolve(canvas.toDataURL('image/png'));
    };
    img.src = rawDataUrl;
  });
}

const CanvasEditor = dynamic(
  () => import('./CanvasEditor').then((m) => m.CanvasEditor),
  { ssr: false, loading: () => <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--bg-base)' }}><LoadingSpinner size={40} /></div> }
);

export function EditorLayout({ dict }: { dict?: any }) {
  const router = useRouter();
  const params = useParams();
  const lang = (params.lang as string) || 'ko';
  const originalDataUrl = useEditorStore((s) => s.originalDataUrl);
  const originalFile = useEditorStore((s) => s.originalFile);
  const processedDataUrl = useEditorStore((s) => s.processedDataUrl);
  const rawProcessedDataUrl = useEditorStore((s) => s.rawProcessedDataUrl);
  const removalSensitivity = useEditorStore((s) => s.removalSensitivity);
  const setProcessedBlob = useEditorStore((s) => s.setProcessedBlob);
  const setProcessedDataUrl = useEditorStore((s) => s.setProcessedDataUrl);
  const setRawProcessedDataUrl = useEditorStore((s) => s.setRawProcessedDataUrl);
  const isProcessing = useEditorStore((s) => s.isProcessing);
  const setIsProcessing = useEditorStore((s) => s.setIsProcessing);
  const processingError = useEditorStore((s) => s.processingError);
  const setProcessingError = useEditorStore((s) => s.setProcessingError);

  const canUndo = useEditorStore((s) => s.canUndo);
  const canRedo = useEditorStore((s) => s.canRedo);

  const useCredit = useCreditStore((s) => s.useCredit);

  const { process, progress } = useBackgroundRemoval();
  const canvasRef = useRef<CanvasEditorHandle>(null);
  const [editorReady, setEditorReady] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  // Strict Mode에서 useEffect가 두 번 실행될 때 ONNX 세션 중복 시작 방지
  const processingStartedRef = useRef(false);

  const t = dict?.editor?.layout || {
    removing_bg: 'AI 배경 제거 중...',
    downloading_model: '첫 실행 시 AI 모델을 다운로드합니다',
    processing: '처리 중',
    processing_failed: '처리 실패',
    restart: '다시 시작'
  };

  useEffect(() => {
    if (!originalFile || !originalDataUrl) {
      router.push(`/${lang}`);
      return;
    }
    if (processedDataUrl) {
      setEditorReady(true);
      return;
    }
    if (processingStartedRef.current) return;
    processingStartedRef.current = true;

    setIsProcessing(true);
    process(originalFile)
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        setProcessedBlob(blob, url);
        setRawProcessedDataUrl(url);
        setEditorReady(true);
      })
      .catch((err) => {
        processingStartedRef.current = false;
        setProcessingError(err instanceof Error ? err.message : '처리 실패');
      })
      .finally(() => setIsProcessing(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // removalSensitivity 변경 시 rawProcessedDataUrl에 gamma 재적용
  // setTimeout으로 지연: ONNX WebGPU 세션이 완전히 종료된 후 canvas 작업 실행
  useEffect(() => {
    if (!rawProcessedDataUrl || !editorReady) return;
    const id = setTimeout(() => {
      applyAlphaSensitivity(rawProcessedDataUrl, removalSensitivity)
        .then(setProcessedDataUrl)
        .catch(() => {});
    }, 100);
    return () => clearTimeout(id);
  }, [removalSensitivity, rawProcessedDataUrl, editorReady, setProcessedDataUrl]);

  const download = (blob: Blob, ext: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `removed-bg.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPng = async (scale = 0.5, requiresCredit = false) => {
    if (requiresCredit) {
      const ok = useCredit();
      if (!ok) { setShowPurchaseModal(true); return; }
    }
    const blob = await canvasRef.current?.exportPng(scale);
    if (blob) download(blob, 'png');
  };

  const handleDownloadJpeg = async (scale = 0.5, requiresCredit = false) => {
    if (requiresCredit) {
      const ok = useCredit();
      if (!ok) { setShowPurchaseModal(true); return; }
    }
    const blob = await canvasRef.current?.exportJpeg(scale);
    if (blob) download(blob, 'jpg');
  };

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--bg-base)' }}>
      <TopBar
        dict={dict}
        onUndo={() => canvasRef.current?.undo()}
        onRedo={() => canvasRef.current?.redo()}
        canUndo={canUndo}
        canRedo={canRedo}
        onDownloadPng={handleDownloadPng}
        onDownloadJpeg={handleDownloadJpeg}
      />

      <div className="flex flex-1 overflow-hidden">
        <ToolSidebar dict={dict} />

        <div className="flex-1 relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
          {/* Processing overlay */}
          {isProcessing && (
            <div
              className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6"
              style={{ background: 'rgba(10, 10, 15, 0.92)', backdropFilter: 'blur(4px)' }}
            >
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)' }}
              >
                <LoadingSpinner size={36} />
              </div>
              <div className="w-64 text-center">
                <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{t.removing_bg}</p>
                <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{t.downloading_model}</p>
                <ProgressBar progress={progress} label={t.processing} />
              </div>
            </div>
          )}

          {/* Error overlay */}
          {processingError && (
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <div
                className="p-8 rounded-2xl text-center max-w-sm"
                style={{ background: 'var(--bg-surface)', border: '1px solid rgba(248, 113, 113, 0.3)' }}
              >
                <p className="font-semibold mb-2" style={{ color: 'var(--danger)' }}>{t.processing_failed}</p>
                <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>{processingError}</p>
                <button onClick={() => router.push(`/${lang}`)} className="px-6 py-2 rounded-lg text-sm font-semibold text-white btn-glow">
                  {t.restart}
                </button>
              </div>
            </div>
          )}

          {editorReady && processedDataUrl && originalDataUrl && (
            <CanvasEditor
              ref={canvasRef}
              processedDataUrl={processedDataUrl}
              originalDataUrl={originalDataUrl}
            />
          )}
        </div>

        <RightPanel dict={dict} />
      </div>

      {/* Purchase modal */}
      {showPurchaseModal && (
        <PurchaseModal onClose={() => setShowPurchaseModal(false)} dict={dict} />
      )}
    </div>
  );
}
