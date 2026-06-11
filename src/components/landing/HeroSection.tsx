'use client';

import { UploadZone } from './UploadZone';
import { BeforeAfter } from './BeforeAfter';
import { ArrowDown, Coins, Crown, ShieldCheck, Sparkles, Gift } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCreditStore } from '@/store/creditStore';
import { createClient } from '@/lib/supabase/client';

export function HeroSection({ dict }: { dict?: any }) {
  const params = useParams();
  const lang = (params?.lang as string) || 'ko';

  const credits = useCreditStore((s) => s.credits);
  const unlimited = useCreditStore((s) => s.unlimited);
  const plan = useCreditStore((s) => s.plan);
  const syncFromDB = useCreditStore((s) => s.syncFromDB);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setIsLoggedIn(true);
        syncFromDB();
      }
    });
  }, [syncFromDB]);

  const t = dict?.hero || {
    headline_1: 'Backgrounds ',
    headline_2: 'Reimagined.',
    description: 'Experience the next evolution of AI-driven synthesis. Precise edge detection meets cinematic background replacement in a single click.',
    badge_cheapest: '🏆 업계 최저가 ₩19/장~',
    badge_carryover: '💳 1회 충전 가능',
    badge_free_lowres: '✓ 저해상도 무제한 무료',
    promo_signup_label: '🎁 신규 가입 혜택',
    promo_signup_credits: '10 크레딧 무료 지급',
    promo_signup_desc: '고해상도 다운로드 10장을 바로 사용하세요',
    value_local_title: '서버 저장 없는 100% 로컬 처리',
    value_local_desc: '업로드한 이미지가 서버에 저장·전송되지 않고 내 브라우저에서만 처리됩니다.',
    value_cost_title: 'AI로 획기적인 비용 절감',
    value_cost_desc: '전문 편집·유료 툴 대비 비용을 대폭 줄이세요.',
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-start px-6 pt-24 pb-16 overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute top-[5%] left-1/2 -translate-x-1/2 rounded-full pointer-events-none fade-in"
        style={{
          width: '800px',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(170,138,255,0.15) 0%, transparent 60%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">
        {/* 로그인 유저 상태 바 */}
        {isLoggedIn && (
          <Link
            href={`/${lang}/pricing`}
            className="flex items-center gap-3 mb-6 px-4 py-2 rounded-full fade-in transition-opacity hover:opacity-80"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              animationDelay: '0.05s',
            }}
          >
            {plan ? (
              <span className="flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(170,138,255,0.2)', color: '#aa8aff' }}>
                <Crown size={11} />
                {dict?.pricing?.[`${plan}_name`] ?? plan.charAt(0).toUpperCase() + plan.slice(1)}
              </span>
            ) : (
              <span className="text-xs font-semibold" style={{ color: 'var(--text-subtle)' }}>
                {dict?.pricing?.free_badge ?? 'Free'}
              </span>
            )}
            <span className="h-3 w-px" style={{ background: 'rgba(255,255,255,0.15)' }} />
            <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
              <Coins size={13} style={{ color: '#a78bfa' }} />
              {unlimited ? '∞' : credits.toLocaleString()}
              <span style={{ color: 'var(--text-subtle)', fontWeight: 400 }}>
                {' '}{dict?.pricing?.credits_once ?? 'credits'}
              </span>
            </span>
          </Link>
        )}

        {/* Headline */}
        <h1
          className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight text-center tracking-tight fade-in pt-8"
          style={{ animationDelay: '0.1s', letterSpacing: '-0.02em' }}
        >
          <span style={{ color: 'var(--text-primary)' }}>{t.headline_1}</span>
          <br className="md:hidden" />
          <span
            className="gradient-text"
            style={{ background: 'linear-gradient(90deg, #aa8aff, #a0fff0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            {t.headline_2}
          </span>
        </h1>

        <p
          className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-center font-light fade-in"
          style={{ color: '#a3a3a3', animationDelay: '0.2s', wordBreak: 'keep-all' }}
        >
          {t.description}
        </p>

        {/* ─── 신규 가입 혜택 + 핵심 가치 (한 줄) ─── */}
        <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 fade-in" style={{ animationDelay: '0.22s' }}>
          {/* 신규 가입 10크레딧 — 인디고/바이올렛 */}
          <div
            className="relative rounded-2xl p-5 flex items-center gap-3 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.40) 0%, rgba(168,85,247,0.34) 100%)', border: '1px solid rgba(129,140,248,0.7)' }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(129,140,248,0.45)' }}>
              <Gift size={26} style={{ color: '#fff' }} />
            </div>
            <span className="text-lg md:text-xl font-extrabold leading-tight text-left" style={{ color: '#fff' }}>{t.promo_signup_credits}</span>
          </div>
          {/* 로컬 처리 / 프라이버시 — 에메랄드 */}
          <div
            className="relative rounded-2xl p-5 flex items-center gap-3 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.42) 0%, rgba(5,150,105,0.34) 100%)', border: '1px solid rgba(34,211,160,0.7)' }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(34,211,160,0.4)' }}>
              <ShieldCheck size={26} style={{ color: '#fff' }} />
            </div>
            <span className="text-lg md:text-xl font-extrabold leading-tight text-left" style={{ color: '#fff' }}>{t.value_local_title}</span>
          </div>
          {/* AI 비용 절감 — 앰버/골드 */}
          <div
            className="relative rounded-2xl p-5 flex items-center gap-3 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.42) 0%, rgba(234,88,12,0.34) 100%)', border: '1px solid rgba(245,158,11,0.7)' }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(245,158,11,0.42)' }}>
              <Sparkles size={26} style={{ color: '#fff' }} />
            </div>
            <span className="text-lg md:text-xl font-extrabold leading-tight text-left" style={{ color: '#fff' }}>{t.value_cost_title}</span>
          </div>
        </div>

        {/* 작은 신뢰 배지 */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 fade-in" style={{ animationDelay: '0.25s' }}>
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(34,211,160,0.1)', color: '#22d3a0', border: '1px solid rgba(34,211,160,0.25)' }}
          >
            {t.badge_free_lowres}
          </div>
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(99,102,241,0.08)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            {t.badge_carryover}
          </div>
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(34,211,160,0.08)', color: '#22d3a0', border: '1px solid rgba(34,211,160,0.2)' }}
          >
            {t.badge_cheapest}
          </div>
        </div>

        {/* Upload Zone */}
        <div className="w-full max-w-4xl mx-auto mb-16 relative fade-in" style={{ animationDelay: '0.3s' }}>
          <div
            className="absolute inset-0 rounded-[32px] pointer-events-none"
            style={{ boxShadow: '0 0 100px rgba(199,153,255,0.08)', transform: 'scale(0.98)', zIndex: -1 }}
          />
          <div className="glass-card p-2 md:p-3 rounded-[32px] overflow-hidden relative" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <UploadZone dict={dict} />
          </div>
        </div>

        {/* Before/After Demo */}
        <div className="w-full max-w-5xl mx-auto fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center gap-4 justify-center mb-10">
            <div className="h-px flex-1 max-w-[120px]" style={{ background: 'linear-gradient(90deg, transparent, var(--bg-border-hover))' }} />
            <span className="text-sm uppercase tracking-widest font-medium" style={{ color: 'var(--text-subtle)' }}>
              <ArrowDown size={14} className="inline mr-2" />
              WITNESS THE MAGIC
            </span>
            <div className="h-px flex-1 max-w-[120px]" style={{ background: 'linear-gradient(270deg, transparent, var(--bg-border-hover))' }} />
          </div>
          <div className="glass-card p-2 md:p-4 rounded-[32px]">
            <div className="rounded-[24px] overflow-hidden">
              <BeforeAfter beforeSrc="/demo-before.jpg" afterSrc="/demo-after.png" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
