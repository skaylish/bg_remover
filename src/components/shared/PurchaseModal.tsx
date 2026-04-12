'use client';

import { X, Zap, Star, Building2, Check, Infinity, Package } from 'lucide-react';
import { useCreditStore } from '@/store/creditStore';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const APP_ID = process.env.NEXT_PUBLIC_BOOTPAY_APPLICATION_ID!;

const PLAN_AMOUNTS: Record<string, number> = {
  topup: 9900,
  starter: 4900,
  pro: 19900,
  enterprise: 99000,
};

const PLANS = [
  { key: 'topup',      icon: Package,   credits: 100, unlimited: false, color: '#f59e0b', popular: false, oneTime: true,  promo: false },
  { key: 'starter',    icon: Zap,       credits: 100, unlimited: false, color: '#6366f1', popular: false, oneTime: false, promo: true  },
  { key: 'pro',        icon: Star,      credits: 500, unlimited: false, color: '#a855f7', popular: true,  oneTime: false, promo: true  },
  { key: 'enterprise', icon: Building2, credits: 0,   unlimited: true,  color: '#22d3a0', popular: false, oneTime: false, promo: false },
];

interface PurchaseModalProps {
  onClose: () => void;
  dict?: any;
}

export function PurchaseModal({ onClose, dict }: PurchaseModalProps) {
  const addCredits   = useCreditStore((s) => s.addCredits);
  const setUnlimited = useCreditStore((s) => s.setUnlimited);
  const params = useParams();
  const lang = (params?.lang as string) || 'ko';
  const [paying, setPaying] = useState<string | null>(null);

  const t = dict?.pricing || {
    popular: '인기',
    per_month: '/30일',
    one_time_label: '1회 충전',
    credits_label: '크레딧/월',
    credits_once: '크레딧',
    unlimited_label: '무제한 생성',
    per_image: '장당',
    buy: '구독 시작하기',
    buy_topup: '충전하기',
    topup_name: '1회 충전',
    topup_features: ['100 크레딧 즉시 지급', '고해상도 다운로드', '저해상도 무제한 무료'],
    price_topup: '₩9,900',
    price_starter: '₩4,900',
    price_pro: '₩19,900',
    price_enterprise: '₩99,000',
    per_image_topup: '₩99',
    per_image_starter: '₩49',
    per_image_pro: '₩39',
    starter_name: '스타터',
    pro_name: '비즈니스',
    enterprise_name: '엔터프라이즈',
    starter_features: ['월 100 크레딧', '고해상도 다운로드'],
    pro_features: ['월 500 크레딧', '고해상도 다운로드', '일괄 처리'],
    enterprise_features: ['월 무제한 생성', '저해상도 무제한', '일괄 처리', '우선 지원'],
    alert_topup: '충전 완료! 100 크레딧이 추가되었습니다.',
    alert_starter: '스타터 구독 완료! 100 크레딧이 추가되었습니다.',
    alert_pro: '비즈니스 구독 완료! 500 크레딧이 추가되었습니다.',
    alert_enterprise: '엔터프라이즈 구독 완료! 이제 무제한으로 생성하실 수 있습니다.',
    modal_title: '크레딧이 부족합니다',
    modal_desc: '고해상도 다운로드는 크레딧 1개가 필요합니다. 충전하거나 구독하고 바로 사용하세요.',
    modal_see_all: '전체 요금 안내 보기 →',
    promo_banner: '🔥 한시적 프로모션 — 구독 시 첫 달 무료!',
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
  const PLAN_NAMES: Record<string, string> = {
    topup: t.topup_name || '1회 충전 (100 크레딧)',
    starter: t.starter_name || '스타터 구독',
    pro: t.pro_name || '비즈니스 구독',
    enterprise: t.enterprise_name || '엔터프라이즈 구독',
  };

  const handlePurchase = async (plan: typeof PLANS[number]) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert('로그인이 필요합니다.'); return; }

    setPaying(plan.key);
    try {
      // 1. 고유 주문번호 생성
      const orderId = `bgr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      // 2. 부트페이 결제창 호출 (dynamic import — SSR 안전)
      const { default: Bootpay } = await import('@bootpay/client-js');

      const currentUrl = window.location.origin + window.location.pathname;
      const response = await Bootpay.requestPayment({
        application_id: APP_ID,
        order_id: orderId,
        order_name: PLAN_NAMES[plan.key],
        price: PLAN_AMOUNTS[plan.key],
        currency: 'KRW',
        user: { email: user.email ?? '' },
        redirect_url: currentUrl,
        extra: {
          redirect_url: currentUrl,
        },
      });

      const receiptId: string = (response as any)?.receipt_id ?? (response as any)?.data?.receipt_id;
      if (!receiptId) throw new Error('영수증 ID를 받지 못했습니다.');

      // 3. 서버 검증 및 크레딧 지급
      const completeRes = await fetch('/api/payment/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiptId, plan: plan.key, orderId }),
      });
      if (!completeRes.ok) {
        const e = await completeRes.json();
        throw new Error(e.error || '결제 처리 실패');
      }

      // 4. 로컬 상태 업데이트
      if (plan.unlimited) {
        setUnlimited(true);
        alert(t.alert_enterprise);
      } else {
        addCredits(plan.credits);
        if (plan.key === 'topup') alert(t.alert_topup);
        else if (plan.key === 'starter') alert(t.alert_starter);
        else alert(t.alert_pro);
      }
      onClose();
    } catch (err: unknown) {
      // 부트페이는 취소/에러 시 plain object로 reject
      console.error('[Bootpay] error object:', JSON.stringify(err));
      const errObj = err as any;
      const event: string = errObj?.event ?? errObj?.data?.event ?? '';
      if (event === 'cancel' || event === 'close') return; // 사용자 취소 — 무시
      const msg: string =
        errObj?.message ??
        errObj?.data?.message ??
        errObj?.error_message ??
        (err instanceof Error ? err.message : null) ??
        '결제 처리 중 오류가 발생했습니다.';
      if (msg) alert(msg);
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

        <div className="text-center mb-4">
          <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            {t.modal_title}
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {t.modal_desc}
          </p>
        </div>

        <div
          className="rounded-xl px-4 py-2.5 mb-4 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(245,158,11,0.12) 100%)',
            border: '1px solid rgba(239,68,68,0.35)',
          }}
        >
          <p className="text-xs font-bold" style={{ color: '#fca5a5' }}>
            {t.promo_banner}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                  background: plan.promo ? 'rgba(239,68,68,0.06)' : plan.popular ? 'rgba(168,85,247,0.08)' : 'var(--bg-base)',
                  border: `1px solid ${plan.promo ? 'rgba(239,68,68,0.4)' : plan.popular ? 'rgba(168,85,247,0.4)' : 'var(--bg-border)'}`,
                }}
              >
                {plan.promo && (
                  <div
                    className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-0.5 rounded-full text-white whitespace-nowrap"
                    style={{ background: 'linear-gradient(90deg, #ef4444, #f97316)' }}
                  >
                    🎁 {t.first_month_free}
                  </div>
                )}
                {!plan.promo && plan.popular && (
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

                {plan.promo ? (
                  <div className="mb-3">
                    <span className="text-sm font-bold line-through" style={{ color: 'var(--text-subtle, #555)' }}>{price}</span>
                    <span className="text-[10px] ml-1" style={{ color: 'var(--text-muted)' }}>{t.per_month}</span>
                    <div className="text-base font-black mt-0.5" style={{ color: '#f87171' }}>
                      {t.first_month_free} 🎉
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{price}</p>
                    <p className="text-[10px] mb-3" style={{ color: 'var(--text-muted)' }}>
                      {plan.oneTime ? t.one_time_label : t.per_month}
                    </p>
                  </>
                )}

                {plan.unlimited ? (
                  <p className="flex items-center gap-1 text-xs font-semibold mb-3" style={{ color: plan.color }}>
                    <Infinity size={13} /> {t.unlimited_label}
                  </p>
                ) : (
                  <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                    {plan.credits.toLocaleString()} {plan.oneTime ? t.credits_once : t.credits_label}
                  </p>
                )}

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
                    plan.promo
                      ? { background: 'linear-gradient(90deg, #ef4444, #f97316)', color: '#fff' }
                      : plan.popular
                        ? { background: 'var(--accent-gradient)', color: '#fff' }
                        : { background: `${plan.color}33`, color: plan.color, border: `1px solid ${plan.color}44` }
                  }
                >
                  {paying === plan.key
                    ? '처리 중...'
                    : plan.promo
                      ? (t.buy_promo || '첫달 무료로 시작')
                      : plan.oneTime
                        ? (t.buy_topup || '충전하기')
                        : t.buy.split(' ')[0]}
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
