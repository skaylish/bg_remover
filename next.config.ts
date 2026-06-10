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
        // 루트에서 직접 요청
        source: '/bgremoval-cdn/:path*',
        destination: 'https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/:path*',
      },
      {
        // worker가 페이지 경로 기준으로 상대경로 해석하는 경우 (임의 depth 처리)
        source: '/(.*)/bgremoval-cdn/:path*',
        destination: 'https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/:path*',
      },
    ];
  },
  async headers() {
    const coepHeaders = [
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
      { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
    ];
    const cacheHeaders = [
      { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
    ];
    return [
      // 에디터·배치 페이지: COOP/COEP로 SharedArrayBuffer 활성화 (멀티스레드)
      { source: "/editor(.*)",         headers: coepHeaders },
      { source: "/:lang/editor(.*)",   headers: coepHeaders },
      { source: "/:lang/batch(.*)",    headers: coepHeaders },
      // 프록시 경로: 모델 파일 영구 캐싱
      { source: "/bgremoval-cdn/:path*",        headers: cacheHeaders },
      { source: "/(.*)/bgremoval-cdn/:path*",   headers: cacheHeaders },
    ];
  },
};

export default nextConfig;
