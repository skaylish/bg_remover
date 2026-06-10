// imgly 모델 파일 프록시 — staticimgly.com CDN 한국 차단 우회
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

  // arrayBuffer()는 Content-Encoding(gzip/br)을 반드시 해제하므로
  // 압축 바이트가 그대로 전달돼 크기 검증이 실패하던 문제를 방지.
  // 청크는 최대 4MB라 버퍼링 안전.
  const buf = await res.arrayBuffer();

  return new Response(buf, {
    status: 200,
    headers: {
      'Content-Type': res.headers.get('Content-Type') ?? 'application/octet-stream',
      'Content-Length': String(buf.byteLength),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    },
  });
}
