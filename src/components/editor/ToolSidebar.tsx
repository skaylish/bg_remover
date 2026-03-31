'use client';

import { Paintbrush, Eraser, Hand, Minus, Plus } from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';

export function ToolSidebar({ dict }: { dict?: any }) {
  const mode = useEditorStore((s) => s.mode);
  const setMode = useEditorStore((s) => s.setMode);
  const brushSize = useEditorStore((s) => s.brushSize);
  const setBrushSize = useEditorStore((s) => s.setBrushSize);

  const t = dict?.editor?.sidebar || {
    move: '이동',
    restore: '복원',
    erase: '지우기',
    size: '크기',
  };

  const tools = [
    { id: 'view', icon: Hand, label: t.move, mode: 'view' as const },
    { id: 'foreground', icon: Paintbrush, label: t.restore, mode: 'foreground' as const },
    { id: 'background', icon: Eraser, label: t.erase, mode: 'background' as const },
  ];

  return (
    <aside
      className="flex flex-col gap-2 p-3 w-[72px] shrink-0"
      style={{
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--bg-border)',
        height: '100%',
      }}
    >
      {/* Tool buttons */}
      <div className="flex flex-col gap-1">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = mode === tool.mode;
          return (
            <button
              key={tool.id}
              onClick={() => setMode(tool.mode)}
              title={tool.label}
              className="flex flex-col items-center gap-1 py-3 rounded-xl transition-all duration-200"
              style={{
                background: isActive ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(99,102,241,0.5)' : 'transparent'}`,
                color: isActive ? 'var(--accent-glow)' : 'var(--text-muted)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              <Icon size={20} />
              <span className="text-[10px]">{tool.label}</span>
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="h-px mx-2" style={{ background: 'var(--bg-border)' }} />

      {/* Brush size */}
      {(mode === 'foreground' || mode === 'background') && (
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{t.size}</span>
          <button
            onClick={() => setBrushSize(Math.min(100, brushSize + 5))}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'var(--bg-raised)', color: 'var(--text-muted)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <Plus size={14} />
          </button>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono"
            style={{
              background: 'var(--bg-raised)',
              border: '1px solid var(--bg-border)',
              color: 'var(--text-primary)',
            }}
          >
            {brushSize}
          </div>
          <button
            onClick={() => setBrushSize(Math.max(5, brushSize - 5))}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'var(--bg-raised)', color: 'var(--text-muted)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <Minus size={14} />
          </button>

        </div>
      )}
    </aside>
  );
}
