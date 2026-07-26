import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'ko', 'ja', 'es', 'id'];
const defaultLocale = 'ko';

function getLocale(request: NextRequest): string {
  const acceptLang = request.headers.get('accept-language');
  if (!acceptLang) return defaultLocale;

  const preferred = acceptLang
    .split(',')
    .map((part) => {
      const [tag] = part.trim().split(';');
      return tag.trim().split('-')[0].toLowerCase();
    });

  for (const lang of preferred) {
    if (locales.includes(lang)) return lang;
  }
  return defaultLocale;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // www → apex 308 영구 리디렉션 (중복 도메인 색인 방지). Supabase 조회 전에 처리해 왕복 낭비 차단.
  const host = request.headers.get('host') ?? '';
  if (host.startsWith('www.')) {
    const apex = `https://${host.slice(4)}`;
    return NextResponse.redirect(new URL(pathname + request.nextUrl.search, apex), 308);
  }

  // Supabase 세션 갱신
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );
  await supabase.auth.getUser();

  // 로케일 리디렉션 (api/정적 경로는 제외)
  if (
    pathname.includes('.') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next')
  ) {
    return response;
  }

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    // 배치·에디터 경로: crossOriginIsolated 활성화 (멀티스레드 WASM)
    if (/\/(batch|editor)(\/|$)/.test(pathname)) {
      response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
      response.headers.set('Cross-Origin-Embedder-Policy', 'credentialless');
    }
    return response;
  }

  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
