'use client';

const AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80',
];

interface TestimonialsProps {
  dict?: any;
}

export function Testimonials({ dict }: TestimonialsProps) {
  const t = dict?.testimonials || {
    title_1: '전 세계 사용자들의 ',
    title_2: '실제 후기',
    subtitle: '수천 명의 디자이너, 마케터, 개발자가 매일 BGRemover를 사용합니다.',
    items: [
      {
        name: 'Alex Kim',
        role: '이커머스 운영자',
        text: '제품 이미지를 매일 수십 장씩 처리해야 하는데, 이 도구 덕분에 작업 시간이 80% 이상 줄었습니다. 결과물 품질도 기대 이상입니다.',
        rating: 5,
      },
      {
        name: 'Sophie Laurent',
        role: '사진작가',
        text: '가장자리 처리가 정말 정밀해서 놀랐어요. 머리카락 같은 세밀한 부분도 깔끔하게 잘려나옵니다. 포토샵보다 훨씬 빠릅니다.',
        rating: 5,
      },
      {
        name: 'Marcus Johnson',
        role: 'UI 디자이너',
        text: '서버로 이미지를 보내지 않는다는 점이 가장 마음에 들어요. 클라이언트 데이터를 다룰 때 보안이 매우 중요하거든요.',
        rating: 4,
      },
      {
        name: 'Yuki Tanaka',
        role: '콘텐츠 크리에이터',
        text: 'SNS 콘텐츠 제작에 정말 유용합니다. 배경 제거 후 그라디언트 배경을 바로 적용할 수 있어서 워크플로우가 완전히 달라졌어요.',
        rating: 5,
      },
    ],
  };

  return (
    <section className="py-20 px-6" style={{ background: 'var(--bg-base)' }}>
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

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {t.items.map((item: { name: string; role: string; text: string; rating: number }, i: number) => (
            <div
              key={i}
              className="p-6 rounded-2xl"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--bg-border)',
              }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, s) => (
                  <span
                    key={s}
                    style={{ color: s < item.rating ? '#f59e0b' : 'var(--bg-border)', fontSize: 16 }}
                  >
                    ★
                  </span>
                ))}
              </div>

              {/* Text */}
              <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-muted)' }}>
                "{item.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <img
                  src={AVATARS[i % AVATARS.length]}
                  alt={item.name}
                  className="w-9 h-9 rounded-full object-cover"
                  style={{ border: '1px solid var(--bg-border)' }}
                />
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {item.name}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>
                    {item.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
