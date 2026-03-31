'use client';

import { useState } from 'react';

const CATEGORIES = ['product', 'person', 'animal', 'car'] as const;
type Category = typeof CATEGORIES[number];

const SAMPLES: Record<Category, { before: string; after: string; label: string }[]> = {
  product: [
    {
      before: '/demo-before.jpg',
      after:  '/demo-after.png',
      label: 'Shoes',
    },
    {
      before: 'https://raw.githubusercontent.com/danielgatis/rembg/master/examples/plants-1.jpg',
      after:  'https://raw.githubusercontent.com/danielgatis/rembg/master/examples/plants-1.out.png',
      label: 'Plant',
    },
    {
      before: 'https://raw.githubusercontent.com/danielgatis/rembg/master/examples/anime-girl-1.jpg',
      after:  'https://raw.githubusercontent.com/danielgatis/rembg/master/examples/anime-girl-1.out.png',
      label: 'Figure',
    },
  ],
  person: [
    {
      before: 'https://raw.githubusercontent.com/danielgatis/rembg/master/examples/girl-1.jpg',
      after:  'https://raw.githubusercontent.com/danielgatis/rembg/master/examples/girl-1.out.png',
      label: 'Portrait 1',
    },
    {
      before: 'https://raw.githubusercontent.com/danielgatis/rembg/master/examples/girl-2.jpg',
      after:  'https://raw.githubusercontent.com/danielgatis/rembg/master/examples/girl-2.out.png',
      label: 'Portrait 2',
    },
    {
      before: 'https://raw.githubusercontent.com/danielgatis/rembg/master/examples/girl-3.jpg',
      after:  'https://raw.githubusercontent.com/danielgatis/rembg/master/examples/girl-3.out.png',
      label: 'Portrait 3',
    },
  ],
  animal: [
    {
      before: 'https://raw.githubusercontent.com/danielgatis/rembg/master/examples/animal-1.jpg',
      after:  'https://raw.githubusercontent.com/danielgatis/rembg/master/examples/animal-1.out.png',
      label: 'Animal 1',
    },
    {
      before: 'https://raw.githubusercontent.com/danielgatis/rembg/master/examples/animal-2.jpg',
      after:  'https://raw.githubusercontent.com/danielgatis/rembg/master/examples/animal-2.out.png',
      label: 'Animal 2',
    },
    {
      before: 'https://raw.githubusercontent.com/danielgatis/rembg/master/examples/animal-3.jpg',
      after:  'https://raw.githubusercontent.com/danielgatis/rembg/master/examples/animal-3.out.png',
      label: 'Animal 3',
    },
  ],
  car: [
    {
      before: 'https://raw.githubusercontent.com/danielgatis/rembg/master/examples/car-1.jpg',
      after:  'https://raw.githubusercontent.com/danielgatis/rembg/master/examples/car-1.out.png',
      label: 'Car 1',
    },
    {
      before: 'https://raw.githubusercontent.com/danielgatis/rembg/master/examples/car-2.jpg',
      after:  'https://raw.githubusercontent.com/danielgatis/rembg/master/examples/car-2.out.png',
      label: 'Car 2',
    },
    {
      before: 'https://raw.githubusercontent.com/danielgatis/rembg/master/examples/car-3.jpg',
      after:  'https://raw.githubusercontent.com/danielgatis/rembg/master/examples/car-3.out.png',
      label: 'Car 3',
    },
  ],
};

const BG_GRADIENTS = [
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)',
  'linear-gradient(120deg, #d4fc79 0%, #96e6a1 100%)',
  'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  'linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)',
];

interface CategoryGalleryProps {
  dict?: any;
}

export function CategoryGallery({ dict }: CategoryGalleryProps) {
  const [activeTab, setActiveTab] = useState<Category>('product');

  const t = dict?.categoryGallery || {
    title_1: '모든 카테고리에서 ',
    title_2: '완벽한 결과',
    subtitle: '제품, 인물, 동물, 자동차 — 어떤 이미지든 단 한 번의 클릭으로 완벽하게 배경을 제거합니다.',
    tabs: { product: '제품', person: '인물', animal: '동물', car: '자동차' },
    before: '원본',
    after: '결과',
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

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200"
              style={{
                background: activeTab === cat ? 'var(--accent-gradient)' : 'var(--bg-raised)',
                color: activeTab === cat ? '#fff' : 'var(--text-muted)',
                border: `1px solid ${activeTab === cat ? 'transparent' : 'var(--bg-border)'}`,
              }}
            >
              {t.tabs[cat]}
            </button>
          ))}
        </div>

        {/* Gallery grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SAMPLES[activeTab].map((item, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid var(--bg-border)' }}
            >
              <div className="grid grid-cols-2">
                {/* Before — original photo */}
                <div className="relative">
                  <img
                    src={item.before}
                    alt={item.label}
                    className="w-full aspect-square object-cover"
                  />
                  <span
                    className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(0,0,0,0.6)', color: '#ccc' }}
                  >
                    {t.before}
                  </span>
                </div>

                {/* After — studio/clean-bg photo, object-contain over new background */}
                <div 
                  className="relative aspect-square p-2" 
                  style={{ background: BG_GRADIENTS[i % BG_GRADIENTS.length] }}
                >
                  <img
                    src={item.after}
                    alt={`${item.label} bg removed`}
                    className="w-full h-full object-contain"
                  />
                  <span
                    className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(99,102,241,0.8)', color: '#fff' }}
                  >
                    {t.after}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
