// LemonSqueezy 체크아웃 URL을 서버에서 생성하는 API
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { variantId } = await request.json();
  if (!variantId) return NextResponse.json({ error: 'variantId required' }, { status: 400 });

  // 환경변수 누락 체크
  if (!process.env.LEMONSQUEEZY_API_KEY) {
    console.error('[LS checkout] LEMONSQUEEZY_API_KEY not set');
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }
  if (!process.env.LEMONSQUEEZY_STORE_ID) {
    console.error('[LS checkout] LEMONSQUEEZY_STORE_ID not set');
    return NextResponse.json({ error: 'Store ID not configured' }, { status: 500 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = {
    data: {
      type: 'checkouts',
      attributes: {
        checkout_options: {
          embed: true,          // 오버레이 모드
          media: false,
          logo: true,
        },
        checkout_data: {
          email: user.email,
          custom: { userId: user.id },
        },
        product_options: {
          redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bgremoverpics.lemonsqueezy.com'}/editor?payment=success`,
        },
      },
      relationships: {
        store: {
          data: { type: 'stores', id: String(process.env.LEMONSQUEEZY_STORE_ID) },
        },
        variant: {
          data: { type: 'variants', id: String(variantId) },
        },
      },
    },
  };

  const res = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();

  if (!res.ok) {
    // LS 에러 상세를 로그 + 응답에 포함 (디버깅용)
    const detail = JSON.stringify(json?.errors ?? json);
    console.error('[LS checkout] status:', res.status, 'body:', detail);
    return NextResponse.json(
      { error: `LS API error ${res.status}`, detail },
      { status: 500 },
    );
  }

  const url: string = json.data?.attributes?.url;
  if (!url) {
    console.error('[LS checkout] No URL in response:', JSON.stringify(json));
    return NextResponse.json({ error: 'No checkout URL returned' }, { status: 500 });
  }

  return NextResponse.json({ url });
}
