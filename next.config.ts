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
        // 모델 프록시 → Edge 라우트 (proxy.ts에서 /bgmodel 리다이렉트 제외 처리)
        source: '/bgmodel/:path*',
        destination: '/api/bgremoval-cdn/:path*',
      },
    ];
  },
  async headers() {
    // COOP/COEP는 proxy.ts에서 처리
    const cacheHeaders = [
      { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
    ];
    return [
      // 모델 파일 영구 캐싱
      { source: "/bgmodel/:path*", headers: cacheHeaders },
    ];
  },
};

export default nextConfig;
