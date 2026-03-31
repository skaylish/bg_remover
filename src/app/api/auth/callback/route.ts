import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/ko';

  if (code) {
    const redirectResponse = NextResponse.redirect(`${origin}${next}`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              redirectResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // 신규 가입자 보너스 크레딧 지급 (트랜잭션 기록 없으면 신규 사용자)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const admin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          );

          const { count } = await admin
            .from('credit_transactions')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id);

          if (count === 0) {
            // 신규 사용자 — 10 크레딧 보너스 지급
            await admin
              .from('credits')
              .update({ balance: 10 })
              .eq('user_id', user.id);

            await admin.from('credit_transactions').insert({
              user_id: user.id,
              amount: 10,
              type: 'purchase',
              description: '회원가입 보너스 크레딧',
            });
          }
        }
      } catch {
        // 보너스 지급 실패해도 로그인 플로우는 계속
      }

      return redirectResponse;
    }
  }

  return NextResponse.redirect(`${origin}/ko?error=auth_failed`);
}
