// HuggingFace 모델 파일 프록시 — 지역 차단 우회 (Node 스트리밍)
export const runtime = 'nodejs';
export const maxDuration = 60;

const UPSTREAM_BASE = 'https://huggingface.co';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const path = (await params).path.join('/');
  const search = new URL(request.url).search;
  const upstream = `${UPSTREAM_BASE}/${path}${search}`;

  // LFS 대용량 파일은 cdn-lfs로 리다이렉트됨 → follow
  const res = await fetch(upstream, { redirect: 'follow' });
  if (!res.ok || !res.body) {
    return new Response(null, { status: res.status || 502 });
  }

  const headers = new Headers();
  headers.set('Content-Type', res.headers.get('Content-Type') ?? 'application/octet-stream');
  const len = res.headers.get('Content-Length');
  if (len) headers.set('Content-Length', len);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Cross-Origin-Resource-Policy', 'cross-origin');

  return new Response(res.body, { status: 200, headers });
}
