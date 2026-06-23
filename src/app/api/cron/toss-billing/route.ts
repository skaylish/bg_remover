// 매월 토스 구독 자동 갱신 결제 — Vercel Cron이 호출 (토스는 스케줄링 미제공)
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { chargeBilling, makeOrderId } from '@/lib/toss';
import { TOSS_KRW_PRICES, PLAN_CREDITS } from '@/lib/toss-pricing';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Vercel Cron은 Authorization: Bearer <CRON_SECRET> 헤더를 보냄
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const service = createServiceClient();
  const nowIso = new Date().toISOString();

  // 갱신 대상: 토스 활성 구독 중 다음 결제일이 지난 건
  const { data: due, error } = await service
    .from('subscriptions')
    .select('id, user_id, plan, toss_billing_key, toss_customer_key')
    .eq('provider', 'toss')
    .eq('status', 'active')
    .lte('next_billing_at', nowIso);

  if (error) {
    console.error('[toss cron] query error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let charged = 0;
  let failed = 0;

  for (const sub of due ?? []) {
    const amount  = TOSS_KRW_PRICES[sub.plan];
    const credits = PLAN_CREDITS[sub.plan];
    if (!amount || !credits || !sub.toss_billing_key || !sub.toss_customer_key) {
      console.error(`[toss cron] skip sub ${sub.id}: invalid plan/billingKey`);
      continue;
    }

    const orderId = makeOrderId(sub.user_id, sub.plan);
    const charge = await chargeBilling(sub.toss_billing_key, {
      customerKey: sub.toss_customer_key,
      amount,
      orderId,
      orderName: `BGRemover ${sub.plan} 구독 갱신`,
    });

    if (!charge.ok) {
      failed++;
      console.error(`[toss cron] charge failed sub ${sub.id}: ${charge.status} ${charge.message}`);
      await service.from('subscriptions').update({ status: 'past_due' }).eq('id', sub.id);
      continue;
    }

    // 다음 결제일 +1개월, 크레딧 리셋(월간 갱신)
    const next = new Date();
    next.setMonth(next.getMonth() + 1);

    await service.from('subscriptions')
      .update({ next_billing_at: next.toISOString(), expires_at: next.toISOString() })
      .eq('id', sub.id);

    await service.from('credits')
      .update({ balance: credits })
      .eq('user_id', sub.user_id);

    await service.from('credit_transactions').insert({
      user_id:     sub.user_id,
      amount:      credits,
      type:        'monthly_grant',
      description: `${sub.plan} 플랜 월간 크레딧 갱신 (토스)`,
    });

    await service.from('orders').insert({
      user_id:          sub.user_id,
      plan:             sub.plan,
      amount_krw:       amount,
      toss_payment_key: charge.paymentKey,
      toss_order_id:    orderId,
      status:           'paid',
      paid_at:          charge.approvedAt,
    });

    charged++;
  }

  console.log(`[toss cron] done — charged:${charged} failed:${failed} total:${due?.length ?? 0}`);
  return NextResponse.json({ charged, failed, total: due?.length ?? 0 });
}
