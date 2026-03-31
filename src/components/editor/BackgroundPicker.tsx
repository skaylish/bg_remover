'use client';

import { useEditorStore } from '@/store/editorStore';
import type { BackgroundType } from '@/types';

const COLOR_PRESETS = ['#ffffff', '#000000', '#f8f8f8', '#e8e8e8', '#1a1a2e', '#16213e', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'];

export function BackgroundPicker() {
  const backgroundType = useEditorStore((s) => s.backgroundType);
  const setBackgroundType = useEditorStore((s) => s.setBackgroundType);
  const backgroundColor = useEditorStore((s) => s.backgroundColor);
  const setBackgroundColor = useEditorStore((s) => s.setBackgroundColor);

  const tabs: { id: BackgroundType; label: string }[] = [
    { id: 'transparent', label: '투명' },
    { id: 'color', label: '색상' },
  ];

  return (
    <div
      className="p-4 flex flex-col gap-4"
      style={{
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--bg-border)',
        width: '200px',
        shrink: 0,
      } as React.CSSProperties}
    >
      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
        배경
      </span>

      {/* Type tabs */}
      <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-raised)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setBackgroundType(tab.id)}
            className="flex-1 py-1.5 rounded-md text-xs font-medium transition-all duration-200"
            style={{
              background: backgroundType === tab.id ? 'var(--bg-surface)' : 'transparent',
              color: backgroundType === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: backgroundType === tab.id ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Transparent preview */}
      {backgroundType === 'transparent' && (
        <div
          className="w-full h-20 rounded-xl checker-bg"
          style={{ border: '1px solid var(--bg-border)' }}
        />
      )}

      {/* Color picker */}
      {backgroundType === 'color' && (
        <div className="flex flex-col gap-3">
          <div
            className="w-full h-16 rounded-xl"
            style={{
              background: backgroundColor,
              border: '1px solid var(--bg-border)',
            }}
          />
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="w-full h-10 rounded-lg cursor-pointer"
            style={{ border: '1px solid var(--bg-border)' }}
          />
          {/* Presets */}
          <div className="grid grid-cols-5 gap-1.5">
            {COLOR_PRESETS.map((color) => (
              <button
                key={color}
                onClick={() => setBackgroundColor(color)}
                className="w-full aspect-square rounded-md transition-transform hover:scale-110"
                style={{
                  background: color,
                  border: backgroundColor === color
                    ? '2px solid var(--accent-glow)'
                    : '1px solid var(--bg-border)',
                }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
