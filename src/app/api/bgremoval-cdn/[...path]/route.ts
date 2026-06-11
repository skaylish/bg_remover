// imgly 모델 파일 프록시 — staticimgly.com CDN 한국 차단 우회
// Node 런타임 스트리밍: 버퍼링 없이 전달해 Edge 타임아웃(504) 회피
export const runtime = 'nodejs';
export const maxDuration = 60;

const UPSTREAM_BASE = 'https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const path = (await params).path.join('/');
  const upstream = `${UPSTREAM_BASE}/${path}`;

  const res = await fetch(upstream);
  if (!res.ok || !res.body) {
    return new Response(null, { status: res.status || 502 });
  }

  const headers = new Headers();
  headers.set('Content-Type', res.headers.get('Content-Type') ?? 'application/octet-stream');
  // upstream은 항상 비압축 Content-Length를 제공 — 그대로 전달해 클라이언트가 완전성 검증
  const len = res.headers.get('Content-Length');
  if (len) headers.set('Content-Length', len);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Cross-Origin-Resource-Policy', 'cross-origin');

  // 스트리밍 전달 (버퍼링 없음)
  return new Response(res.body, { status: 200, headers });
}
