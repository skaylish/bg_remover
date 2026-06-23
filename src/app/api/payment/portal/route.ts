// 사용자의 구독 관리 페이지 URL을 반환하는 엔드포인트
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Gumroad는 별도 포털 API 없이 계정 페이지에서 구독 관리
  return NextResponse.json({ url: 'https://app.gumroad.com/subscriptions' });
}
