'use client';

import { useRouter, usePathname } from 'next/navigation';

export function LanguageSwitcher({ currentLang }: { currentLang: string }) {
  const router = useRouter();
  const pathname = usePathname(); // e.g., "/ko" or "/ko/batch"

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    if (!pathname) return;
    
    // Replace the language segment in the pathname
    const segments = pathname.split('/');
    if (segments.length > 1) {
      segments[1] = newLang; // Assuming standard format like /ko/...
    }
    router.push(segments.join('/') || '/');
  };

  return (
    <div className="relative inline-block">
      <select
        value={currentLang || 'en'}
        onChange={handleChange}
        className="appearance-none bg-transparent text-sm font-medium focus:outline-none cursor-pointer pl-2 pr-6 py-1 rounded"
        style={{
          color: 'var(--text-primary)',
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.05)'
        }}
      >
        <option value="ko" style={{ color: 'black' }}>🇰🇷 한국어</option>
        <option value="en" style={{ color: 'black' }}>🇺🇸 English</option>
        <option value="ja" style={{ color: 'black' }}>🇯🇵 日本語</option>
        <option value="es" style={{ color: 'black' }}>🇪🇸 Español</option>
        <option value="id" style={{ color: 'black' }}>🇮🇩 B.Indo</option>
      </select>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-xs" style={{ color: 'var(--text-muted)' }}>
        ▼
      </div>
    </div>
  );
}
