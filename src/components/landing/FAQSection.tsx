// FAQ 섹션 — details/summary로 서버 렌더해 접힌 상태에서도 본문이 HTML에 남게 한다 (크롤러·AI 인용 대비)
import { ChevronDown } from 'lucide-react';

export function FAQSection({ dict }: { dict?: any }) {
  const t = dict?.faq;
  if (!t?.items?.length) return null;

  return (
    <section className="py-32 px-6 relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight" style={{ color: 'var(--text-primary)' }}>
            <span className="gradient-text">{t.title_1}</span>{t.title_2}
          </h2>
          <p className="text-xl max-w-2xl mx-auto font-light" style={{ color: 'var(--text-muted)', wordBreak: 'keep-all' }}>
            {t.subtitle}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {t.items.map((item: any, i: number) => (
            <details
              key={i}
              className="group glass-card rounded-2xl px-6 py-5"
              style={{ borderTop: '1px solid rgba(170,138,255,0.25)' }}
            >
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                <h3 className="font-bold text-lg" style={{ wordBreak: 'keep-all' }}>{item.q}</h3>
                <ChevronDown
                  size={20}
                  className="shrink-0 transition-transform duration-300 group-open:rotate-180"
                  style={{ color: '#aa8aff' }}
                />
              </summary>
              <p className="mt-4 text-base font-light leading-relaxed" style={{ color: 'var(--text-muted)', wordBreak: 'keep-all' }}>
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
