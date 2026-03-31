import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

const PLAN_CREDITS: Record<string, number> = {
  topup: 100,
  starter: 100,
  pro: 500,
};

async function getPortoneToken(): Promise<string> {
  const imp_key = process.env.PORTONE_API_KEY?.trim();
  const imp_secret = process.env.PORTONE_API_SECRET?.trim();

  if (!imp_key || !imp_secret) throw new Error('PortOne credentials not configured');

  const res = await fetch('https://api.iamport.kr/users/getToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imp_key, imp_secret }),
  });
  const data = await res.json();
  if (!data.response?.access_token) {
    throw new Error(`PortOne token error: ${data.message ?? JSON.stringify(data)}`);
  }
  return data.response.access_token;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { impUid, merchantUid } = await request.json();
  if (!impUid || !merchantUid) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

  const service = createServiceClient();

  // DB에서 주문 조회
  const { data: order } = await service
    .from('orders')
    .select('*')
    .eq('portone_order_id', merchantUid)
    .eq('user_id', user.id)
    .single();

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  if (order.status === 'paid') return NextResponse.json({ ok: true, plan: order.plan });

  // 포트원 결제 정보 조회
  let token: string;
  try {
    token = await getPortoneToken();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const fetchPayment = () =>
    fetch(`https://api.iamport.kr/payments/${impUid}`, {
      headers: { Authorization: token },
    }).then((r) => r.json());

  let payData = await fetchPayment();

  // 타이밍 이슈 대비: 최대 3회 재시도 (1s 간격)
  for (let i = 0; i < 3 && !payData.response; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    payData = await fetchPayment();
  }

  const payment = payData.response;

  if (!payment) {
    return NextResponse.json({
      error: `Payment not found on PortOne (imp_uid: ${impUid}, code: ${payData.code}, message: ${payData.message})`,
    }, { status: 404 });
  }

  // 금액 위변조 검증
  if (payment.amount !== order.amount_krw) {
    await service.from('orders').update({ status: 'failed' }).eq('id', order.id);
    return NextResponse.json({ error: 'Amount mismatch — possible forgery' }, { status: 400 });
  }

  if (payment.status !== 'paid') {
    await service.from('orders').update({ status: 'failed' }).eq('id', order.id);
    return NextResponse.json({ error: `Payment status: ${payment.status}` }, { status: 400 });
  }

  // 주문 상태 업데이트
  await service.from('orders').update({
    portone_payment_id: impUid,
    status: 'paid',
    paid_at: new Date().toISOString(),
  }).eq('id', order.id);

  const plan = order.plan as string;

  // 크레딧/구독 지급
  if (plan === 'enterprise') {
    await service.from('credits').update({ unlimited: true }).eq('user_id', user.id);
    await service.from('subscriptions').insert({
      user_id: user.id,
      plan,
      status: 'active',
      unlimited: true,
      credits_per_month: 0,
    });
  } else {
    const credits = PLAN_CREDITS[plan] ?? 0;
    const { data: current } = await service
      .from('credits')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    await service
      .from('credits')
      .update({ balance: (current?.balance ?? 0) + credits })
      .eq('user_id', user.id);

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
      });
    }
  }

  return NextResponse.json({ ok: true, plan });
}
