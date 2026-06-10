import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
    ],
  },
  async rewrites() {
    return [
      {
        // 루트 요청 → Edge 스트리밍 프록시 (응답 크기 제한 없음)
        source: '/bgremoval-cdn/:path*',
        destination: '/api/bgremoval-cdn/:path*',
      },
      {
        // worker가 페이지 경로(/ko/ 등) 기준으로 상대경로 해석하는 경우
        source: '/(.*)/bgremoval-cdn/:path*',
        destination: '/api/bgremoval-cdn/:path*',
      },
    ];
  },
  async headers() {
    // COOP/COEP는 middleware.ts에서 처리 (App Router 동적 경로 매칭 신뢰성)
    const cacheHeaders = [
      { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
    ];
    return [
      // 프록시 경로: 모델 파일 영구 캐싱
      { source: "/bgremoval-cdn/:path*",        headers: cacheHeaders },
      { source: "/(.*)/bgremoval-cdn/:path*",   headers: cacheHeaders },
    ];
  },
};

export default nextConfig;
