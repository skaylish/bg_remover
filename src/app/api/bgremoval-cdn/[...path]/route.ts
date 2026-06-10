// imgly 모델 파일 스트리밍 프록시 — staticimgly.com CDN 한국 차단 우회
// Edge 런타임: 응답 크기 제한 없이 스트리밍 전달
export const runtime = 'edge';

const UPSTREAM_BASE = 'https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const path = (await params).path.join('/');
  const upstream = `${UPSTREAM_BASE}/${path}`;

  const res = await fetch(upstream);
  if (!res.ok) {
    return new Response(null, { status: res.status });
  }

  return new Response(res.body, {
    status: 200,
    headers: {
      'Content-Type': res.headers.get('Content-Type') ?? 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
