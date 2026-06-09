import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

// GET /api/credits — 현재 크레딧 조회
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const service = createServiceClient();

  const { data } = await supabase
    .from('credits')
    .select('balance, unlimited')
    .eq('user_id', user.id)
    .single();

  // RLS 우회: service client로 구독 조회
  const { data: sub } = await service
    .from('subscriptions')
    .select('plan')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({
    ...(data ?? { balance: 0, unlimited: false }),
    plan: sub?.plan ?? null,
  });
}

// POST /api/credits — 크레딧 차감 (다운로드 시)
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const service = createServiceClient();

  const { data: credit } = await service
    .from('credits')
    .select('balance, unlimited')
    .eq('user_id', user.id)
    .single();

  if (!credit) return NextResponse.json({ error: 'No credit record' }, { status: 404 });
  if (credit.unlimited) return NextResponse.json({ ok: true, balance: null, unlimited: true });
  if (credit.balance <= 0) return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });

  const { data: updated } = await service
    .from('credits')
    .update({ balance: credit.balance - 1 })
    .eq('user_id', user.id)
    .select('balance')
    .single();

  await service.from('credit_transactions').insert({
    user_id: user.id,
    amount: -1,
    type: 'use',
    description: '고해상도 다운로드',
  });

  return NextResponse.json({ ok: true, balance: updated?.balance ?? credit.balance - 1, unlimited: false });
}
