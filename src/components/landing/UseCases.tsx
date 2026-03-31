'use client';

import { Camera, ShoppingBag, Megaphone, Palette, Code2, User } from 'lucide-react';

const ICONS = [Camera, ShoppingBag, Megaphone, Palette, Code2, User];

interface UseCasesProps {
  dict?: any;
}

export function UseCases({ dict }: UseCasesProps) {
  const t = dict?.useCases || {
    title_1: '누구를 위한 ',
    title_2: '서비스인가요?',
    subtitle: '사진작가부터 개발자까지 — BGRemover는 모든 전문가의 워크플로우에 맞게 설계되었습니다.',
    items: [
      { title: '사진작가', description: '인물 및 제품 사진에서 빠르게 배경을 제거하고 고객에게 전달하세요.' },
      { title: '이커머스', description: '흰색 또는 투명 배경의 제품 이미지를 대량으로 빠르게 처리하세요.' },
      { title: '마케터', description: '광고 소재를 위한 깔끔한 이미지를 몇 초 안에 준비하세요.' },
      { title: '디자이너', description: '합성과 콜라주를 위한 완벽한 누끼 이미지를 즉시 확보하세요.' },
      { title: '개발자', description: '앱이나 서비스에 자동화된 배경 제거 기능을 손쉽게 연동하세요.' },
      { title: '개인 사용자', description: '프로필 사진, SNS 게시물, 선물 이미지를 멋지게 꾸미세요.' },
    ],
  };

  return (
    <section className="py-20 px-6" style={{ background: 'var(--bg-surface)' }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            {t.title_1}
            <span className="gradient-text">{t.title_2}</span>
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            {t.subtitle}
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {t.items.map((item: { title: string; description: string }, i: number) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <div
                key={i}
                className="p-6 rounded-2xl transition-all duration-200 group cursor-default"
                style={{
                  background: 'var(--bg-base)',
                  border: '1px solid var(--bg-border)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(99,102,241,0.4)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 20px rgba(99,102,241,0.1)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--bg-border)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(99,102,241,0.15)' }}
                >
                  <Icon size={20} style={{ color: 'var(--accent-glow)' }} />
                </div>
                <h3 className="font-semibold mb-2 text-base" style={{ color: 'var(--text-primary)' }}>
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
