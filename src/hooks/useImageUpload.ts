'use client';

import { useCallback } from 'react';

const MAX_SIZE_MB = 25;
const MAX_DIMENSION = 4096;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function resizeImageIfNeeded(file: File): Promise<File> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      if (img.width <= MAX_DIMENSION && img.height <= MAX_DIMENSION) {
        resolve(file);
        return;
      }
      const scale = MAX_DIMENSION / Math.max(img.width, img.height);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);
      // PNG 무손실 유지 — JPEG 변환 시 경계선 압축 아티팩트가 마스크 정확도를 떨어뜨림
      canvas.toBlob((blob) => {
        if (blob) {
          const ext = file.name.replace(/\.[^/.]+$/, '') + '.png';
          resolve(new File([blob], ext, { type: 'image/png' }));
        } else {
          resolve(file);
        }
      }, 'image/png');
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

export function useImageUpload() {
  const validate = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'JPG, PNG, WEBP 형식만 지원합니다.';
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `파일 크기는 ${MAX_SIZE_MB}MB 이하여야 합니다.`;
    }
    return null;
  }, []);

  const prepare = useCallback(async (file: File): Promise<{ file: File; dataUrl: string } | { error: string }> => {
    const err = validate(file);
    if (err) return { error: err };

    const resized = await resizeImageIfNeeded(file);
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(resized);
    });

    return { file: resized, dataUrl };
  }, [validate]);

  return { validate, prepare };
}
