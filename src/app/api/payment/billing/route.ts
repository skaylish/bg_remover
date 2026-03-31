import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

const PLAN_CREDITS: Record<string, number> = {
  starter: 100,
  pro: 500,
};

const PLAN_AMOUNTS: Record<string, number> = {
  starter: 4900,
  pro: 19900,
  enterprise: 99000,
};

async function getPortoneV2Token(): Promise<string> {
  const secret = process.env.PORTONE_V2_API_SECRET?.trim();
  if (!secret) throw new Error('PortOne V2 credentials not configured');

  const res = await fetch('https://api.portone.io/login/api-secret', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiSecret: secret }),
  });
  const text = await res.text();
  if (!text) throw new Error(`PortOne V2 token: empty response (HTTP ${res.status})`);
  const data = JSON.parse(text);
  if (!data.accessToken) throw new Error(`PortOne V2 token error: ${data.message ?? text}`);
  return data.accessToken;
}

// POST /api/payment/billing — 빌링키로 즉시 청구
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { billingKey, merchantUid } = await request.json();
  if (!billingKey || !merchantUid) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

  const service = createServiceClient();

  const { data: order } = await service
    .from('orders')
    .select('*')
    .eq('portone_order_id', merchantUid)
    .eq('user_id', user.id)
    .single();

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  if (order.status === 'paid') return NextResponse.json({ ok: true, plan: order.plan });

  let token: string;
  try {
    token = await getPortoneV2Token();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const storeId = process.env.PORTONE_V2_STORE_ID?.trim();

  // 빌링키로 즉시 청구
  const chargeRes = await fetch(`https://api.portone.io/payments/${encodeURIComponent(merchantUid)}/billing-key`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      storeId,
      billingKey,
      orderName: `${order.plan} 구독`,
      customer: { email: user.email },
      amount: { total: order.amount_krw },
      currency: 'KRW',
    }),
  });

  const chargeText = await chargeRes.text();
  const chargeData = chargeText ? JSON.parse(chargeText) : {};

  if (!chargeRes.ok || chargeData.status !== 'PAID') {
    return NextResponse.json({
      error: `Billing charge failed: ${chargeData.message ?? chargeText}`,
    }, { status: 400 });
  }

  // 주문 상태 업데이트
  await service.from('orders').update({
    portone_payment_id: chargeData.id ?? merchantUid,
    status: 'paid',
    paid_at: new Date().toISOString(),
  }).eq('id', order.id);

  const plan = order.plan as string;

  if (plan === 'enterprise') {
    await service.from('credits').update({ unlimited: true }).eq('user_id', user.id);
    await service.from('subscriptions').insert({
      user_id: user.id, plan, status: 'active', unlimited: true, credits_per_month: 0,
    });
  } else {
    const credits = PLAN_CREDITS[plan] ?? 0;
    const { data: current } = await service.from('credits').select('balance').eq('user_id', user.id).single();
    await service.from('credits').update({ balance: (current?.balance ?? 0) + credits }).eq('user_id', user.id);
    await service.from('credit_transactions').insert({
      user_id: user.id, amount: credits, type: 'purchase', description: `${plan} 플랜 정기결제`,
    });
    await service.from('subscriptions').insert({
      user_id: user.id, plan, status: 'active', unlimited: false, credits_per_month: credits,
    });
  }

  return NextResponse.json({ ok: true, plan });
}
