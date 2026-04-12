import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { RestClient } from '@bootpay/server-rest-client';

const PLAN_AMOUNTS: Record<string, number> = {
  topup: 9900,
  starter: 4900,
  pro: 19900,
  enterprise: 99000,
};

const PLAN_CREDITS: Record<string, number> = {
  topup: 100,
  starter: 100,
  pro: 500,
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { receiptId, plan, orderId } = await request.json();
  if (!receiptId || !plan || !orderId || !(plan in PLAN_AMOUNTS)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const clientId = process.env.BOOTPAY_CLIENT_ID?.trim();
  const secretKey = process.env.BOOTPAY_SECRET_KEY?.trim();
  if (!clientId || !secretKey) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  // 부트페이 액세스 토큰 발급 후 결제 검증
  RestClient.setConfig(clientId, secretKey);
  const tokenRes = await RestClient.getAccessToken();
  if (tokenRes.status !== 200) {
    console.error('[complete] Bootpay getAccessToken failed', tokenRes);
    return NextResponse.json({ error: '결제 검증 초기화 실패' }, { status: 502 });
  }

  let pay: any;
  try {
    const verifyRes = await RestClient.verify(receiptId);
    pay = verifyRes.data;
  } catch (e) {
    console.error('[complete] Bootpay verify failed', e);
    return NextResponse.json({ error: '결제 검증 실패' }, { status: 502 });
  }

  // 결제 상태 검증
  if (pay?.status !== 1) {
    return NextResponse.json({ error: `결제가 완료되지 않았습니다 (status: ${pay?.status})` }, { status: 400 });
  }

  // 금액 위변조 검증
  if (Number(pay?.price) !== PLAN_AMOUNTS[plan]) {
    console.error('[complete] Amount mismatch', { expected: PLAN_AMOUNTS[plan], got: pay?.price });
    return NextResponse.json({ error: '결제 금액이 일치하지 않습니다' }, { status: 400 });
  }

  const service = createServiceClient();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  // 주문 기록
  await service.from('orders').insert({
    user_id: user.id,
    plan,
    amount_krw: PLAN_AMOUNTS[plan],
    portone_order_id: orderId,
    portone_payment_id: receiptId,
    status: 'paid',
    paid_at: new Date().toISOString(),
  });

  // 크레딧 / 구독 지급
  if (plan === 'enterprise') {
    await service.from('credits').update({ unlimited: true }).eq('user_id', user.id);
    await service.from('subscriptions').insert({
      user_id: user.id,
      plan,
      status: 'active',
      unlimited: true,
      credits_per_month: 0,
      expires_at: expiresAt,
    });
  } else {
    const credits = PLAN_CREDITS[plan] ?? 0;
    const { data: current } = await service.from('credits').select('balance').eq('user_id', user.id).single();
    await service.from('credits').update({ balance: (current?.balance ?? 0) + credits }).eq('user_id', user.id);
    await service.from('credit_transactions').insert({
      user_id: user.id,
      amount: credits,
      type: 'purchase',
      description: `${plan} 플랜 결제`,
    });
    if (plan !== 'topup') {
      await service.from('subscriptions').insert({
        user_id: user.id,
        plan,
        status: 'active',
        unlimited: false,
        credits_per_month: credits,
        expires_at: expiresAt,
      });
    }
  }

  return NextResponse.json({ ok: true, plan });
}
