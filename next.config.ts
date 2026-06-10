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
        source: '/bgremoval-cdn/:path*',
        destination: 'https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/:path*',
      },
      {
        // worker가 현재 페이지 경로(/ko/ 등)를 기준으로 상대경로 해석하는 경우
        source: '/:lang/bgremoval-cdn/:path*',
        destination: 'https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/editor(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
      {
        source: "/:lang/batch(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
    ];
  },
};

export default nextConfig;
