// 배치·에디터 경로에 COOP/COEP 헤더를 적용해 crossOriginIsolated 활성화 (멀티스레드 WASM)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Embedder-Policy', 'credentialless');
  return response;
}

export const config = {
  // /ko/editor, /en/editor, /ko/batch, /en/batch 등 (정확 경로 + 하위 경로 모두)
  matcher: [
    '/:lang/editor',
    '/:lang/editor/:path*',
    '/:lang/batch',
    '/:lang/batch/:path*',
  ],
};
