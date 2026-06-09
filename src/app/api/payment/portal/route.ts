// 사용자의 LemonSqueezy 고객 포털 URL을 반환하는 엔드포인트
import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const service = createServiceClient();
  const { data: sub } = await service
    .from('subscriptions')
    .select('lemonsqueezy_subscription_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!sub?.lemonsqueezy_subscription_id) {
    return NextResponse.json({ error: 'No active subscription' }, { status: 404 });
  }

  const res = await fetch(
    `https://api.lemonsqueezy.com/v1/subscriptions/${sub.lemonsqueezy_subscription_id}`,
    { headers: { Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}` } },
  );

  if (!res.ok) return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });

  const json = await res.json();
  const portalUrl: string | undefined = json.data?.attributes?.urls?.customer_portal;

  if (!portalUrl) return NextResponse.json({ error: 'Portal URL not available' }, { status: 500 });

  return NextResponse.json({ url: portalUrl });
}
