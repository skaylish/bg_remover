'use client';

import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useParams, useRouter } from 'next/navigation';
import { CloudUpload, AlertCircle } from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import { useImageUpload } from '@/hooks/useImageUpload';

// Unsplash sample images for each category
const SAMPLES = [
  { key: 'person', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=85' },
  { key: 'product', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=85' },
  { key: 'animal', url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=85' },
  { key: 'car', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=85' },
] as const;

export function UploadZone({ dict }: { dict?: any }) {
  const router = useRouter();
  const params = useParams();
  const lang = (params.lang as string) || 'ko';
  const { prepare } = useImageUpload();
  const setOriginalFile = useEditorStore((s) => s.setOriginalFile);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSample, setLoadingSample] = useState<string | null>(null);

  const t = dict?.upload || {
    title_active: 'Drop to synthesis',
    title_default: 'Drag and drop your canvas',
    subtitle: 'Supports PNG, JPG, and WEBP (Up to 25MB)',
    button: 'Upload Image',
    loading: 'Preparing canvas...',
    paste_hint: 'or paste with Ctrl+V',
    samples: 'Try a sample',
    sample_person: 'Person',
    sample_product: 'Product',
    sample_animal: 'Animal',
    sample_car: 'Car',
  };

  const sampleLabels: Record<string, string> = {
    person: t.sample_person,
    product: t.sample_product,
    animal: t.sample_animal,
    car: t.sample_car,
  };

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setIsLoading(true);
      const result = await prepare(file);
      setIsLoading(false);

      if ('error' in result) {
        setError(result.error);
        return;
      }
      setOriginalFile(result.file, result.dataUrl);
      router.push(`/${lang}/editor`);
    },
    [prepare, setOriginalFile, router, lang]
  );

  const handleSample = useCallback(
    async (sampleKey: string, url: string) => {
      setError(null);
      setLoadingSample(sampleKey);
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        const file = new File([blob], `sample-${sampleKey}.jpg`, { type: 'image/jpeg' });
        const result = await prepare(file);
        setLoadingSample(null);
        if ('error' in result) { setError(result.error); return; }
        setOriginalFile(result.file, result.dataUrl);
        router.push(`/${lang}/editor`);
      } catch {
        setLoadingSample(null);
        setError('샘플 이미지를 불러오지 못했습니다.');
      }
    },
    [prepare, setOriginalFile, router, lang]
  );

  // Ctrl+V paste support
  useEffect(() => {
    const handler = async (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const items = Array.from(e.clipboardData.items);
      const imageItem = items.find((it) => it.type.startsWith('image/'));
      if (!imageItem) return;
      const file = imageItem.getAsFile();
      if (file) handleFile(file);
    };
    document.addEventListener('paste', handler);
    return () => document.removeEventListener('paste', handler);
  }, [handleFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    multiple: false,
    onDrop: (accepted) => { if (accepted[0]) handleFile(accepted[0]); },
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className="relative w-full rounded-3xl cursor-pointer transition-all duration-300 overflow-hidden"
        style={{
          border: `2px dashed ${isDragActive ? 'rgba(199, 153, 255, 0.6)' : 'rgba(255, 255, 255, 0.15)'}`,
          background: isDragActive
            ? 'rgba(199, 153, 255, 0.05)'
            : '#111111',
          minHeight: '380px',
        }}
      >
        <input {...getInputProps()} />

        {/* Faint cinematic background image */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1000&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center 20%',
            filter: 'grayscale(100%) blur(1px)',
          }}
        />
        {/* Dark vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle at center, transparent 30%, #111111 80%)' }}
        />

        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center h-full min-h-[380px]">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-all duration-300"
            style={{
              background: 'rgba(199, 153, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              boxShadow: isDragActive ? '0 0 30px rgba(199, 153, 255, 0.3)' : 'none',
              transform: isDragActive ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            <CloudUpload size={28} style={{ color: '#c799ff' }} />
          </div>

          {isLoading || loadingSample ? (
            <p className="text-xl font-semibold mb-2" style={{ color: '#ffffff' }}>
              {t.loading}
            </p>
          ) : (
            <>
              <p className="text-2xl font-semibold mb-2 tracking-tight" style={{ color: '#ffffff' }}>
                {isDragActive ? t.title_active : t.title_default}
              </p>
              <p className="text-sm mb-2 font-light" style={{ color: '#a3a3a3' }}>
                {t.subtitle}
              </p>
              <p className="text-xs mb-8 font-light" style={{ color: '#6b6b6b' }}>
                {t.paste_hint}
              </p>

              <button
                className="px-8 py-3 rounded-full font-semibold text-[15px] transition-all hover:scale-105 active:scale-95 shadow-lg"
                style={{ background: '#c799ff', color: '#0e0e0e' }}
                onClick={(e) => e.stopPropagation()}
              >
                {t.button}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Sample images */}
      {!isLoading && !loadingSample && (
        <div className="mt-5 flex flex-col items-center gap-3">
          <p className="text-xs" style={{ color: '#6b6b6b' }}>{t.samples}</p>
          <div className="flex gap-2 flex-wrap justify-center">
            {SAMPLES.map(({ key, url }) => (
              <button
                key={key}
                onClick={() => handleSample(key, url)}
                disabled={!!loadingSample}
                className="relative overflow-hidden rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  width: 64,
                  height: 64,
                  border: '1px solid rgba(255,255,255,0.1)',
                  opacity: loadingSample === key ? 0.5 : 1,
                }}
                title={sampleLabels[key]}
              >
                <img
                  src={url.replace('w=800', 'w=128')}
                  alt={key}
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0 flex items-end justify-center pb-1"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }}
                >
                  <span className="text-[9px] font-semibold text-white">
                    {sampleLabels[key]}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div
          className="mt-4 flex items-center gap-2 px-5 py-3 rounded-xl text-sm justify-center"
          style={{
            background: 'rgba(255, 110, 132, 0.1)',
            border: '1px solid rgba(255, 110, 132, 0.3)',
            color: 'var(--error)',
          }}
        >
          <AlertCircle size={16} />
          {error}
        </div>
      )}
    </div>
  );
}
