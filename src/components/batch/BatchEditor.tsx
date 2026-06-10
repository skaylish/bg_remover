'use client';

// 일괄 배경 제거 에디터 — 다국어 dict 기반
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
function uid() { return Math.random().toString(36).slice(2); }

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status, progress, labels }: {
  status: ItemStatus;
  progress: number;
  labels: { pending: string; done: string; error: string };
}) {
  if (status === 'pending') return (
    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
      style={{ background: 'var(--bg-border)', color: 'var(--text-muted)' }}>{labels.pending}</span>
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
      <CheckCircle size={10} />{labels.done}
    </span>
  );
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
      style={{ background: 'rgba(248,113,113,0.15)', color: 'var(--danger)' }}>
      <AlertCircle size={10} />{labels.error}
    </span>
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
function BatchCard({ item, onRemove, onDownload, labels, statusLabels }: {
  item: BatchItem;
  onRemove: () => void;
  onDownload: () => void;
  labels: { download: string; remove: string; error: string };
  statusLabels: { pending: string; done: string; error: string };
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
      <div className="absolute inset-0">
        {item.status === 'done' && item.resultUrl ? (
          <div className="w-full h-full checker-bg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.resultUrl} alt={item.file.name} className="w-full h-full object-contain" />
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.previewUrl} alt={item.file.name} className="w-full h-full object-cover" />
        )}
      </div>

      {item.status === 'processing' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2"
          style={{ background: 'rgba(10,10,15,0.75)', backdropFilter: 'blur(4px)' }}>
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent-glow)' }} />
          <div className="w-3/4">
            <div className="w-full rounded-full overflow-hidden" style={{ height: '3px', background: 'var(--bg-border)' }}>
              <div className="h-full rounded-full transition-all duration-300"
                style={{ width: `${item.progress}%`, background: 'var(--accent-gradient)' }} />
            </div>
          </div>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.progress}%</span>
        </div>
      )}

      {item.status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1"
          style={{ background: 'rgba(10,10,15,0.8)' }}>
          <AlertCircle size={20} style={{ color: 'var(--danger)' }} />
          <span className="text-[10px] text-center px-2" style={{ color: 'var(--danger)' }}>{labels.error}</span>
        </div>
      )}

      {hover && item.status !== 'processing' && (
        <div className="absolute inset-0 flex items-center justify-center gap-2"
          style={{ background: 'rgba(10,10,15,0.6)', backdropFilter: 'blur(2px)' }}>
          {item.status === 'done' && (
            <button onClick={onDownload}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
              style={{ background: 'rgba(34,211,160,0.2)', border: '1px solid rgba(34,211,160,0.4)', color: 'var(--success)' }}
              title={labels.download}>
              <Download size={16} />
            </button>
          )}
          <button onClick={onRemove}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'rgba(248,113,113,0.2)', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--danger)' }}
            title={labels.remove}>
            <X size={16} />
          </button>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 flex items-center justify-between"
        style={{ background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(4px)' }}>
        <span className="text-[10px] truncate flex-1 mr-1" style={{ color: 'var(--text-muted)' }} title={item.file.name}>
          {item.file.name}
        </span>
        <StatusBadge status={item.status} progress={item.progress} labels={statusLabels} />
      </div>
    </div>
  );
}

// ─── Main BatchEditor ─────────────────────────────────────────────────────────
export function BatchEditor({ dict }: { dict?: any }) {
  const t = dict?.batch || {
    title: '일괄 배경 제거',
    subtitle: '여러 이미지를 한 번에 투명 PNG로 처리합니다',
    locked_title: '일괄 편집은 유료 플랜 전용입니다',
    locked_desc: '비즈니스 또는 엔터프라이즈 플랜을 구독하면 여러 이미지를 한 번에 처리할 수 있습니다.',
    upgrade_btn: '플랜 업그레이드',
    plan_credits_business: '월 500 크레딧',
    plan_credits_enterprise: '월 5,000 크레딧',
    per_month: '/월',
    stat_total: '전체',
    stat_done: '완료',
    stat_failed: '실패',
    stat_pending: '대기',
    drop_active: '이미지를 여기에 놓으세요',
    drop_idle: '이미지를 드래그하거나 클릭해서 추가',
    drop_hint: 'JPG, PNG, WEBP · 최대 25MB · 여러 파일 동시 선택 가능',
    run_n: '{n}개 처리 시작',
    run_done: '모두 완료됨',
    stop: '중지',
    download_zip: '전체 ZIP 다운로드 ({n}개)',
    clear_all: '전체 삭제',
    progress_label: '전체 진행률',
    empty: '아직 이미지가 없습니다',
    status_pending: '대기',
    status_done: '완료',
    status_error: '실패',
    card_download: '다운로드',
    card_remove: '삭제',
    error_processing: '처리 실패',
  };

  const [items, setItems] = useState<BatchItem[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const abortRef = useRef(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [planChecked, setPlanChecked] = useState(false);
  const useCreditDB = useCreditStore((s) => s.useCreditDB);
  const plan       = useCreditStore((s) => s.plan);
  const syncFromDB = useCreditStore((s) => s.syncFromDB);

  useEffect(() => {
    syncFromDB().finally(() => setPlanChecked(true));
  }, [syncFromDB]);

  const hasBatchAccess = plan === 'business' || plan === 'growth' || plan === 'enterprise';

  const total   = items.length;
  const done    = items.filter((i) => i.status === 'done').length;
  const failed  = items.filter((i) => i.status === 'error').length;
  const pending = items.filter((i) => i.status === 'pending').length;

  const addFiles = useCallback((files: File[]) => {
    const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
    const newItems: BatchItem[] = files
      .filter((f) => ACCEPTED.includes(f.type) && f.size <= 25 * 1024 * 1024)
      .map((f) => ({
        id: uid(), file: f,
        previewUrl: URL.createObjectURL(f),
        resultUrl: null, resultBlob: null,
        status: 'pending', error: null, progress: 0,
      }));
    setItems((prev) => [...prev, ...newItems]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    multiple: true,
    onDrop: addFiles,
  });

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      if (item?.resultUrl)  URL.revokeObjectURL(item.resultUrl);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    setItems((prev) => {
      prev.forEach((i) => {
        if (i.previewUrl) URL.revokeObjectURL(i.previewUrl);
        if (i.resultUrl)  URL.revokeObjectURL(i.resultUrl);
      });
      return [];
    });
  }, []);

  const updateItem = (id: string, patch: Partial<BatchItem>) => {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, ...patch } : i));
  };

  const processOne = async (item: BatchItem) => {
    updateItem(item.id, { status: 'processing', progress: 0 });
    try {
      const { removeBackground } = await import('@imgly/background-removal');
      const publicPath = `${window.location.origin}/bgremoval-cdn/`;
      console.log('[batch] publicPath:', publicPath);
      const baseOpts = {
        model: 'isnet' as const,
        publicPath,
        proxyToWorker: true,
        output: { format: 'image/png' as const, quality: 1 },
        progress: (_key: string, current: number, total: number) => {
          if (total > 0) updateItem(item.id, { progress: Math.round((current / total) * 100) });
        },
      };
      let blob: Blob;
      try {
        blob = await removeBackground(item.file, { ...baseOpts, device: 'gpu' as const });
      } catch {
        // GPU 실패 시 CPU fallback
        updateItem(item.id, { progress: 0 });
        blob = await removeBackground(item.file, { ...baseOpts, device: 'cpu' as const });
      }
      const resultUrl = URL.createObjectURL(blob);
      updateItem(item.id, { status: 'done', resultBlob: blob, resultUrl, progress: 100 });
    } catch (err) {
      const msg = err instanceof Error ? err.message : t.error_processing;
      updateItem(item.id, { status: 'error', error: msg });
    }
  };

  const runAll = async () => {
    setIsRunning(true);
    abortRef.current = false;
    const queue = items.filter((i) => i.status === 'pending' || i.status === 'error');
    const CONCURRENCY = 2;
    for (let i = 0; i < queue.length; i += CONCURRENCY) {
      if (abortRef.current) break;
      await Promise.all(queue.slice(i, i + CONCURRENCY).map(processOne));
    }
    setIsRunning(false);
  };

  const stopAll = () => {
    abortRef.current = true;
    setIsRunning(false);
    setItems((prev) =>
      prev.map((i) => i.status === 'processing' ? { ...i, status: 'pending', progress: 0 } : i)
    );
  };

  const handleDownloadOne = useCallback(async (item: BatchItem) => {
    if (!item.resultBlob) return;
    const ok = await useCreditDB();
    if (!ok) { setShowPurchaseModal(true); return; }
    downloadBlob(item.resultBlob, item.file.name.replace(/\.[^/.]+$/, '') + '_nobg.png');
  }, [useCreditDB]);

  const downloadAll = async () => {
    const doneItems = items.filter((i) => i.status === 'done' && i.resultBlob);
    if (!doneItems.length) return;
    const paid: BatchItem[] = [];
    for (const item of doneItems) {
      const ok = await useCreditDB();
      if (!ok) { setShowPurchaseModal(true); if (!paid.length) return; break; }
      paid.push(item);
    }
    const { default: JSZip } = await import('jszip');
    const zip = new JSZip();
    paid.forEach((item) => {
      zip.file(item.file.name.replace(/\.[^/.]+$/, '') + '_nobg.png', item.resultBlob!);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(blob, 'removed-backgrounds.zip');
  };

  const statusLabels = { pending: t.status_pending, done: t.status_done, error: t.status_error };
  const cardLabels   = { download: t.card_download, remove: t.card_remove, error: t.status_error };

  // 플랜 확인 중
  if (!planChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent-glow)' }} />
      </div>
    );
  }

  // 미가입 잠금 화면
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
                {t.locked_title}
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {t.locked_desc}
              </p>
            </div>
            <button
              onClick={() => setShowPurchaseModal(true)}
              className="w-full py-3 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: 'var(--accent-gradient)' }}
            >
              {t.upgrade_btn}
            </button>
          </div>
        </div>
        {showPurchaseModal && <PurchaseModal onClose={() => setShowPurchaseModal(false)} dict={dict} />}
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
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{t.title}</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{t.subtitle}</p>
        </div>
        {total > 0 && (
          <div className="flex items-center gap-4">
            <StatChip label={t.stat_total}   value={total}   color="var(--text-muted)" />
            <StatChip label={t.stat_done}    value={done}    color="var(--success)" />
            {failed > 0 && <StatChip label={t.stat_failed} value={failed} color="var(--danger)" />}
            <StatChip label={t.stat_pending} value={pending} color="var(--accent-glow)" />
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
              {isDragActive ? t.drop_active : t.drop_idle}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.drop_hint}</p>
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
                {pending > 0 ? t.run_n.replace('{n}', String(pending)) : t.run_done}
              </button>
            ) : (
              <button
                onClick={stopAll}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
                style={{ background: 'rgba(248,113,113,0.15)', color: 'var(--danger)', border: '1px solid rgba(248,113,113,0.3)' }}
              >
                <X size={16} />{t.stop}
              </button>
            )}

            {done > 0 && (
              <button
                onClick={downloadAll}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
                style={{ background: 'rgba(34,211,160,0.12)', color: 'var(--success)', border: '1px solid rgba(34,211,160,0.3)' }}
              >
                <PackageOpen size={16} />
                {t.download_zip.replace('{n}', String(done))}
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
              <Trash2 size={15} />{t.clear_all}
            </button>
          </div>
        )}

        {/* Overall progress bar */}
        {isRunning && total > 0 && (
          <div className="rounded-xl p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)' }}>
            <div className="flex justify-between text-xs mb-2">
              <span style={{ color: 'var(--text-muted)' }}>{t.progress_label}</span>
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
                labels={cardLabels}
                statusLabels={statusLabels}
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
            <p style={{ color: 'var(--text-subtle)' }}>{t.empty}</p>
          </div>
        )}
      </div>

      {showPurchaseModal && <PurchaseModal onClose={() => setShowPurchaseModal(false)} dict={dict} />}
    </div>
  );
}
