'use client';

import { X, Gift, Coins, Monitor } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { usePathname } from 'next/navigation';

interface AuthModalProps {
  onClose: () => void;
}

export function AuthModal({ onClose }: AuthModalProps) {
  const pathname = usePathname();

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/api/auth/callback?next=${encodeURIComponent(pathname)}`,
      },
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl p-8"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--bg-raised)', color: 'var(--text-muted)' }}
        >
          <X size={16} />
        </button>

        {/* 신규 가입 혜택 배너 */}
        <div
          className="rounded-2xl p-4 mb-6 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.15) 100%)',
            border: '1px solid rgba(99,102,241,0.35)',
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Gift size={18} style={{ color: '#a78bfa' }} />
            <span className="text-sm font-bold" style={{ color: '#c4b5fd' }}>
              신규 회원 가입 혜택
            </span>
          </div>
          <p className="text-2xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>
            10 크레딧 <span style={{ color: '#818cf8' }}>무료 지급</span>
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            고해상도 다운로드 10장을 바로 사용하세요
          </p>
        </div>

        <div className="text-center mb-5">
          <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            로그인 / 회원가입
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Google 계정으로 1초만에 시작하세요
          </p>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-semibold text-sm transition-all hover:opacity-90 mb-5"
          style={{ background: '#fff', color: '#1a1a1a', border: '1px solid #e5e7eb' }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Google로 계속하기
        </button>

        {/* 부가 혜택 목록 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Coins size={13} style={{ color: '#818cf8', flexShrink: 0 }} />
            <span>구독 시 <strong style={{ color: 'var(--text-primary)' }}>첫 달 이용료 무료</strong> — 한시적 프로모션</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Monitor size={13} style={{ color: '#818cf8', flexShrink: 0 }} />
            <span>모든 기기에서 크레딧 동기화</span>
          </div>
        </div>
      </div>
    </div>
  );
}
