// 언어별 OG 공유 카드 이미지를 1200x630으로 동적 생성
import { ImageResponse } from 'next/og';

export const alt = 'BGRemover — AI Background Remover that runs in your browser';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const COPY: Record<string, { headline: string; sub: string }> = {
  en: { headline: 'Remove Backgrounds\nWithout Uploading',       sub: '100% in your browser · Free forever' },
  ko: { headline: '업로드 없이\n배경 제거',                        sub: '100% 브라우저 처리 · 영구 무료' },
  ja: { headline: 'アップロード不要\n背景を削除',                    sub: '100%ブラウザ処理 · 永久無料' },
  es: { headline: 'Quita Fondos\nSin Subir Nada',                sub: '100% en tu navegador · Gratis siempre' },
  id: { headline: 'Hapus Background\nTanpa Upload',              sub: '100% di browser Anda · Gratis selamanya' },
};

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const { headline, sub } = COPY[lang] ?? COPY.en;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #0b0b12 0%, #16162a 100%)',
        }}
      >
        <div style={{ display: 'flex', fontSize: 30, color: '#8b8bb0', letterSpacing: 2 }}>
          BGREMOVER.PICS
        </div>
        <div
          style={{
            display: 'flex',
            whiteSpace: 'pre-wrap',
            fontSize: 82,
            fontWeight: 800,
            lineHeight: 1.15,
            color: '#ffffff',
            marginTop: 28,
          }}
        >
          {headline}
        </div>
        <div style={{ display: 'flex', fontSize: 36, color: '#7c9cff', marginTop: 32 }}>
          {sub}
        </div>
      </div>
    ),
    size
  );
}
