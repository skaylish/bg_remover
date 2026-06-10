// 사용자의 LemonSqueezy 고객 포털 URL을 반환하는 엔드포인트
import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const service = createServiceClient();

  // 1. DB에 LS subscription ID가 저장된 경우 직접 조회
  const { data: sub } = await service
    .from('subscriptions')
    .select('lemonsqueezy_subscription_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (sub?.lemonsqueezy_subscription_id) {
    const res = await fetch(
      `https://api.lemonsqueezy.com/v1/subscriptions/${sub.lemonsqueezy_subscription_id}`,
      { headers: { Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}` } },
    );
    if (res.ok) {
      const json = await res.json();
      const url: string | undefined = json.data?.attributes?.urls?.customer_portal;
      if (url) return NextResponse.json({ url });
    }
  }

  // 2. fallback: LS API에서 이메일로 활성 구독 검색
  const email = user.email ?? '';
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  const emailFilter = `filter[user_email]=${encodeURIComponent(email)}`;
  const storeFilter = storeId ? `&filter[store_id]=${storeId}` : '';
  const lsRes = await fetch(
    `https://api.lemonsqueezy.com/v1/subscriptions?${emailFilter}${storeFilter}`,
    { headers: { Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}` } },
  );

  if (!lsRes.ok) {
    console.error('[portal] LS subscriptions fetch failed:', lsRes.status, await lsRes.text());
    return NextResponse.json({ error: 'No active subscription' }, { status: 404 });
  }

  const lsJson = await lsRes.json();
  const activeSub = (lsJson.data ?? []).find(
    (s: any) => ['active', 'on_trial'].includes(s.attributes?.status ?? ''),
  );

  if (!activeSub) {
    console.error('[portal] no active LS subscription for email:', email);
    return NextResponse.json({ error: 'No active subscription' }, { status: 404 });
  }

  // 향후 직접 조회를 위해 LS subscription ID를 DB에 저장
  if (!sub?.lemonsqueezy_subscription_id) {
    await service
      .from('subscriptions')
      .update({ lemonsqueezy_subscription_id: String(activeSub.id) })
      .eq('user_id', user.id)
      .eq('status', 'active');
  }

  const portalUrl: string | undefined = activeSub.attributes?.urls?.customer_portal;
  if (!portalUrl) {
    return NextResponse.json({ error: 'No active subscription' }, { status: 404 });
  }

  return NextResponse.json({ url: portalUrl });
}
