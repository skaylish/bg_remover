'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Scissors, Coins, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { useCreditStore } from '@/store/creditStore';
import { createClient } from '@/lib/supabase/client';
import { AuthModal } from './AuthModal';
import type { User } from '@supabase/supabase-js';

const LOCALES = ['en', 'ko', 'ja', 'es', 'id'];

function extractLang(pathname: string, fallback: string): string {
  const segment = pathname.split('/')[1];
  return LOCALES.includes(segment) ? segment : fallback;
}

export function Navbar({ lang: langProp = 'ko', dict }: { lang?: string; dict?: any }) {
  const pathname = usePathname();
  const router = useRouter();
  const lang = extractLang(pathname, langProp);
  const credits = useCreditStore((s) => s.credits);
  const unlimited = useCreditStore((s) => s.unlimited);
  const syncFromDB = useCreditStore((s) => s.syncFromDB);

  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const t = dict?.navbar || {
    individual: '개별 편집',
    batch: '일괄 편집',
    pricing: '요금제',
    login: '로그인',
    start_free: '무료 시작',
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

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  };

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
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--accent-gradient)' }}
          >
            <Scissors size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            BG<span className="gradient-text">Remover</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== `/${lang}` && pathname.startsWith(item.href));
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

        <div className="flex items-center gap-3">
          {/* Credit badge */}
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

          {user ? (
            <div className="flex items-center gap-2">
              {user.user_metadata?.avatar_url ? (
                <Image
                  src={user.user_metadata.avatar_url}
                  alt="profile"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: 'var(--accent-gradient)' }}
                >
                  {(user.email ?? 'U')[0].toUpperCase()}
                </div>
              )}
              <button
                onClick={handleSignOut}
                className="p-1.5 rounded-lg transition-all"
                style={{ color: 'var(--text-muted)' }}
                title="로그아웃"
              >
                <LogOut size={15} />
              </button>
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
    </>
  );
}
