import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
    ],
  },
  // COOP/COEP는 proxy.ts에서, 모델 캐싱은 /api/hf 라우트 응답 헤더에서 처리
};

export default nextConfig;
