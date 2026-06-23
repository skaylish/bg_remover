// 토스 카드 등록창 인증 성공 콜백 — 빌링키 발급 → 첫 달 결제 → 구독·크레딧 생성
import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { issueBillingKey, chargeBilling, makeOrderId } from '@/lib/toss';
import { TOSS_KRW_PRICES, PLAN_CREDITS } from '@/lib/toss-pricing';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url   = new URL(request.url);
  const plan  = url.searchParams.get('plan') ?? '';
  const lang  = url.searchParams.get('lang') ?? 'ko';
  const authKey     = url.searchParams.get('authKey') ?? '';
  const customerKey = url.searchParams.get('customerKey') ?? '';

  const fail = (reason: string) => {
    console.error('[toss confirm]', reason);
    return NextResponse.redirect(new URL(`/${lang}/pricing?payment=fail`, request.url));
  };

  const amount  = TOSS_KRW_PRICES[plan];
  const credits = PLAN_CREDITS[plan];
  if (!amount || !credits) return fail(`unknown plan: ${plan}`);
  if (!authKey || !customerKey) return fail('missing authKey/customerKey');

  // 로그인 사용자 = customerKey 검증 (타인 결제 위조 방지)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail('unauthorized');
  if (user.id !== customerKey) return fail('customerKey mismatch');

  // 1. 빌링키 발급
  const issued = await issueBillingKey(authKey, customerKey);
  if (!issued.ok) return fail(`issue billing key: ${issued.status} ${issued.message}`);

  // 2. 첫 달 결제
  const orderId = makeOrderId(user.id, plan);
  const charge = await chargeBilling(issued.billingKey, {
    customerKey,
    amount,
    orderId,
    orderName: `BGRemover ${plan} 구독`,
    customerEmail: user.email ?? undefined,
  });
  if (!charge.ok) return fail(`charge: ${charge.status} ${charge.message}`);

  // 3. 구독·크레딧 반영 (RLS 우회를 위해 service client 사용)
  const service = createServiceClient();
  const nextBilling = new Date();
  nextBilling.setMonth(nextBilling.getMonth() + 1);

  const { data: existing } = await service
    .from('subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  const subFields = {
    plan,
    status:            'active',
    provider:          'toss',
    unlimited:         false,
    credits_per_month: credits,
    toss_billing_key:  issued.billingKey,
    toss_customer_key: customerKey,
    next_billing_at:   nextBilling.toISOString(),
    expires_at:        nextBilling.toISOString(),
  };

  if (existing) {
    await service.from('subscriptions').update(subFields).eq('id', existing.id);
  } else {
    await service.from('subscriptions').insert({ user_id: user.id, ...subFields });
  }

  // 크레딧 지급 (기존 잔액에 가산)
  const { data: current } = await service
    .from('credits')
    .select('balance')
    .eq('user_id', user.id)
    .single();

  await service.from('credits')
    .update({ balance: (current?.balance ?? 0) + credits, unlimited: false })
    .eq('user_id', user.id);

  await service.from('credit_transactions').insert({
    user_id:     user.id,
    amount:      credits,
    type:        'purchase',
    description: `${plan} 구독 시작 (토스)`,
  });

  // 결제 기록
  await service.from('orders').insert({
    user_id:          user.id,
    plan,
    amount_krw:       amount,
    toss_payment_key: charge.paymentKey,
    toss_order_id:    orderId,
    status:           'paid',
    paid_at:          charge.approvedAt,
  });

  console.log(`[toss confirm] OK — user:${user.id} plan:${plan} amount:${amount}`);
  return NextResponse.redirect(new URL(`/${lang}/editor?payment=success`, request.url));
}
