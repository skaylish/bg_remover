// LemonSqueezy 체크아웃 URL을 서버에서 생성하는 API
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { variantId } = await request.json();
  if (!variantId) return NextResponse.json({ error: 'variantId required' }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const res = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email: user.email,
            custom: { userId: user.id },
          },
          product_options: {
            redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL}/editor?payment=success`,
            enabled_variants: [Number(variantId)],
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
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('[LS checkout]', res.status, err);
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }

  const json = await res.json();
  const url: string = json.data?.attributes?.url;
  if (!url) return NextResponse.json({ error: 'No checkout URL returned' }, { status: 500 });

  return NextResponse.json({ url });
}
