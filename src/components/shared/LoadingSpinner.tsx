'use client';

interface LoadingSpinnerProps {
  size?: number;
}

export function LoadingSpinner({ size = 24 }: LoadingSpinnerProps) {
  return (
    <div
      className="inline-block rounded-full border-2 border-t-transparent animate-spin"
      style={{
        width: size,
        height: size,
        borderColor: `var(--accent-primary) transparent transparent transparent`,
      }}
    />
  );
}
