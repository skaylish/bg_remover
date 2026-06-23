// Gumroad 웹훅 이벤트 수신 — 구독 생성·갱신·취소 처리
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const PLAN_CREDITS: Record<string, number> = {
  starter:    100,
  lite:       300,
  business:   500,
  growth:     2000,
  enterprise: 5000,
};

// Gumroad 제품 permalink → 플랜명 매핑
const PRODUCT_TO_PLAN: Record<string, string> = {
  [process.env.NEXT_PUBLIC_GR_PRODUCT_STARTER    ?? 'x1']: 'starter',
  [process.env.NEXT_PUBLIC_GR_PRODUCT_LITE       ?? 'x2']: 'lite',
  [process.env.NEXT_PUBLIC_GR_PRODUCT_BUSINESS   ?? 'x3']: 'business',
  [process.env.NEXT_PUBLIC_GR_PRODUCT_GROWTH     ?? 'x4']: 'growth',
  [process.env.NEXT_PUBLIC_GR_PRODUCT_ENTERPRISE ?? 'x5']: 'enterprise',
};

// 이메일로 Supabase 사용자 ID 조회
// TODO: 사용자 수가 많아지면 DB 함수(RPC)로 최적화
async function getUserIdByEmail(service: ReturnType<typeof createServiceClient>, email: string): Promise<string | null> {
  const { data: { users }, error } = await service.auth.admin.listUsers({ page: 1, perPage: 10000 });
  if (error) { console.error('[GR webhook] listUsers error:', error.message); return null; }
  return users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase())?.id ?? null;
}

export async function POST(request: Request) {
  // URL 쿼리 파라미터로 시크릿 검증 (Gumroad는 HMAC 미지원)
  const reqUrl = new URL(request.url);
  const secret = reqUrl.searchParams.get('secret');
  if (!secret || secret !== process.env.GUMROAD_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const text = await request.text();
  const params = new URLSearchParams(text);

  const email         = params.get('email') ?? '';
  const productId     = params.get('short_product_id') ?? params.get('product_id') ?? '';
  const subscriptionId = params.get('subscription_id') ?? '';
  const isRecurring   = params.get('is_recurring_charge') === 'true';
  const cancelledAt   = params.get('cancelled_at');
  const endedAt       = params.get('ended_at');

  console.log(`[GR webhook] email:${email} productId:${productId} subscriptionId:${subscriptionId}`);

  const service = createServiceClient();

  // ── 구독 취소 ─────────────────────────────────────────────────────────────
  if (cancelledAt) {
    const { error } = await service
      .from('subscriptions')
      .update({ status: 'cancelled', cancel_at_period_end: true })
      .eq('lemonsqueezy_subscription_id', subscriptionId);
    if (error) console.error('[GR webhook] cancel error:', error.message);
    console.log('[GR webhook] subscription_cancelled OK');
    return NextResponse.json({ ok: true });
  }

  // ── 구독 만료 ─────────────────────────────────────────────────────────────
  if (endedAt) {
    const { error } = await service
      .from('subscriptions')
      .update({ status: 'expired' })
      .eq('lemonsqueezy_subscription_id', subscriptionId);
    if (error) console.error('[GR webhook] ended error:', error.message);
    console.log('[GR webhook] subscription_ended OK');
    return NextResponse.json({ ok: true });
  }

  // ── 신규 구독 / 월 갱신 결제 (sale 이벤트) ───────────────────────────────
  const plan = PRODUCT_TO_PLAN[productId];
  if (!plan) {
    console.error('[GR webhook] Unknown product:', productId, '— check NEXT_PUBLIC_GR_PRODUCT_* env vars');
    return NextResponse.json({ ok: true });
  }

  const credits = PLAN_CREDITS[plan];

  // 월 갱신 결제
  if (isRecurring) {
    const { data: sub } = await service
      .from('subscriptions')
      .select('id, user_id')
      .eq('lemonsqueezy_subscription_id', subscriptionId)
      .maybeSingle();

    if (!sub) {
      console.error('[GR webhook] renewal: subscription not found for id:', subscriptionId);
      return NextResponse.json({ ok: true });
    }

    await service.from('credits').update({ balance: credits }).eq('user_id', sub.user_id);
    await service.from('subscriptions').update({ plan }).eq('id', sub.id);
    await service.from('credit_transactions').insert({
      user_id: sub.user_id, amount: credits, type: 'monthly_grant',
      description: `${plan} 플랜 월간 크레딧 갱신`,
    });
    console.log(`[GR webhook] renewal OK — plan:${plan} credits:${credits}`);
    return NextResponse.json({ ok: true });
  }

  // 최초 구독 생성
  const userId = await getUserIdByEmail(service, email);
  if (!userId) {
    console.error('[GR webhook] user not found for email:', email);
    return NextResponse.json({ ok: true });
  }

  const { data: existing } = await service
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();

  if (existing) {
    await service.from('subscriptions').update({
      plan, status: 'active', credits_per_month: credits,
      lemonsqueezy_subscription_id: subscriptionId,
    }).eq('id', existing.id);
  } else {
    const { error } = await service.from('subscriptions').insert({
      user_id: userId, plan, status: 'active', unlimited: false,
      credits_per_month: credits, lemonsqueezy_subscription_id: subscriptionId,
    });
    if (error) console.error('[GR webhook] insert error:', error.message);
  }

  const { data: current } = await service.from('credits').select('balance').eq('user_id', userId).single();
  await service.from('credits').update({ balance: (current?.balance ?? 0) + credits, unlimited: false }).eq('user_id', userId);
  await service.from('credit_transactions').insert({
    user_id: userId, amount: credits, type: 'purchase',
    description: `${plan} 구독 시작`,
  });

  console.log(`[GR webhook] subscription_created OK — plan:${plan} credits:${credits}`);
  return NextResponse.json({ ok: true });
}
