'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload, X, Download, CheckCircle, AlertCircle,
  Loader2, ImageIcon, PackageOpen, Trash2, Lock
} from 'lucide-react';
import { useCreditStore } from '@/store/creditStore';
import { PurchaseModal } from '@/components/shared/PurchaseModal';

// ─── Types ────────────────────────────────────────────────────────────────────
type ItemStatus = 'pending' | 'processing' | 'done' | 'error';

interface BatchItem {
  id: string;
  file: File;
  previewUrl: string;
  resultUrl: string | null;
  resultBlob: Blob | null;
  status: ItemStatus;
  error: string | null;
  progress: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2);
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status, progress }: { status: ItemStatus; progress: number }) {
  if (status === 'pending') return (
    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
      style={{ background: 'var(--bg-border)', color: 'var(--text-muted)' }}>대기</span>
  );
  if (status === 'processing') return (
    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
      style={{ background: 'rgba(99,102,241,0.2)', color: 'var(--accent-glow)' }}>
      <Loader2 size={10} className="animate-spin" />{progress}%
    </span>
  );
  if (status === 'done') return (
    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
      style={{ background: 'rgba(34,211,160,0.15)', color: 'var(--success)' }}>
      <CheckCircle size={10} />완료
    </span>
  );
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
      style={{ background: 'rgba(248,113,113,0.15)', color: 'var(--danger)' }}>
      <AlertCircle size={10} />실패
    </span>
  );
}

// ─── Main BatchEditor ─────────────────────────────────────────────────────────
export function BatchEditor() {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const abortRef = useRef(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [planChecked, setPlanChecked] = useState(false);
  const useCreditDB = useCreditStore((s) => s.useCreditDB);
  const plan      = useCreditStore((s) => s.plan);
  const syncFromDB = useCreditStore((s) => s.syncFromDB);

  useEffect(() => {
    syncFromDB().finally(() => setPlanChecked(true));
  }, [syncFromDB]);

  const hasBatchAccess = plan === 'pro' || plan === 'enterprise';

  // Stats
  const total = items.length;
  const done = items.filter((i) => i.status === 'done').length;
  const failed = items.filter((i) => i.status === 'error').length;
  const pending = items.filter((i) => i.status === 'pending').length;

  // Add files
  const addFiles = useCallback((files: File[]) => {
    const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
    const MAX_MB = 25;
    const newItems: BatchItem[] = files
      .filter((f) => ACCEPTED.includes(f.type) && f.size <= MAX_MB * 1024 * 1024)
      .map((f) => ({
        id: uid(),
        file: f,
        previewUrl: URL.createObjectURL(f),
        resultUrl: null,
        resultBlob: null,
        status: 'pending',
        error: null,
        progress: 0,
      }));
    setItems((prev) => [...prev, ...newItems]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    multiple: true,
    onDrop: addFiles,
  });

  // Remove item
  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      if (item?.resultUrl) URL.revokeObjectURL(item.resultUrl);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  // Clear all
  const clearAll = useCallback(() => {
    setItems((prev) => {
      prev.forEach((i) => {
        if (i.previewUrl) URL.revokeObjectURL(i.previewUrl);
        if (i.resultUrl) URL.revokeObjectURL(i.resultUrl);
      });
      return [];
    });
  }, []);

  // Update item helper
  const updateItem = (id: string, patch: Partial<BatchItem>) => {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, ...patch } : i));
  };

  // Process single item
  const processOne = async (item: BatchItem) => {
    updateItem(item.id, { status: 'processing', progress: 0 });
    try {
      const { removeBackground } = await import('@imgly/background-removal');
      const blob = await removeBackground(item.file, {
        model: 'isnet' as const,
        output: { format: 'image/png' as const, quality: 1 },
        progress: (_key: string, current: number, total: number) => {
          if (total > 0) {
            updateItem(item.id, { progress: Math.round((current / total) * 100) });
          }
        },
      });
      const resultUrl = URL.createObjectURL(blob);
      updateItem(item.id, { status: 'done', resultBlob: blob, resultUrl, progress: 100 });
    } catch (err) {
      const msg = err instanceof Error ? err.message : '처리 실패';
      updateItem(item.id, { status: 'error', error: msg });
    }
  };

  // Run all pending
  const runAll = async () => {
    setIsRunning(true);
    abortRef.current = false;

    const pending = items.filter((i) => i.status === 'pending' || i.status === 'error');
    for (const item of pending) {
      if (abortRef.current) break;
      await processOne(item);
    }
    setIsRunning(false);
  };

  const stopAll = () => {
    abortRef.current = true;
    setIsRunning(false);
    // Reset processing items back to pending
    setItems((prev) =>
      prev.map((i) => i.status === 'processing' ? { ...i, status: 'pending', progress: 0 } : i)
    );
  };

  // 크레딧 차감 후 단일 다운로드
  const handleDownloadOne = useCallback(async (item: BatchItem) => {
    if (!item.resultBlob) return;
    const ok = await useCreditDB();
    if (!ok) { setShowPurchaseModal(true); return; }
    const name = item.file.name.replace(/\.[^/.]+$/, '') + '_nobg.png';
    downloadBlob(item.resultBlob, name);
  }, [useCreditDB]);

  // Download all as ZIP — 이미지 수만큼 크레딧 차감
  const downloadAll = async () => {
    const doneItems = items.filter((i) => i.status === 'done' && i.resultBlob);
    if (!doneItems.length) return;

    // 크레딧 차감 (순차적으로 — 하나라도 부족하면 중단)
    const paid: BatchItem[] = [];
    for (const item of doneItems) {
      const ok = await useCreditDB();
      if (!ok) {
        setShowPurchaseModal(true);
        // 이미 차감된 항목만 ZIP
        if (!paid.length) return;
        break;
      }
      paid.push(item);
    }

    const { default: JSZip } = await import('jszip');
    const zip = new JSZip();
    paid.forEach((item) => {
      const name = item.file.name.replace(/\.[^/.]+$/, '') + '_nobg.png';
      zip.file(name, item.resultBlob!);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(blob, 'removed-backgrounds.zip');
  };

  // 플랜 확인 중
  if (!planChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent-glow)' }} />
      </div>
    );
  }

  // 비즈니스/엔터프라이즈 미가입
  if (!hasBatchAccess) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-base)' }}>
          <div
            className="w-full max-w-md rounded-3xl p-10 flex flex-col items-center text-center gap-5"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)' }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)' }}
            >
              <Lock size={28} style={{ color: '#a855f7' }} />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                일괄 편집은 유료 플랜 전용입니다
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                비즈니스 또는 엔터프라이즈 플랜을 구독하면<br />여러 이미지를 한 번에 처리할 수 있습니다.
              </p>
            </div>
            <div
              className="w-full rounded-2xl p-4 text-left"
              style={{ background: 'var(--bg-raised)', border: '1px solid var(--bg-border)' }}
            >
              {[
                { name: '비즈니스', price: '₩19,900/30일', credits: '월 500 크레딧', color: '#a855f7' },
                { name: '엔터프라이즈', price: '₩99,000/30일', credits: '무제한 생성', color: '#22d3a0' },
              ].map((p) => (
                <div key={p.name} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{p.name}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.credits}</span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: p.color }}>{p.price}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowPurchaseModal(true)}
              className="w-full py-3 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: 'var(--accent-gradient)' }}
            >
              플랜 업그레이드
            </button>
          </div>
        </div>
        {showPurchaseModal && (
          <PurchaseModal onClose={() => setShowPurchaseModal(false)} />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base)' }}>
      {/* Header */}
      <div
        className="px-8 py-5 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--bg-border)', background: 'var(--bg-surface)' }}
      >
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            일괄 배경 제거
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            여러 이미지를 한 번에 투명 PNG로 처리합니다
          </p>
        </div>

        {/* Stats */}
        {total > 0 && (
          <div className="flex items-center gap-4">
            <StatChip label="전체" value={total} color="var(--text-muted)" />
            <StatChip label="완료" value={done} color="var(--success)" />
            {failed > 0 && <StatChip label="실패" value={failed} color="var(--danger)" />}
            <StatChip label="대기" value={pending} color="var(--accent-glow)" />
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-6 p-8 max-w-5xl mx-auto w-full">

        {/* Drop zone */}
        <div
          {...getRootProps()}
          className="rounded-2xl cursor-pointer transition-all duration-300"
          style={{
            border: `2px dashed ${isDragActive ? 'var(--accent-primary)' : 'var(--bg-border)'}`,
            background: isDragActive ? 'rgba(99,102,241,0.06)' : 'var(--bg-surface)',
            boxShadow: isDragActive ? '0 0 30px rgba(99,102,241,0.2)' : 'none',
            padding: '32px',
          }}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: isDragActive ? 'rgba(99,102,241,0.2)' : 'var(--bg-raised)', border: '1px solid var(--bg-border)' }}
            >
              <Upload size={24} style={{ color: isDragActive ? 'var(--accent-glow)' : 'var(--text-muted)' }} />
            </div>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {isDragActive ? '이미지를 여기에 놓으세요' : '이미지를 드래그하거나 클릭해서 추가'}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              JPG, PNG, WEBP · 최대 25MB · 여러 파일 동시 선택 가능
            </p>
          </div>
        </div>

        {/* Action bar */}
        {total > 0 && (
          <div className="flex items-center gap-3 flex-wrap">
            {!isRunning ? (
              <button
                onClick={runAll}
                disabled={pending === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all btn-glow disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ImageIcon size={16} />
                {pending > 0 ? `${pending}개 처리 시작` : '모두 완료됨'}
              </button>
            ) : (
              <button
                onClick={stopAll}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
                style={{ background: 'rgba(248,113,113,0.15)', color: 'var(--danger)', border: '1px solid rgba(248,113,113,0.3)' }}
              >
                <X size={16} />
                중지
              </button>
            )}

            {done > 0 && (
              <button
                onClick={downloadAll}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
                style={{ background: 'rgba(34,211,160,0.12)', color: 'var(--success)', border: '1px solid rgba(34,211,160,0.3)' }}
              >
                <PackageOpen size={16} />
                전체 ZIP 다운로드 ({done}개)
              </button>
            )}

            <button
              onClick={clearAll}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all ml-auto disabled:opacity-40"
              style={{ color: 'var(--text-muted)', background: 'var(--bg-raised)', border: '1px solid var(--bg-border)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <Trash2 size={15} />
              전체 삭제
            </button>
          </div>
        )}

        {/* Overall progress bar */}
        {isRunning && total > 0 && (
          <div className="rounded-xl p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)' }}>
            <div className="flex justify-between text-xs mb-2">
              <span style={{ color: 'var(--text-muted)' }}>전체 진행률</span>
              <span style={{ color: 'var(--accent-glow)' }}>{done} / {total}</span>
            </div>
            <div className="w-full rounded-full overflow-hidden" style={{ height: '4px', background: 'var(--bg-border)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${total > 0 ? (done / total) * 100 : 0}%`,
                  background: 'var(--accent-gradient)',
                  boxShadow: '0 0 8px rgba(99,102,241,0.5)',
                }}
              />
            </div>
          </div>
        )}

        {/* Image grid */}
        {items.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <BatchCard
                key={item.id}
                item={item}
                onRemove={() => removeItem(item.id)}
                onDownload={() => handleDownloadOne(item)}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)' }}
            >
              <ImageIcon size={32} style={{ color: 'var(--text-subtle)' }} />
            </div>
            <p style={{ color: 'var(--text-subtle)' }}>아직 이미지가 없습니다</p>
          </div>
        )}
      </div>

      {showPurchaseModal && (
        <PurchaseModal onClose={() => setShowPurchaseModal(false)} />
      )}
    </div>
  );
}

// ─── Stat chip ────────────────────────────────────────────────────────────────
function StatChip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-lg font-bold" style={{ color }}>{value}</span>
      <span className="text-[10px]" style={{ color: 'var(--text-subtle)' }}>{label}</span>
    </div>
  );
}

// ─── Batch card ───────────────────────────────────────────────────────────────
function BatchCard({
  item, onRemove, onDownload,
}: {
  item: BatchItem;
  onRemove: () => void;
  onDownload: () => void;
}) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="relative rounded-2xl overflow-hidden group transition-all duration-200"
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${item.status === 'done' ? 'rgba(34,211,160,0.25)' : item.status === 'error' ? 'rgba(248,113,113,0.25)' : 'var(--bg-border)'}`,
        aspectRatio: '1',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Image area */}
      <div className="absolute inset-0">
        {item.status === 'done' && item.resultUrl ? (
          <div className="w-full h-full checker-bg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.resultUrl} alt={item.file.name} className="w-full h-full object-contain" />
          </div>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={item.previewUrl} alt={item.file.name} className="w-full h-full object-cover" />
        )}
      </div>

      {/* Processing overlay */}
      {item.status === 'processing' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2"
          style={{ background: 'rgba(10,10,15,0.75)', backdropFilter: 'blur(4px)' }}>
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent-glow)' }} />
          <div className="w-3/4">
            <div className="w-full rounded-full overflow-hidden" style={{ height: '3px', background: 'var(--bg-border)' }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${item.progress}%`, background: 'var(--accent-gradient)' }}
              />
            </div>
          </div>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.progress}%</span>
        </div>
      )}

      {/* Error overlay */}
      {item.status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1"
          style={{ background: 'rgba(10,10,15,0.8)' }}>
          <AlertCircle size={20} style={{ color: 'var(--danger)' }} />
          <span className="text-[10px] text-center px-2" style={{ color: 'var(--danger)' }}>처리 실패</span>
        </div>
      )}

      {/* Hover actions */}
      {hover && item.status !== 'processing' && (
        <div className="absolute inset-0 flex items-center justify-center gap-2"
          style={{ background: 'rgba(10,10,15,0.6)', backdropFilter: 'blur(2px)' }}>
          {item.status === 'done' && (
            <button
              onClick={onDownload}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
              style={{ background: 'rgba(34,211,160,0.2)', border: '1px solid rgba(34,211,160,0.4)', color: 'var(--success)' }}
              title="다운로드"
            >
              <Download size={16} />
            </button>
          )}
          <button
            onClick={onRemove}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'rgba(248,113,113,0.2)', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--danger)' }}
            title="삭제"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Footer bar */}
      <div
        className="absolute bottom-0 left-0 right-0 px-2 py-1.5 flex items-center justify-between"
        style={{ background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(4px)' }}
      >
        <span
          className="text-[10px] truncate flex-1 mr-1"
          style={{ color: 'var(--text-muted)' }}
          title={item.file.name}
        >
          {item.file.name}
        </span>
        <StatusBadge status={item.status} progress={item.progress} />
      </div>
    </div>
  );
}
