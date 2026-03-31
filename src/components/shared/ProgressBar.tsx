'use client';

interface ProgressBarProps {
  progress: number;
  label?: string;
}

export function ProgressBar({ progress, label }: ProgressBarProps) {
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</span>
          <span className="text-sm font-mono" style={{ color: 'var(--accent-glow)' }}>{progress}%</span>
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height: '4px', background: 'var(--bg-border)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${progress}%`,
            background: 'var(--accent-gradient)',
            boxShadow: '0 0 8px rgba(99, 102, 241, 0.6)',
          }}
        />
      </div>
    </div>
  );
}
