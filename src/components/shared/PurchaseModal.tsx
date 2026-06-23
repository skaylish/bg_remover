'use client';

// 크레딧 부족 시 표시되는 결제 모달 — Gumroad Checkout 연동
import { X, Zap, Flame, Star, Rocket, Building2, Check } from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { TOSS_KRW_PRICES, formatKrw } from '@/lib/toss-pricing';
import { requestTossBilling } from '@/lib/toss-client';

const PLANS = [
  { key: 'starter',    icon: Zap,       credits:  100, color: '#6366f1', popular: false },
  { key: 'lite',       icon: Flame,     credits:  300, color: '#3b82f6', popular: false },
  { key: 'business',   icon: Star,      credits:  500, color: '#a855f7', popular: true  },
  { key: 'growth',     icon: Rocket,    credits: 2000, color: '#f59e0b', popular: false },
  { key: 'enterprise', icon: Building2, credits: 5000, color: '#22d3a0', popular: false },
];

interface PurchaseModalProps {
  onClose: () => void;
  dict?: any;
}

export function PurchaseModal({ onClose, dict }: PurchaseModalProps) {
  const params = useParams();
  const lang = (params?.lang as string) || 'ko';
  const [paying, setPaying] = useState<string | null>(null);

  const t = dict?.pricing || {
    popular: '인기',
    per_month: '/월',
    credits_label: '크레딧/월',
    per_image: '장당',
    buy: '구독 시작하기',
    price_starter:    '$3.99',
    price_lite:       '$8.99',
    price_business: '$12.99',
    price_enterprise: '$59.99',
    price_growth:     '$29.99',
    per_image_starter:    '$0.040',
    per_image_lite:       '$0.030',
    per_image_business: '$0.026',
    starter_name:    'Starter',
    lite_name:       'Lite',
    business_name:   'Business',
    growth_name:     'Growth',
    enterprise_name: 'Enterprise',
    starter_features:    ['월 100 크레딧', '고해상도 다운로드'],
    lite_features:       ['월 300 크레딧', '고해상도 다운로드'],
    business_features:   ['월 500 크레딧', '고해상도 다운로드', '일괄 처리'],
    growth_features:     ['월 2,000 크레딧', '고해상도 다운로드', '일괄 처리'],
    enterprise_features: ['월 5,000 크레딧', '일괄 처리', '우선 지원'],
    modal_title: '크레딧이 부족합니다',
    modal_desc: '고해상도 다운로드는 크레딧 1개가 필요합니다. 충전하거나 구독하고 바로 사용하세요.',
    modal_see_all: '전체 요금 안내 보기 →',
  };

  const isKo = lang === 'ko';
  const priceMap: Record<string, string> = isKo
    ? Object.fromEntries(Object.entries(TOSS_KRW_PRICES).map(([k, v]) => [k, formatKrw(v)]))
    : {
        starter:    t.price_starter,
        lite:       t.price_lite,
        business:   t.price_business,
        growth:     t.price_growth,
        enterprise: t.price_enterprise,
      };
  const perImageMap: Record<string, string> = isKo ? {} : {
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

    // 국내(한국어) → 토스페이먼츠 빌링, 그 외 → Gumroad
    if (isKo) {
      setPaying(plan.key);
      try {
        await requestTossBilling(plan.key, user.id, user.email ?? '', lang);
      } catch (err) {
        console.error('[toss] billing error', err);
        alert('결제 창을 열지 못했습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        setPaying(null);
      }
      return;
    }

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
      onClose();
    } catch (err) {
      console.error('[GR] checkout error', err);
      alert('결제 창을 열지 못했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setPaying(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
          style={{ background: 'var(--bg-raised)', color: 'var(--text-muted)' }}
        >
          <X size={16} />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            {t.modal_title}
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {t.modal_desc}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const planName: string = t[`${plan.key}_name`] || plan.key;
            const features: string[] = t[`${plan.key}_features`] || [];
            const price = priceMap[plan.key] || '';
            const perImg = perImageMap[plan.key];

            return (
              <div
                key={plan.key}
                className="relative rounded-2xl p-4"
                style={{
                  background: plan.popular ? 'rgba(168,85,247,0.08)' : 'var(--bg-base)',
                  border: `1px solid ${plan.popular ? 'rgba(168,85,247,0.4)' : 'var(--bg-border)'}`,
                }}
              >
                {plan.popular && (
                  <div
                    className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-0.5 rounded-full text-white"
                    style={{ background: 'var(--accent-gradient)' }}
                  >
                    {t.popular}
                  </div>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${plan.color}22` }}>
                    <Icon size={16} style={{ color: plan.color }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{planName}</p>
                    {perImg && <p className="text-[10px]" style={{ color: plan.color }}>{t.per_image} {perImg}</p>}
                  </div>
                </div>

                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{price}</p>
                <p className="text-[10px] mb-3" style={{ color: 'var(--text-muted)' }}>{t.per_month}</p>

                <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                  {plan.credits.toLocaleString()} {t.credits_label}
                </p>

                <ul className="space-y-1 mb-4">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      <Check size={11} style={{ color: plan.color, flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePurchase(plan)}
                  disabled={paying !== null}
                  className="w-full py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={
                    plan.popular
                      ? { background: 'var(--accent-gradient)', color: '#fff' }
                      : { background: `${plan.color}33`, color: plan.color, border: `1px solid ${plan.color}44` }
                  }
                >
                  {paying === plan.key ? '처리 중...' : t.buy}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-4 text-center">
          <Link href={`/${lang}/pricing`} onClick={onClose} className="text-xs underline" style={{ color: 'var(--text-muted)' }}>
            {t.modal_see_all}
          </Link>
        </div>
      </div>
    </div>
  );
}
