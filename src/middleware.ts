// 배치·에디터 경로에 COOP/COEP 헤더를 적용해 crossOriginIsolated 활성화 (멀티스레드 WASM)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const { pathname } = request.nextUrl;
  // /<lang>/batch, /<lang>/editor 및 그 하위 경로
  if (/\/(batch|editor)(\/|$)/.test(pathname)) {
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    response.headers.set('Cross-Origin-Embedder-Policy', 'credentialless');
  }

  return response;
}

export const config = {
  // 정적 에셋(_next/static, 이미지 등) 제외한 모든 경로에서 실행
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
