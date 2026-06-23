'use client';

// 랜딩 페이지 요금제 섹션 — Gumroad Checkout 연동
import { Check, Zap, Flame, Star, Rocket, Building2 } from 'lucide-react';
import { useCreditStore } from '@/store/creditStore';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const PLANS = [
  { key: 'starter',    icon: Zap,       credits:  100, color: '#6366f1', popular: false },
  { key: 'lite',       icon: Flame,     credits:  300, color: '#3b82f6', popular: false },
  { key: 'business',   icon: Star,      credits:  500, color: '#a855f7', popular: true  },
  { key: 'growth',     icon: Rocket,    credits: 2000, color: '#f59e0b', popular: false },
  { key: 'enterprise', icon: Building2, credits: 5000, color: '#22d3a0', popular: false },
];

interface PricingSectionProps {
  dict?: any;
}

export function PricingSection({ dict }: PricingSectionProps) {
  const credits   = useCreditStore((s) => s.credits);
  const unlimited = useCreditStore((s) => s.unlimited);
  const [paying, setPaying] = useState<string | null>(null);

  const t = dict?.pricing || {
    title_1: '심플하고 ',
    title_2: '투명한 요금제',
    subtitle: '구독제로 이용하세요. 저해상도 미리보기는 항상 무료입니다.',
    free_badge: '저해상도 무료',
    popular: '인기',
    per_month: '/월',
    one_time_label: '',
    credits_label: '크레딧/월',
    credits_once: '크레딧',
    unlimited_label: '무제한 생성',
    per_image: '장당',
    buy: '구독 시작하기',
    buy_topup: '충전하기',
    current_credits: '현재 보유 크레딧',
    current_unlimited: '현재 플랜: Enterprise (무제한)',
    price_starter:    '$3.99',
    price_lite:       '$8.99',
    price_business:   '$12.99',
    price_growth:     '$29.99',
    price_enterprise: '$59.99',
    per_image_starter:    '$0.040',
    per_image_lite:       '$0.030',
    per_image_business:   '$0.026',
    per_image_growth:     '$0.015',
    per_image_enterprise: '$0.012',
    starter_name: 'Starter',
    starter_target: '블로거, 개인 사용자',
    starter_features: ['월 100 크레딧 지급', '고해상도 다운로드', '저해상도 무제한 무료'],
    lite_name: 'Lite',
    lite_target: '프리랜서, 소규모 작업',
    lite_features: ['월 300 크레딧 지급', '고해상도 다운로드', '저해상도 무제한 무료'],
    business_name: 'Business',
    business_target: '소형 쇼핑몰, 마케터',
    business_features: ['월 500 크레딧 지급', '고해상도 다운로드', '저해상도 무제한 무료', '일괄 처리 지원'],
    growth_name: 'Growth',
    growth_target: '중형 셀러, 에이전시',
    growth_features: ['월 2,000 크레딧 지급', '고해상도 다운로드', '저해상도 무제한 무료', '일괄 처리 지원'],
    enterprise_name: 'Enterprise',
    enterprise_target: '대형 셀러, 플랫폼',
    enterprise_features: ['월 5,000 크레딧 지급', '고해상도 다운로드', '저해상도 무제한 무료', '일괄 처리 지원', '우선 고객 지원'],
    note_bottom: '저해상도 다운로드는 크레딧 없이 무제한 무료입니다. 고해상도 다운로드 시 이미지당 1크레딧이 차감됩니다.',
  };

  const priceMap: Record<string, string> = {
    starter:    t.price_starter,
    lite:       t.price_lite,
    business:   t.price_business,
    growth:     t.price_growth,
    enterprise: t.price_enterprise,
  };
  const perImageMap: Record<string, string> = {
    starter:    t.per_image_starter,
    lite:       t.per_image_lite,
    business:   t.per_image_business,
    growth:     t.per_image_growth,
    enterprise: t.per_image_enterprise,
  };

  const handlePurchase = async (plan: typeof PLANS[number]) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert('로그인이 필요합니다.'); return; }

    setPaying(plan.key);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plan.key }),
      });
      const json = await res.json();
      if (!json.url) { alert((json.error) ?? '결제 창을 열지 못했습니다.'); return; }
      window.open(json.url, '_blank');
    } catch (err) {
      console.error('[GR] checkout error', err);
      alert('결제 창을 열지 못했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setPaying(null);
    }
  };

  return (
    <section className="py-24 px-6" style={{ background: 'var(--bg-base)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            {t.title_1}<span className="gradient-text">{t.title_2}</span>
          </h2>
          <p className="text-base max-w-xl mx-auto mb-5" style={{ color: 'var(--text-muted)' }}>
            {t.subtitle}
          </p>
          <span
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold"
            style={{ background: 'rgba(34,211,160,0.12)', color: '#22d3a0', border: '1px solid rgba(34,211,160,0.25)' }}
          >
            ✓ {t.free_badge}
          </span>
        </div>

        {(credits > 0 || unlimited) && (
          <div
            className="text-center mb-8 py-3 rounded-2xl text-sm font-semibold"
            style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--accent-glow)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            {unlimited
              ? t.current_unlimited
              : `${t.current_credits}: ${credits.toLocaleString()} ${t.credits_label}`}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-16">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const planName: string  = t[`${plan.key}_name`] || plan.key;
            const target: string    = t[`${plan.key}_target`] || '';
            const features: string[] = t[`${plan.key}_features`] || [];
            const price  = priceMap[plan.key] || '';
            const perImg = perImageMap[plan.key];

            return (
              <div
                key={plan.key}
                className="relative rounded-3xl p-5 flex flex-col"
                style={{
                  background: 'var(--bg-surface)',
                  border: `1px solid ${plan.popular ? plan.color + '55' : 'var(--bg-border)'}`,
                  boxShadow: plan.popular ? `0 0 40px ${plan.color}22` : 'none',
                }}
              >
                {plan.popular && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1 rounded-full text-white whitespace-nowrap"
                    style={{ background: 'var(--accent-gradient)' }}
                  >
                    {t.popular}
                  </div>
                )}

                {/* 아이콘 + 플랜명 */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center" style={{ background: `${plan.color}22` }}>
                    <Icon size={18} style={{ color: plan.color }} />
                  </div>
                  <p className="font-bold text-base leading-tight" style={{ color: 'var(--text-primary)' }}>{planName}</p>
                </div>

                {/* 가격 */}
                <div className="mb-1">
                  <span className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>{price}</span>
                  <span className="text-xs font-medium ml-1" style={{ color: 'var(--text-muted)' }}>{t.per_month}</span>
                </div>

                {/* 크레딧 + 장당 */}
                <div className="mb-4">
                  <span className="text-sm font-bold" style={{ color: plan.color }}>{plan.credits.toLocaleString()}</span>
                  <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>{t.credits_label}</span>
                  {perImg && (
                    <span className="block text-[11px] mt-0.5" style={{ color: plan.color, opacity: 0.75 }}>
                      {t.per_image} {perImg}
                    </span>
                  )}
                </div>

                <ul className="space-y-1.5 mb-5 flex-1">
                  {features.map((f: string) => (
                    <li key={f} className="flex items-start gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <Check size={12} style={{ color: plan.color, flexShrink: 0, marginTop: 1 }} />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePurchase(plan)}
                  disabled={paying !== null}
                  className="w-full py-2.5 rounded-2xl text-xs font-bold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={
                    plan.popular
                      ? { background: 'var(--accent-gradient)', color: '#fff' }
                      : { background: `${plan.color}22`, color: plan.color, border: `1px solid ${plan.color}44` }
                  }
                >
                  {paying === plan.key ? '처리 중...' : t.buy}
                </button>
              </div>
            );
          })}
        </div>

        <div
          className="rounded-2xl p-6 text-center"
          style={{ background: 'var(--bg-surface)', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            💡 {t.note_bottom}
          </p>
        </div>
      </div>
    </section>
  );
}
