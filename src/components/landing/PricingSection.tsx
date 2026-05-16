'use client';

// 랜딩 페이지 요금제 섹션 — Paddle Checkout 연동
import { Check, Zap, Star, Building2, Infinity, Package } from 'lucide-react';
import { useCreditStore } from '@/store/creditStore';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { initializePaddle, type Paddle } from '@paddle/paddle-js';

const PLANS = [
  { key: 'topup',      icon: Package,    credits: 100, unlimited: false, color: '#f59e0b', popular: false, oneTime: true  },
  { key: 'starter',    icon: Zap,        credits: 100, unlimited: false, color: '#6366f1', popular: false, oneTime: false },
  { key: 'business',   icon: Star,       credits: 500, unlimited: false, color: '#a855f7', popular: true,  oneTime: false },
  { key: 'enterprise', icon: Building2,  credits: 0,   unlimited: true,  color: '#22d3a0', popular: false, oneTime: false },
];

const PRICE_IDS: Record<string, string> = {
  topup:      process.env.NEXT_PUBLIC_PADDLE_PRICE_TOPUP      ?? '',
  starter:    process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER    ?? '',
  business:   process.env.NEXT_PUBLIC_PADDLE_PRICE_BUSINESS   ?? '',
  enterprise: process.env.NEXT_PUBLIC_PADDLE_PRICE_ENTERPRISE ?? '',
};

interface PricingSectionProps {
  dict?: any;
}

export function PricingSection({ dict }: PricingSectionProps) {
  const credits   = useCreditStore((s) => s.credits);
  const unlimited = useCreditStore((s) => s.unlimited);
  const [paying, setPaying] = useState<string | null>(null);
  const paddleRef = useRef<Paddle | null>(null);

  useEffect(() => {
    initializePaddle({
      environment: (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT ?? 'sandbox') as 'sandbox' | 'production',
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
    }).then((p) => { if (p) paddleRef.current = p; });
  }, []);

  const t = dict?.pricing || {
    title_1: '심플하고 ',
    title_2: '투명한 요금제',
    subtitle: '구독 또는 1회 충전으로 이용하세요. 저해상도 미리보기는 항상 무료입니다.',
    free_badge: '저해상도 무료',
    popular: '인기',
    per_month: '/월',
    one_time_label: '1회 충전',
    credits_label: '크레딧/월',
    credits_once: '크레딧',
    unlimited_label: '무제한 생성',
    per_image: '장당',
    buy: '구독 시작하기',
    buy_topup: '충전하기',
    current_credits: '현재 보유 크레딧',
    current_unlimited: '현재 플랜: Enterprise (무제한)',
    topup_name: '1회 충전',
    topup_target: '가끔 쓰는 사용자',
    topup_features: ['100 크레딧 즉시 지급', '고해상도 다운로드', '저해상도 무제한 무료'],
    price_topup: '$6.99',
    price_starter: '$3.99',
    price_business: '$12.99',
    price_enterprise: '$59.99',
    per_image_topup: '$0.07',
    per_image_starter: '$0.04',
    per_image_business: '$0.026',
    starter_name: 'Starter',
    starter_target: '블로거, 개인 사용자',
    starter_features: ['월 100 크레딧 지급', '고해상도 다운로드', '저해상도 무제한 무료'],
    business_name: 'Business',
    business_target: '소형 쇼핑몰, 마케터',
    business_features: ['월 500 크레딧 지급', '고해상도 다운로드', '저해상도 무제한 무료', '일괄 처리 지원'],
    enterprise_name: 'Enterprise',
    enterprise_target: '대형 셀러, 플랫폼, 대량 처리',
    enterprise_features: ['월 무제한 생성', '저해상도 무제한', '일괄 처리', '우선 고객 지원'],
    note_bottom: '저해상도 다운로드는 크레딧 없이 무제한 무료입니다. 고해상도 다운로드 시 이미지당 1크레딧이 차감됩니다.',
  };

  const priceMap: Record<string, string> = {
    topup:      t.price_topup,
    starter:    t.price_starter,
    business:   t.price_business,
    enterprise: t.price_enterprise,
  };
  const perImageMap: Record<string, string> = {
    topup:    t.per_image_topup,
    starter:  t.per_image_starter,
    business: t.per_image_business,
  };

  const handlePurchase = async (plan: typeof PLANS[number]) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert('로그인이 필요합니다.'); return; }

    const priceId = PRICE_IDS[plan.key];
    if (!priceId) { alert('결제 설정 오류입니다. 잠시 후 다시 시도해주세요.'); return; }

    setPaying(plan.key);
    try {
      const paddle = paddleRef.current;
      if (!paddle) { alert('결제 모듈 로딩 중입니다. 잠시 후 다시 시도해주세요.'); setPaying(null); return; }

      paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: { email: user.email ?? '' },
        customData: { userId: user.id },
        settings: {
          successUrl: `${window.location.origin}/editor?payment=success`,
        },
      });
    } catch (err) {
      console.error('[Paddle] checkout error', err);
      alert('결제 창을 열지 못했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setPaying(null);
    }
  };

  return (
    <section className="py-24 px-6" style={{ background: 'var(--bg-base)' }}>
      <div className="max-w-5xl mx-auto">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-16">
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
                className="relative rounded-3xl p-6 flex flex-col"
                style={{
                  background: 'var(--bg-surface)',
                  border: `1px solid ${plan.popular ? plan.color + '55' : 'var(--bg-border)'}`,
                  boxShadow: plan.popular ? `0 0 40px ${plan.color}22` : 'none',
                }}
              >
                {plan.popular && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1 rounded-full text-white"
                    style={{ background: 'var(--accent-gradient)' }}
                  >
                    {t.popular}
                  </div>
                )}

                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: `${plan.color}22` }}>
                    <Icon size={22} style={{ color: plan.color }} />
                  </div>
                  <div>
                    <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{planName}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{target}</p>
                  </div>
                </div>

                <div className="mb-1">
                  <span className="text-4xl font-black" style={{ color: 'var(--text-primary)' }}>{price}</span>
                  <span className="text-sm font-medium ml-1" style={{ color: 'var(--text-muted)' }}>
                    {plan.oneTime ? t.one_time_label : t.per_month}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-5">
                  {plan.unlimited ? (
                    <span className="flex items-center gap-1.5 text-lg font-bold" style={{ color: plan.color }}>
                      <Infinity size={20} /> {t.unlimited_label}
                    </span>
                  ) : (
                    <>
                      <span className="text-lg font-bold" style={{ color: plan.color }}>{plan.credits.toLocaleString()}</span>
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {plan.oneTime ? t.credits_once : t.credits_label}
                      </span>
                      {perImg && (
                        <span className="text-xs ml-auto px-2 py-0.5 rounded-full font-semibold" style={{ background: `${plan.color}18`, color: plan.color }}>
                          {t.per_image} {perImg}
                        </span>
                      )}
                    </>
                  )}
                </div>

                <ul className="space-y-2.5 mb-6 flex-1">
                  {features.map((f: string) => (
                    <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                      <Check size={15} style={{ color: plan.color, flexShrink: 0, marginTop: 1 }} />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePurchase(plan)}
                  disabled={paying !== null}
                  className="w-full py-3 rounded-2xl text-sm font-bold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={
                    plan.popular
                      ? { background: 'var(--accent-gradient)', color: '#fff' }
                      : { background: `${plan.color}22`, color: plan.color, border: `1px solid ${plan.color}44` }
                  }
                >
                  {paying === plan.key ? '처리 중...' : plan.oneTime ? t.buy_topup : t.buy}
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
