'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Scissors } from 'lucide-react';

const LOCALES = ['en', 'ko', 'ja', 'es', 'id'];

const FOOTER_LINKS = [
  { key: 'editor', href: '/editor' },
  { key: 'privacy', href: '/privacy' },
  { key: 'terms', href: '/terms' },
  { key: 'business', href: '/business' },
  { key: 'contact', href: 'mailto:dcbvcd@gmail.com' },
];

export function Footer({ dict }: { dict?: any }) {
  const pathname = usePathname();
  const segment = pathname?.split('/')[1] ?? '';
  const lang = LOCALES.includes(segment) ? segment : 'ko';

  const t = dict?.footer || {
    copyright: '© 2026 BGRemover. 모든 이미지는 로컬에서 처리됩니다.',
    // 대표자명·사업자등록번호 등 상세 고지는 /business 페이지(noindex)에서만 노출한다
    company: '다음세상',
    privacy: '개인정보처리방침',
    terms: '이용약관',
    business: '사업자 정보',
    editor: '에디터',
    contact: '문의하기',
    license_prefix: '배경 제거 AI 모델',
  };

  return (
    <footer
      className="py-12 px-6"
      style={{
        borderTop: '1px solid var(--bg-border)',
        background: 'var(--bg-surface)',
      }}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--accent-gradient)' }}
            >
              <Scissors size={14} className="text-white" />
            </div>
            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
              BG<span className="gradient-text">Remover</span>
            </span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>
            {t.company ?? '다음세상'}
          </p>
        </div>

        <p className="text-sm text-center" style={{ color: 'var(--text-subtle)' }}>
          {t.copyright}
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          {FOOTER_LINKS.map(({ key, href }) => {
            const label: string = t[key] ?? key;
            const isExternal = href.startsWith('mailto:');
            return isExternal ? (
              <a
                key={key}
                href={href}
                className="text-sm transition-colors duration-200"
                style={{ color: 'var(--text-subtle)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-subtle)')}
              >
                {label}
              </a>
            ) : (
              <Link
                key={key}
                href={`/${lang}${href}`}
                className="text-sm transition-colors duration-200"
                style={{ color: 'var(--text-subtle)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-subtle)')}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* 오픈소스 모델 라이선스 고지 (ormbg, Apache-2.0) */}
      <div
        className="max-w-6xl mx-auto mt-8 pt-6 text-center"
        style={{ borderTop: '1px solid var(--bg-border)' }}
      >
        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-subtle)' }}>
          {t.license_prefix ?? '배경 제거 AI 모델'}:{' '}
          <a
            href="https://huggingface.co/schirrmacher/ormbg"
            target="_blank"
            rel="noopener noreferrer"
            className="underline transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            ormbg
          </a>{' '}
          (Apache-2.0 License) © schirrmacher
        </p>
      </div>
    </footer>
  );
}
