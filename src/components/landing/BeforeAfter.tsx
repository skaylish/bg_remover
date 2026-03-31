'use client';

import { useState, useRef, useCallback } from 'react';

interface BeforeAfterProps {
  beforeSrc: string;
  afterSrc: string;
}

export function BeforeAfter({ beforeSrc, afterSrc }: BeforeAfterProps) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    updatePosition(e.clientX);
    const onMove = (ev: MouseEvent) => { if (isDragging.current) updatePosition(ev.clientX); };
    const onUp = () => { isDragging.current = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [updatePosition]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    updatePosition(e.touches[0].clientX);
  }, [updatePosition]);

  return (
    <div
      ref={containerRef}
      className="relative select-none overflow-hidden rounded-2xl cursor-ew-resize"
      style={{
        aspectRatio: '16/9',
        border: '1px solid var(--bg-border)',
        maxWidth: '700px',
        margin: '0 auto',
      }}
      onMouseDown={onMouseDown}
      onTouchMove={onTouchMove}
    >
      {/* After (right side - transparent bg) */}
      <div className="absolute inset-0 checker-bg" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={afterSrc} alt="배경 제거 후" className="absolute inset-0 w-full h-full object-cover" />

      {/* Before (left side - original) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={beforeSrc} alt="원본" className="absolute inset-0 w-full h-full object-cover" />
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 pointer-events-none"
        style={{
          left: `${position}%`,
          background: 'white',
          boxShadow: '0 0 8px rgba(0,0,0,0.6)',
        }}
      >
        {/* Handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: 'white',
            boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M5 4l-3 4 3 4M11 4l3 4-3 4" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-semibold" style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}>원본</div>
      <div className="absolute top-3 right-3 px-2 py-1 rounded text-xs font-semibold" style={{ background: 'rgba(99,102,241,0.8)', color: 'white' }}>배경 제거</div>
    </div>
  );
}
