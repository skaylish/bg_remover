'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ZoomIn, ZoomOut, Undo2, Redo2, Download, Scissors, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';

interface TopBarProps {
  onUndo?: () => void;
  onRedo?: () => void;
  onDownloadPng?: (scale: number, requiresCredit: boolean) => void;
  onDownloadJpeg?: (scale: number, requiresCredit: boolean) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  dict?: any;
}

// scale: download scale multiplier, credit: whether 1 credit is required
const SCALE_OPTIONS = [
  { label: '저해상도 · 무료', scale: 0.5, credit: false },
  { label: '고해상도 (1×) · 1크레딧', scale: 1, credit: true },
  { label: '초고해상도 (2×) · 1크레딧', scale: 2, credit: true },
];
const SCALE_OPTIONS_EN = [
  { label: 'Low-res · Free', scale: 0.5, credit: false },
  { label: 'HD (1×) · 1 Credit', scale: 1, credit: true },
  { label: 'Ultra HD (2×) · 1 Credit', scale: 2, credit: true },
];

export function TopBar({ onUndo, onRedo, onDownloadPng, onDownloadJpeg, canUndo, canRedo, dict }: TopBarProps) {
  const zoom = useEditorStore((s) => s.zoom);
  const setZoom = useEditorStore((s) => s.setZoom);
  const showOriginal = useEditorStore((s) => s.showOriginal);
  const setShowOriginal = useEditorStore((s) => s.setShowOriginal);
  const processedDataUrl = useEditorStore((s) => s.processedDataUrl);

  const [pngMenuOpen, setPngMenuOpen] = useState(false);
  const [jpegMenuOpen, setJpegMenuOpen] = useState(false);
  const pngRef = useRef<HTMLDivElement>(null);
  const jpegRef = useRef<HTMLDivElement>(null);

  const t = dict?.editor?.topbar || {
    go_back: '돌아가기',
    undo: '실행 취소 (Ctrl+Z)',
    redo: '다시 실행 (Ctrl+Y)',
    zoom_out: '축소',
    zoom_in: '확대',
    view_original: '원본 보기',
    view_result: '결과 보기',
  };

  const isKo = !dict?.editor?.topbar?.go_back || dict?.editor?.topbar?.go_back === '돌아가기';
  const dlOptions = isKo ? SCALE_OPTIONS : SCALE_OPTIONS_EN;

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pngRef.current && !pngRef.current.contains(e.target as Node)) setPngMenuOpen(false);
      if (jpegRef.current && !jpegRef.current.contains(e.target as Node)) setJpegMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div
      className="flex items-center justify-between px-4 h-12 shrink-0"
      style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--bg-border)',
      }}
    >
      {/* Left: back + logo */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">{t.go_back}</span>
        </Link>
        <div className="h-5 w-px" style={{ background: 'var(--bg-border)' }} />
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'var(--accent-gradient)' }}>
            <Scissors size={11} className="text-white" />
          </div>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            BG<span className="gradient-text">Remover</span>
          </span>
        </div>
      </div>

      {/* Center: undo/redo + zoom + original toggle */}
      <div className="flex items-center gap-1">
        <IconBtn onClick={() => onUndo?.()} disabled={!canUndo} title={t.undo}>
          <Undo2 size={15} />
        </IconBtn>
        <IconBtn onClick={() => onRedo?.()} disabled={!canRedo} title={t.redo}>
          <Redo2 size={15} />
        </IconBtn>

        <div className="w-px h-5 mx-1" style={{ background: 'var(--bg-border)' }} />

        <IconBtn onClick={() => setZoom(Math.max(0.1, zoom - 0.25))} title={t.zoom_out}>
          <ZoomOut size={15} />
        </IconBtn>
        <div
          className="px-2 py-1 rounded text-xs font-mono min-w-[48px] text-center"
          style={{ color: 'var(--text-muted)', background: 'var(--bg-raised)' }}
        >
          {Math.round(zoom * 100)}%
        </div>
        <IconBtn onClick={() => setZoom(Math.min(5, zoom + 0.25))} title={t.zoom_in}>
          <ZoomIn size={15} />
        </IconBtn>

        {/* Original/Result toggle */}
        {processedDataUrl && (
          <>
            <div className="w-px h-5 mx-1" style={{ background: 'var(--bg-border)' }} />
            <IconBtn
              onClick={() => setShowOriginal(!showOriginal)}
              title={showOriginal ? t.view_result : t.view_original}
              active={showOriginal}
            >
              {showOriginal ? <EyeOff size={15} /> : <Eye size={15} />}
            </IconBtn>
          </>
        )}
      </div>

      {/* Right: download with free/credit options */}
      <div className="flex items-center gap-2">
        {/* PNG dropdown */}
        <div ref={pngRef} className="relative">
          <div className="flex rounded-lg overflow-hidden btn-glow">
            <button
              onClick={() => onDownloadPng?.(0.5, false)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white transition-all"
            >
              <Download size={14} />
              PNG
            </button>
            <button
              onClick={() => { setPngMenuOpen((v) => !v); setJpegMenuOpen(false); }}
              className="flex items-center px-1.5 py-1.5 text-white transition-all border-l"
              style={{ borderColor: 'rgba(255,255,255,0.2)' }}
            >
              <ChevronDown size={12} />
            </button>
          </div>
          {pngMenuOpen && (
            <div
              className="absolute right-0 top-full mt-1 rounded-xl overflow-hidden z-50 py-1 min-w-[200px]"
              style={{ background: 'var(--bg-raised)', border: '1px solid var(--bg-border)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
            >
              {dlOptions.map((opt) => (
                <button
                  key={opt.scale}
                  onClick={() => { onDownloadPng?.(opt.scale, opt.credit); setPngMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-xs transition-colors flex items-center justify-between gap-3"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-border)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
                  }}
                >
                  <span>{opt.label}</span>
                  {!opt.credit && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(34,211,160,0.2)', color: '#22d3a0' }}>FREE</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* JPEG dropdown */}
        <div ref={jpegRef} className="relative">
          <div
            className="flex rounded-lg overflow-hidden"
            style={{ background: 'var(--bg-raised)', border: '1px solid var(--bg-border)' }}
          >
            <button
              onClick={() => onDownloadJpeg?.(0.5, false)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <Download size={14} />
              JPEG
            </button>
            <button
              onClick={() => { setJpegMenuOpen((v) => !v); setPngMenuOpen(false); }}
              className="flex items-center px-1.5 py-1.5 transition-all border-l"
              style={{ color: 'var(--text-muted)', borderColor: 'var(--bg-border)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <ChevronDown size={12} />
            </button>
          </div>
          {jpegMenuOpen && (
            <div
              className="absolute right-0 top-full mt-1 rounded-xl overflow-hidden z-50 py-1 min-w-[200px]"
              style={{ background: 'var(--bg-raised)', border: '1px solid var(--bg-border)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
            >
              {dlOptions.map((opt) => (
                <button
                  key={opt.scale}
                  onClick={() => { onDownloadJpeg?.(opt.scale, opt.credit); setJpegMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-xs transition-colors flex items-center justify-between gap-3"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-border)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
                  }}
                >
                  <span>{opt.label}</span>
                  {!opt.credit && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(34,211,160,0.2)', color: '#22d3a0' }}>FREE</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  disabled,
  title,
  active,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150"
      style={{
        background: active ? 'rgba(99,102,241,0.2)' : 'transparent',
        color: disabled ? 'var(--text-subtle)' : active ? 'var(--accent-glow)' : 'var(--text-muted)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: active ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = active ? 'rgba(99,102,241,0.3)' : 'var(--bg-raised)';
          e.currentTarget.style.color = 'var(--text-primary)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = active ? 'rgba(99,102,241,0.2)' : 'transparent';
        e.currentTarget.style.color = disabled ? 'var(--text-subtle)' : active ? 'var(--accent-glow)' : 'var(--text-muted)';
      }}
    >
      {children}
    </button>
  );
}
