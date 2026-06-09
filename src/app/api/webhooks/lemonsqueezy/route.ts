// LemonSqueezy 웹훅 이벤트 수신 — 구독 생성·갱신·취소 처리
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const PLAN_CREDITS: Record<string, number> = {
  starter:    100,
  lite:       300,
  business:   500,
  growth:     2000,
  enterprise: 5000,
};

const VARIANT_TO_PLAN: Record<string, string> = {
  [process.env.NEXT_PUBLIC_LS_VARIANT_STARTER    ?? 'x']: 'starter',
  [process.env.NEXT_PUBLIC_LS_VARIANT_LITE       ?? 'x']: 'lite',
  [process.env.NEXT_PUBLIC_LS_VARIANT_BUSINESS   ?? 'x']: 'business',
  [process.env.NEXT_PUBLIC_LS_VARIANT_GROWTH     ?? 'x']: 'growth',
  [process.env.NEXT_PUBLIC_LS_VARIANT_ENTERPRISE ?? 'x']: 'enterprise',
};

function verifySignature(rawBody: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_SIGNING_SECRET!;
  const digest = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const signature = request.headers.get('x-signature') ?? '';
  const rawBody   = await request.text();

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event     = JSON.parse(rawBody);
  const eventName = event.meta?.event_name as string;
  const attrs     = event.data?.attributes ?? {};
  const lsId      = String(event.data?.id ?? '');

  const service = createServiceClient();

  // ── 최초 구독 생성 ────────────────────────────────────────────────────────────
  if (eventName === 'subscription_created') {
    const userId: string | undefined = attrs.custom_data?.userId ?? event.meta?.custom_data?.userId;
    const variantId = String(attrs.variant_id ?? '');
    const plan = VARIANT_TO_PLAN[variantId];

    if (!userId || !plan) {
      console.error('[LS] subscription_created: userId or plan missing', lsId, variantId);
      return NextResponse.json({ ok: true });
    }

    const credits = PLAN_CREDITS[plan];

    // 구독 레코드 생성
    await service.from('subscriptions').upsert({
      user_id:                        userId,
      plan,
      status:                         'active',
      unlimited:                      false,
      credits_per_month:              credits,
      expires_at:                     attrs.renews_at ?? null,
      lemonsqueezy_subscription_id:   lsId,
    }, { onConflict: 'lemonsqueezy_subscription_id' });

    // 크레딧 지급
    const { data: current } = await service
      .from('credits').select('balance').eq('user_id', userId).single();
    await service.from('credits')
      .update({ balance: (current?.balance ?? 0) + credits, unlimited: false })
      .eq('user_id', userId);

    await service.from('credit_transactions').insert({
      user_id:     userId,
      amount:      credits,
      type:        'purchase',
      description: `${plan} 구독 시작`,
    });

    return NextResponse.json({ ok: true });
  }

  // ── 구독 결제 성공 (월 갱신) ─────────────────────────────────────────────────
  if (eventName === 'subscription_payment_success') {
    const variantId = String(attrs.variant_id ?? '');
    const plan      = VARIANT_TO_PLAN[variantId];
    const subId     = String(attrs.subscription_id ?? '');
    if (!plan || !subId) return NextResponse.json({ ok: true });

    const credits = PLAN_CREDITS[plan];

    const { data: sub } = await service
      .from('subscriptions')
      .select('user_id, created_at')
      .eq('lemonsqueezy_subscription_id', subId)
      .single();

    if (!sub) return NextResponse.json({ ok: true });

    // 첫 결제(생성 시점)와 동일한 이벤트가 올 수 있으므로 5분 여유를 두고 갱신만 처리
    const createdAt = new Date(sub.created_at).getTime();
    const isRenewal = Date.now() - createdAt > 5 * 60 * 1000;
    if (!isRenewal) return NextResponse.json({ ok: true });

    await service.from('credits')
      .update({ balance: credits })
      .eq('user_id', sub.user_id);

    await service.from('subscriptions')
      .update({ expires_at: attrs.next_payment_date ?? null, status: 'active' })
      .eq('lemonsqueezy_subscription_id', subId);

    await service.from('credit_transactions').insert({
      user_id:     sub.user_id,
      amount:      credits,
      type:        'monthly_grant',
      description: `${plan} 플랜 월간 크레딧 갱신`,
    });

    return NextResponse.json({ ok: true });
  }

  // ── 구독 취소 ────────────────────────────────────────────────────────────────
  if (eventName === 'subscription_cancelled') {
    await service
      .from('subscriptions')
      .update({ status: 'cancelled', cancel_at_period_end: true })
      .eq('lemonsqueezy_subscription_id', lsId);

    return NextResponse.json({ ok: true });
  }

  // ── 구독 상태 업데이트 (만료·정지 등) ────────────────────────────────────────
  if (eventName === 'subscription_updated') {
    const status: string = attrs.status ?? '';
    if (status === 'expired' || status === 'paused' || status === 'past_due') {
      await service
        .from('subscriptions')
        .update({ status })
        .eq('lemonsqueezy_subscription_id', lsId);
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
