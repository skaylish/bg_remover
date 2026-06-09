'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Scissors, Coins, LogOut, Settings, ChevronDown, ExternalLink } from 'lucide-react';
import { useEffect, useRef, useState, Suspense } from 'react';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { useCreditStore } from '@/store/creditStore';
import { createClient } from '@/lib/supabase/client';
import { AuthModal } from './AuthModal';
import type { User } from '@supabase/supabase-js';

const LOCALES = ['en', 'ko', 'ja', 'es', 'id'];

const PLAN_META: Record<string, { label: string; color: string }> = {
  starter:    { label: 'Starter',    color: '#6366f1' },
  lite:       { label: 'Lite',       color: '#3b82f6' },
  business:   { label: 'Business',   color: '#a855f7' },
  growth:     { label: 'Growth',     color: '#f59e0b' },
  enterprise: { label: 'Enterprise', color: '#22d3a0' },
};

function extractLang(pathname: string, fallback: string): string {
  const segment = pathname.split('/')[1];
  return LOCALES.includes(segment) ? segment : fallback;
}

// 결제 완료 파라미터 감지 — useSearchParams는 Suspense 경계 필요
function PaymentSuccessSync({ syncFromDB }: { syncFromDB: () => Promise<void> }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams?.get('payment') === 'success') {
      const timer = setTimeout(() => syncFromDB(), 2500);
      return () => clearTimeout(timer);
    }
  }, [searchParams, syncFromDB]);
  return null;
}

export function Navbar({ lang: langProp = 'ko', dict }: { lang?: string; dict?: any }) {
  const pathname = usePathname();
  const router = useRouter();
  const lang = extractLang(pathname, langProp);
  const credits   = useCreditStore((s) => s.credits);
  const unlimited = useCreditStore((s) => s.unlimited);
  const plan      = useCreditStore((s) => s.plan);
  const syncFromDB = useCreditStore((s) => s.syncFromDB);

  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const t = dict?.navbar || {
    individual: '개별 편집',
    batch: '일괄 편집',
    pricing: '요금제',
    login: '로그인',
    start_free: '무료 시작',
    account: '계정',
    manage_subscription: '구독 관리',
    cancel_subscription: '구독 취소',
    logout: '로그아웃',
    credits_remaining: '크레딧 잔여',
    no_plan: '무료',
  };

  const navItems = [
    { label: t.individual, href: `/${lang}` },
    { label: t.batch, href: `/${lang}/batch` },
    { label: t.pricing || '요금제', href: `/${lang}/pricing` },
  ];

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) syncFromDB();
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) syncFromDB();
    });
    return () => subscription.unsubscribe();
  }, [syncFromDB]);


  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setMenuOpen(false);
    router.refresh();
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/payment/portal');
      const { url, error } = await res.json();
      if (url) window.open(url, '_blank');
      else alert(error ?? '구독 정보를 불러오지 못했습니다.');
    } catch {
      alert('구독 정보를 불러오지 못했습니다.');
    } finally {
      setPortalLoading(false);
      setMenuOpen(false);
    }
  };

  const planMeta = plan ? PLAN_META[plan] : null;

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{
          background: 'rgba(10, 10, 15, 0.8)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--bg-border)',
        }}
      >
        <Link href={`/${lang}`} className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-gradient)' }}>
            <Scissors size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            BG<span className="gradient-text">Remover</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== `/${lang}` && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 rounded-lg text-sm transition-all duration-200"
                style={{
                  color: isActive ? 'var(--accent-glow)' : 'var(--text-muted)',
                  background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {/* 플랜 뱃지 */}
          {user && (
            <span
              className="hidden md:inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold"
              style={{
                background: planMeta ? `${planMeta.color}20` : 'var(--bg-raised)',
                color: planMeta ? planMeta.color : 'var(--text-subtle)',
                border: `1px solid ${planMeta ? `${planMeta.color}40` : 'var(--bg-border)'}`,
              }}
            >
              {planMeta ? planMeta.label : t.no_plan}
            </span>
          )}

          {/* 크레딧 뱃지 */}
          <Link
            href={`/${lang}/pricing`}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: (unlimited || credits > 0) ? 'rgba(99,102,241,0.15)' : 'var(--bg-raised)',
              color: (unlimited || credits > 0) ? 'var(--accent-glow)' : 'var(--text-muted)',
              border: `1px solid ${(unlimited || credits > 0) ? 'rgba(99,102,241,0.3)' : 'var(--bg-border)'}`,
            }}
          >
            <Coins size={13} />
            {unlimited ? '∞ 무제한' : credits > 0 ? `${credits.toLocaleString()} 크레딧` : '구독하기'}
          </Link>

          <LanguageSwitcher currentLang={lang} />

          {/* 유저 메뉴 */}
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-1.5 p-1 rounded-xl transition-all"
                style={{ background: menuOpen ? 'rgba(99,102,241,0.12)' : 'transparent' }}
              >
                {user.user_metadata?.avatar_url ? (
                  <Image src={user.user_metadata.avatar_url} alt="profile" width={30} height={30} className="rounded-full" />
                ) : (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: 'var(--accent-gradient)' }}
                  >
                    {(user.email ?? 'U')[0].toUpperCase()}
                  </div>
                )}
                <ChevronDown size={13} style={{ color: 'var(--text-muted)', transform: menuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-2xl py-2 shadow-2xl"
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--bg-border)',
                    top: '100%',
                  }}
                >
                  {/* 유저 정보 */}
                  <div className="px-4 py-2.5 border-b" style={{ borderColor: 'var(--bg-border)' }}>
                    <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {user.email}
                    </p>
                  </div>

                  {/* 구독 정보 */}
                  <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--bg-border)' }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>플랜</span>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: planMeta ? `${planMeta.color}20` : 'var(--bg-raised)',
                          color: planMeta ? planMeta.color : 'var(--text-subtle)',
                        }}
                      >
                        {planMeta ? planMeta.label : '무료'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.credits_remaining}</span>
                      <span className="text-xs font-semibold" style={{ color: 'var(--accent-glow)' }}>
                        {unlimited ? '∞ 무제한' : `${credits.toLocaleString()}개`}
                      </span>
                    </div>
                  </div>

                  {/* 액션 */}
                  <div className="px-2 pt-1">
                    {plan ? (
                      <button
                        onClick={handleManageSubscription}
                        disabled={portalLoading}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all text-left disabled:opacity-50"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-raised)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <Settings size={15} style={{ flexShrink: 0 }} />
                        {portalLoading ? '로딩 중...' : t.manage_subscription}
                        {!portalLoading && <ExternalLink size={11} className="ml-auto opacity-40" />}
                      </button>
                    ) : (
                      <Link
                        href={`/${lang}/pricing`}
                        onClick={() => setMenuOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all"
                        style={{ color: 'var(--accent-glow)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-raised)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <Coins size={15} style={{ flexShrink: 0 }} />
                        구독 시작하기
                      </Link>
                    )}

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all text-left"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      <LogOut size={15} style={{ flexShrink: 0 }} />
                      {t.logout}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2 text-sm font-semibold text-white rounded-lg btn-glow"
            >
              {t.login}
            </button>
          )}
        </div>
      </header>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      <Suspense fallback={null}>
        <PaymentSuccessSync syncFromDB={syncFromDB} />
      </Suspense>
    </>
  );
}
