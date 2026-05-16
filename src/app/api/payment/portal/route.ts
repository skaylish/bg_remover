// 사용자의 Paddle Customer Portal URL을 생성하는 엔드포인트
import { NextResponse } from 'next/server';
import { Environment, LogLevel, Paddle } from '@paddle/paddle-node-sdk';
import { createClient, createServiceClient } from '@/lib/supabase/server';

const paddle = new Paddle(process.env.PADDLE_API_KEY!, {
  environment: process.env.PADDLE_ENVIRONMENT === 'production' ? Environment.production : Environment.sandbox,
  logLevel: LogLevel.none,
});

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const service = createServiceClient();
  const { data: profile } = await service
    .from('profiles')
    .select('paddle_customer_id')
    .eq('id', user.id)
    .single();

  if (!profile?.paddle_customer_id) {
    return NextResponse.json({ error: 'No active subscription' }, { status: 404 });
  }

  const session = await paddle.customerPortalSessions.create(profile.paddle_customer_id, []);
  return NextResponse.json({ url: (session as any).urls?.general?.overview });
}
