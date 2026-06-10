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
  [process.env.NEXT_PUBLIC_LS_VARIANT_STARTER    ?? 'x1']: 'starter',
  [process.env.NEXT_PUBLIC_LS_VARIANT_LITE       ?? 'x2']: 'lite',
  [process.env.NEXT_PUBLIC_LS_VARIANT_BUSINESS   ?? 'x3']: 'business',
  [process.env.NEXT_PUBLIC_LS_VARIANT_GROWTH     ?? 'x4']: 'growth',
  [process.env.NEXT_PUBLIC_LS_VARIANT_ENTERPRISE ?? 'x5']: 'enterprise',
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

  console.log(`[LS webhook] event: ${eventName}, id: ${lsId}`);

  const service = createServiceClient();

  // ── 최초 구독 생성 ────────────────────────────────────────────────────────────
  if (eventName === 'subscription_created') {
    const userId: string | undefined =
      attrs.custom_data?.userId ??
      event.meta?.custom_data?.userId;
    const variantId = String(attrs.variant_id ?? '');
    const plan = VARIANT_TO_PLAN[variantId];

    console.log(`[LS webhook] subscription_created — userId:${userId} variantId:${variantId} plan:${plan}`);

    if (!userId || !plan) {
      console.error('[LS webhook] MISSING userId or plan — check NEXT_PUBLIC_LS_VARIANT_* env vars');
      return NextResponse.json({ ok: true });
    }

    const credits = PLAN_CREDITS[plan];

    // 기존 활성 구독 확인 → 있으면 update, 없으면 insert
    const { data: existing } = await service
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (existing) {
      const { error: updateErr } = await service
        .from('subscriptions')
        .update({
          plan,
          status:                       'active',
          credits_per_month:            credits,
          expires_at:                   attrs.renews_at ?? null,
          lemonsqueezy_subscription_id: lsId,
        })
        .eq('id', existing.id);
      if (updateErr) console.error('[LS webhook] subscriptions update error:', updateErr.message);
    } else {
      const { error: insertErr } = await service
        .from('subscriptions')
        .insert({
          user_id:                      userId,
          plan,
          status:                       'active',
          unlimited:                    false,
          credits_per_month:            credits,
          expires_at:                   attrs.renews_at ?? null,
          lemonsqueezy_subscription_id: lsId,
        });
      if (insertErr) console.error('[LS webhook] subscriptions insert error:', insertErr.message);
    }

    // 크레딧 지급
    const { data: current, error: selErr } = await service
      .from('credits')
      .select('balance')
      .eq('user_id', userId)
      .single();
    if (selErr) console.error('[LS webhook] credits select error:', selErr.message);

    const { error: credErr } = await service
      .from('credits')
      .update({ balance: (current?.balance ?? 0) + credits, unlimited: false })
      .eq('user_id', userId);
    if (credErr) console.error('[LS webhook] credits update error:', credErr.message);

    await service.from('credit_transactions').insert({
      user_id:     userId,
      amount:      credits,
      type:        'purchase',
      description: `${plan} 구독 시작`,
    });

    console.log(`[LS webhook] subscription_created OK — plan:${plan} credits:${credits}`);
    return NextResponse.json({ ok: true });
  }

  // ── 구독 결제 성공 (월 갱신) ─────────────────────────────────────────────────
  if (eventName === 'subscription_payment_success') {
    const variantId = String(attrs.variant_id ?? '');
    const plan      = VARIANT_TO_PLAN[variantId];
    const subId     = String(attrs.subscription_id ?? '');
    if (!plan || !subId) return NextResponse.json({ ok: true });

    const credits = PLAN_CREDITS[plan];

    // 구독 테이블에서 user_id 조회 (LS subscription id로)
    const { data: sub } = await service
      .from('subscriptions')
      .select('id, user_id, created_at')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!sub) {
      console.error('[LS webhook] subscription_payment_success: no active subscription found');
      return NextResponse.json({ ok: true });
    }

    // 구독 생성 5분 이내면 초기 결제이므로 갱신 처리 스킵
    const isRenewal = Date.now() - new Date(sub.created_at).getTime() > 5 * 60 * 1000;
    if (!isRenewal) return NextResponse.json({ ok: true });

    await service.from('credits')
      .update({ balance: credits })
      .eq('user_id', sub.user_id);

    await service.from('subscriptions')
      .update({ expires_at: attrs.next_payment_date ?? null, plan })
      .eq('id', sub.id);

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
    // LS subscription id를 저장한 컬럼이 있으면 사용, 없으면 마지막 활성 구독 처리
    const { error } = await service
      .from('subscriptions')
      .update({ status: 'cancelled', cancel_at_period_end: true })
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1);
    if (error) console.error('[LS webhook] cancel error:', error.message);
    return NextResponse.json({ ok: true });
  }

  // ── 구독 상태 변경 ─────────────────────────────────────────────────────────
  if (eventName === 'subscription_updated') {
    const status: string = attrs.status ?? '';
    if (['expired', 'paused', 'past_due'].includes(status)) {
      await service
        .from('subscriptions')
        .update({ status })
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
