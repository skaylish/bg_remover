// Gumroad 체크아웃 URL을 생성해 반환하는 API
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const PRODUCT_IDS: Record<string, string> = {
  starter:    process.env.NEXT_PUBLIC_GR_PRODUCT_STARTER    ?? '',
  lite:       process.env.NEXT_PUBLIC_GR_PRODUCT_LITE       ?? '',
  business:   process.env.NEXT_PUBLIC_GR_PRODUCT_BUSINESS   ?? '',
  growth:     process.env.NEXT_PUBLIC_GR_PRODUCT_GROWTH     ?? '',
  enterprise: process.env.NEXT_PUBLIC_GR_PRODUCT_ENTERPRISE ?? '',
};

export async function POST(request: Request) {
  const { plan } = await request.json();
  if (!plan) return NextResponse.json({ error: 'plan required' }, { status: 400 });

  const productId = PRODUCT_IDS[plan];
  if (!productId) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const username = process.env.NEXT_PUBLIC_GUMROAD_USERNAME ?? '';
  const email = encodeURIComponent(user.email ?? '');
  const url = `https://${username}.gumroad.com/l/${productId}?email=${email}`;

  return NextResponse.json({ url });
}
