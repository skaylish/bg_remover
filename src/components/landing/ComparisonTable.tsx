'use client';

import { Check, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// Competitor research data (2024 기준)
// ClippingMagic: Standard ₩9,499/100크레딧 = ₩95/장
// remove.bg: $0.20/image ≈ ₩270/장 (개별 크레딧 기준)
// removal.ai: $0.10/image ≈ ₩135/장 (기본 플랜 기준)
const COMPETITORS = [
  {
    name: 'BGRemover',
    us: true,
    pricePerImage: '₩19~49',
    freePreview: true,
    freeLowRes: true,
    browserProcess: true,
    noExpiry: true,
  },
  {
    name: 'ClippingMagic',
    us: false,
    pricePerImage: '₩38~95',
    freePreview: true,
    freeLowRes: false,
    browserProcess: false,
    noExpiry: false,
  },
  {
    name: 'remove.bg',
    us: false,
    pricePerImage: '₩270+',
    freePreview: true,
    freeLowRes: false,
    browserProcess: false,
    noExpiry: false,
  },
  {
    name: 'removal.ai',
    us: false,
    pricePerImage: '₩135+',
    freePreview: true,
    freeLowRes: true,
    browserProcess: false,
    noExpiry: false,
  },
];

interface ComparisonTableProps {
  dict?: any;
}

export function ComparisonTable({ dict }: ComparisonTableProps) {
  const params = useParams();
  const lang = (params?.lang as string) || 'ko';

  const t = dict?.comparison || {
    title_1: '업계 최저가를 ',
    title_2: '직접 비교해보세요',
    subtitle: '동일한 품질, 더 낮은 비용. BGRemover는 클라우드 서버 없이 브라우저에서 직접 처리해 비용 구조 자체가 다릅니다.',
    col_service: '서비스',
    col_price: '장당 최저가',
    col_free_lowres: '무료 저해상도',
    col_browser: '브라우저 처리',
    col_no_sub: '구독 불필요',
    col_no_expiry: '크레딧 만료 없음',
    cta: '지금 무료로 시작하기',
    badge_cheapest: '최저가',
    note: '* 2024년 기준 각 서비스 공식 홈페이지 가격 참고. 환율 1USD=1,350KRW 적용.',
  };

  const cols = [
    { key: 'freePreview', label: '미리보기 무료' },
    { key: 'freeLowRes', label: t.col_free_lowres },
    { key: 'browserProcess', label: t.col_browser },
    { key: 'noExpiry', label: t.col_no_expiry },
  ] as const;

  return (
    <section className="py-20 px-6" style={{ background: 'var(--bg-surface)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-6"
            style={{ background: 'rgba(34,211,160,0.12)', color: '#22d3a0', border: '1px solid rgba(34,211,160,0.25)' }}
          >
            💰 업계 최저가 보장
          </div>
          <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            {t.title_1}<span className="gradient-text">{t.title_2}</span>
          </h2>
          <p className="text-base max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            {t.subtitle}
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid var(--bg-border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--bg-raised)', borderBottom: '1px solid var(--bg-border)' }}>
                <th className="text-left py-4 px-5 font-semibold" style={{ color: 'var(--text-muted)' }}>
                  {t.col_service}
                </th>
                <th className="text-center py-4 px-4 font-semibold" style={{ color: 'var(--text-muted)' }}>
                  {t.col_price}
                </th>
                {cols.map((c) => (
                  <th key={c.key} className="text-center py-4 px-3 font-semibold text-xs" style={{ color: 'var(--text-muted)' }}>
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPETITORS.map((comp, i) => (
                <tr
                  key={comp.name}
                  style={{
                    background: comp.us ? 'rgba(99,102,241,0.06)' : i % 2 === 0 ? 'var(--bg-base)' : 'transparent',
                    borderBottom: i < COMPETITORS.length - 1 ? '1px solid var(--bg-border)' : 'none',
                  }}
                >
                  {/* Name */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2">
                      {comp.us ? (
                        <span className="font-bold" style={{ color: 'var(--accent-glow)' }}>{comp.name}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>{comp.name}</span>
                      )}
                      {comp.us && (
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(34,211,160,0.2)', color: '#22d3a0' }}
                        >
                          {t.badge_cheapest}
                        </span>
                      )}
                    </div>
                  </td>
                  {/* Price */}
                  <td className="py-4 px-4 text-center">
                    {comp.us ? (
                      <span className="font-bold text-base" style={{ color: '#22d3a0' }}>{comp.pricePerImage}</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>{comp.pricePerImage}</span>
                    )}
                  </td>
                  {/* Boolean cols */}
                  {cols.map((c) => (
                    <td key={c.key} className="py-4 px-3 text-center">
                      {comp[c.key] ? (
                        <Check size={16} className="mx-auto" style={{ color: comp.us ? '#22d3a0' : '#6366f1' }} />
                      ) : (
                        <X size={16} className="mx-auto" style={{ color: 'var(--text-subtle)' }} />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-center" style={{ color: 'var(--text-subtle)' }}>{t.note}</p>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link
            href={`/${lang}/pricing`}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold text-white btn-glow transition-all hover:scale-105"
          >
            {t.cta}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
