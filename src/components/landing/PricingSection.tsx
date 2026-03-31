'use client';

import { Check, Zap, Star, Building2, Infinity, Package } from 'lucide-react';
import { useCreditStore } from '@/store/creditStore';

const PLANS = [
  { key: 'topup',      icon: Package,    credits: 100, unlimited: false, color: '#f59e0b', popular: false, oneTime: true,  promo: false },
  { key: 'starter',    icon: Zap,        credits: 100, unlimited: false, color: '#6366f1', popular: false, oneTime: false, promo: true  },
  { key: 'pro',        icon: Star,       credits: 500, unlimited: false, color: '#a855f7', popular: true,  oneTime: false, promo: true  },
  { key: 'enterprise', icon: Building2,  credits: 0,   unlimited: true,  color: '#22d3a0', popular: false, oneTime: false, promo: false },
];

interface PricingSectionProps {
  dict?: any;
}

export function PricingSection({ dict }: PricingSectionProps) {
  const addCredits  = useCreditStore((s) => s.addCredits);
  const setUnlimited = useCreditStore((s) => s.setUnlimited);
  const credits   = useCreditStore((s) => s.credits);
  const unlimited = useCreditStore((s) => s.unlimited);

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
    current_unlimited: '현재 플랜: 엔터프라이즈 (무제한)',
    topup_name: '1회 충전',
    topup_target: '가끔 쓰는 사용자',
    topup_features: ['100 크레딧 즉시 지급', '고해상도 (1×) 다운로드', '초고해상도 (2×) 다운로드', '저해상도 무제한 무료'],
    price_topup: '₩9,900',
    price_starter: '₩4,900',
    price_pro: '₩19,900',
    price_enterprise: '₩99,000',
    per_image_topup: '₩99',
    per_image_starter: '₩49',
    per_image_pro: '₩39',
    starter_name: '스타터',
    starter_target: '블로거, 개인 사용자',
    starter_features: ['월 100 크레딧 지급', '고해상도 (1×) 다운로드', '초고해상도 (2×) 다운로드', '저해상도 무제한 무료'],
    pro_name: '비즈니스',
    pro_target: '소형 쇼핑몰, 마케터',
    pro_features: ['월 500 크레딧 지급', '고해상도 (1×) 다운로드', '초고해상도 (2×) 다운로드', '저해상도 무제한 무료', '일괄 처리 지원'],
    enterprise_name: '엔터프라이즈',
    enterprise_target: '대형 셀러, 플랫폼, 대량 처리',
    enterprise_features: ['무제한 고해상도 생성', '저해상도 무제한 무료', '일괄 처리 지원', '우선 고객 지원', '크레딧 제한 없음'],
    alert_topup: '충전 완료! 100 크레딧이 추가되었습니다.',
    alert_starter: '스타터 구독 완료! 100 크레딧이 추가되었습니다.',
    alert_pro: '비즈니스 구독 완료! 500 크레딧이 추가되었습니다.',
    alert_enterprise: '엔터프라이즈 구독 완료! 이제 무제한으로 생성하실 수 있습니다.',
    note_bottom: '저해상도 다운로드는 크레딧 없이 무제한 무료입니다. 고해상도·초고해상도 다운로드 시 이미지당 1크레딧이 차감됩니다. 엔터프라이즈 플랜은 월 무제한 생성이 가능합니다.',
    promo_banner: '🔥 한시적 프로모션 — 지금 구독하면 첫 달 이용료가 무료입니다!',
    promo_sub: '언제든지 조기 종료될 수 있습니다 · 지금 바로 혜택을 받으세요',
    first_month_free: '첫달 무료',
    buy_promo: '첫달 무료로 시작',
  };

  const priceMap: Record<string, string> = {
    topup: t.price_topup,
    starter: t.price_starter,
    pro: t.price_pro,
    enterprise: t.price_enterprise,
  };
  const perImageMap: Record<string, string> = {
    topup: t.per_image_topup,
    starter: t.per_image_starter,
    pro: t.per_image_pro,
  };

  const handlePurchase = (plan: typeof PLANS[number]) => {
    if (plan.unlimited) {
      setUnlimited(true);
      alert(t.alert_enterprise);
    } else {
      addCredits(plan.credits);
      if (plan.key === 'topup') {
        alert(t.alert_topup || `충전 완료! ${plan.credits} 크레딧이 추가되었습니다.`);
      } else {
        alert(plan.key === 'starter' ? t.alert_starter : t.alert_pro);
      }
    }
  };

  return (
    <section className="py-24 px-6" style={{ background: 'var(--bg-base)' }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            {t.title_1}<span className="gradient-text">{t.title_2}</span>
          </h2>
          <p className="text-base max-w-xl mx-auto mb-5" style={{ color: 'var(--text-muted)' }}>
            {t.subtitle}
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold"
              style={{ background: 'rgba(34,211,160,0.12)', color: '#22d3a0', border: '1px solid rgba(34,211,160,0.25)' }}
            >
              ✓ {t.free_badge}
            </span>
          </div>
        </div>

        {/* 한시적 프로모션 배너 */}
        <div
          className="rounded-2xl p-4 mb-8 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(245,158,11,0.12) 100%)',
            border: '1px solid rgba(239,68,68,0.35)',
          }}
        >
          <p className="text-base font-bold mb-1" style={{ color: '#fca5a5' }}>
            {t.promo_banner || '🔥 한시적 프로모션 — 지금 구독하면 첫 달 이용료가 무료입니다!'}
          </p>
          <p className="text-xs" style={{ color: 'rgba(252,165,165,0.7)' }}>
            {t.promo_sub || '언제든지 조기 종료될 수 있습니다 · 지금 바로 혜택을 받으세요'}
          </p>
        </div>

        {/* Current status */}
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

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-16">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const planName: string = t[`${plan.key}_name`] || plan.key;
            const target: string   = t[`${plan.key}_target`] || '';
            const features: string[] = t[`${plan.key}_features`] || [];
            const price = priceMap[plan.key] || '';
            const perImg = perImageMap[plan.key];

            return (
              <div
                key={plan.key}
                className="relative rounded-3xl p-6 flex flex-col"
                style={{
                  background: 'var(--bg-surface)',
                  border: `1px solid ${plan.popular ? plan.color + '55' : plan.promo ? 'rgba(239,68,68,0.4)' : 'var(--bg-border)'}`,
                  boxShadow: plan.popular ? `0 0 40px ${plan.color}22` : plan.promo ? '0 0 30px rgba(239,68,68,0.1)' : 'none',
                }}
              >
                {/* 인기 배지 */}
                {plan.popular && !plan.promo && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1 rounded-full text-white"
                    style={{ background: 'var(--accent-gradient)' }}
                  >
                    {t.popular}
                  </div>
                )}
                {/* 프로모션 배지 */}
                {plan.promo && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1 rounded-full text-white whitespace-nowrap"
                    style={{ background: 'linear-gradient(90deg, #ef4444, #f97316)' }}
                  >
                    🎁 {t.first_month_free || '첫달 무료'}
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

                {plan.promo ? (
                  /* 프로모션 가격 표시: 취소선 + 첫달 무료 */
                  <div className="mb-1">
                    <span
                      className="text-2xl font-black line-through"
                      style={{ color: 'var(--text-subtle, #555)' }}
                    >{price}</span>
                    <span className="text-sm font-medium ml-1" style={{ color: 'var(--text-muted)' }}>{t.per_month}</span>
                    <div className="text-xl font-black mt-0.5" style={{ color: '#f87171' }}>
                      {t.first_month_free || '첫달 무료'} 🎉
                    </div>
                  </div>
                ) : (
                  <div className="mb-1">
                    <span className="text-4xl font-black" style={{ color: 'var(--text-primary)' }}>{price}</span>
                    <span className="text-sm font-medium ml-1" style={{ color: 'var(--text-muted)' }}>
                      {plan.oneTime ? (t.one_time_label || '1회 충전') : t.per_month}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 mb-5">
                  {plan.unlimited ? (
                    <span className="flex items-center gap-1.5 text-lg font-bold" style={{ color: plan.color }}>
                      <Infinity size={20} /> {t.unlimited_label}
                    </span>
                  ) : (
                    <>
                      <span className="text-lg font-bold" style={{ color: plan.color }}>{plan.credits.toLocaleString()}</span>
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {plan.oneTime ? (t.credits_once || '크레딧') : t.credits_label}
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
                  className="w-full py-3 rounded-2xl text-sm font-bold transition-all hover:opacity-90 active:scale-[0.98]"
                  style={
                    plan.promo
                      ? { background: 'linear-gradient(90deg, #ef4444, #f97316)', color: '#fff' }
                      : plan.popular
                        ? { background: 'var(--accent-gradient)', color: '#fff' }
                        : { background: `${plan.color}22`, color: plan.color, border: `1px solid ${plan.color}44` }
                  }
                >
                  {plan.promo
                    ? (t.buy_promo || '첫달 무료로 시작')
                    : plan.oneTime
                      ? (t.buy_topup || '충전하기')
                      : t.buy}
                </button>
              </div>
            );
          })}
        </div>

        {/* Bottom note */}
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
