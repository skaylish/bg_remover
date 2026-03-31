import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

const PLAN_CREDITS: Record<string, number> = {
  topup: 100,
  starter: 100,
  pro: 500,
};

// POST /api/payment/verify — 일반결제 검증 (PortOne V2)
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { paymentId } = await request.json();
  if (!paymentId) return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 });

  const service = createServiceClient();

  const { data: order } = await service
    .from('orders')
    .select('*')
    .eq('portone_order_id', paymentId)
    .eq('user_id', user.id)
    .single();

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  if (order.status === 'paid') return NextResponse.json({ ok: true, plan: order.plan });

  const secret = process.env.PORTONE_V2_API_SECRET?.trim();
  if (!secret) return NextResponse.json({ error: 'PortOne V2 credentials not configured' }, { status: 500 });

  // PortOne V2 결제 조회
  const payRes = await fetch(`https://api.portone.io/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `PortOne ${secret}` },
  });

  if (!payRes.ok) {
    const text = await payRes.text();
    console.error('[verify] PortOne payment lookup failed', { paymentId, status: payRes.status, body: text });
    return NextResponse.json({ error: `Payment lookup failed: ${payRes.status}` }, { status: 502 });
  }

  const pay = await payRes.json();

  // 금액 위변조 검증
  if (pay.amount?.total !== order.amount_krw) {
    await service.from('orders').update({ status: 'failed' }).eq('id', order.id);
    return NextResponse.json(
      { error: `Amount mismatch — expected ${order.amount_krw}, got ${pay.amount?.total}` },
      { status: 400 },
    );
  }

  if (pay.status !== 'PAID') {
    await service.from('orders').update({ status: 'failed' }).eq('id', order.id);
    return NextResponse.json({ error: `Payment status: ${pay.status}` }, { status: 400 });
  }

  await service.from('orders').update({
    portone_payment_id: paymentId,
    status: 'paid',
    paid_at: new Date().toISOString(),
  }).eq('id', order.id);

  const plan = order.plan as string;
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  if (plan === 'enterprise') {
    await service.from('credits').update({ unlimited: true }).eq('user_id', user.id);
    await service.from('subscriptions').insert({
      user_id: user.id, plan, status: 'active', unlimited: true, credits_per_month: 0, expires_at: expiresAt,
    });
  } else {
    const credits = PLAN_CREDITS[plan] ?? 0;
    const { data: current } = await service.from('credits').select('balance').eq('user_id', user.id).single();
    await service.from('credits').update({ balance: (current?.balance ?? 0) + credits }).eq('user_id', user.id);
    await service.from('credit_transactions').insert({
      user_id: user.id, amount: credits, type: 'purchase', description: `${plan} 플랜 결제`,
    });
    if (plan !== 'topup') {
      await service.from('subscriptions').insert({
        user_id: user.id, plan, status: 'active', unlimited: false, credits_per_month: credits, expires_at: expiresAt,
      });
    }
  }

  return NextResponse.json({ ok: true, plan });
}
