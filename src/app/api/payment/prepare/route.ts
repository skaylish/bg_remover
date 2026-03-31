import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

const PLAN_AMOUNTS: Record<string, number> = {
  topup: 9900,
  starter: 4900,
  pro: 19900,
  enterprise: 99000,
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { plan } = await request.json();
  const amount = PLAN_AMOUNTS[plan];
  if (!amount) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

  const merchantUid = `bgremover_v1_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const service = await createServiceClient();
  const { error } = await service.from('orders').insert({
    user_id: user.id,
    plan,
    amount_krw: amount,
    portone_order_id: merchantUid,
    status: 'pending',
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ merchantUid, amount });
}
