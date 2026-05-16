// Paddle 웹훅 이벤트를 수신하고 크레딧/구독 상태를 업데이트하는 핸들러
import { NextResponse } from 'next/server';
import { Environment, EventName, LogLevel, Paddle } from '@paddle/paddle-node-sdk';
import { createServiceClient } from '@/lib/supabase/server';

const PLAN_CREDITS: Record<string, number> = {
  starter:    100,
  business:   500,
  enterprise: 0,   // unlimited
};

const paddle = new Paddle(process.env.PADDLE_API_KEY!, {
  environment: process.env.PADDLE_ENVIRONMENT === 'production' ? Environment.production : Environment.sandbox,
  logLevel: LogLevel.none,
});

export async function POST(request: Request) {
  const signature = request.headers.get('paddle-signature');
  const rawBody   = await request.text();

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
  }

  let event: Awaited<ReturnType<typeof paddle.webhooks.unmarshal>>;
  try {
    event = await paddle.webhooks.unmarshal(rawBody, process.env.PADDLE_WEBHOOK_SECRET!, signature);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const service = createServiceClient();

  if (event.eventType === EventName.TransactionCompleted) {
    const tx = event.data as any;
    const userId      = tx.customData?.userId as string | undefined;
    const customerId  = tx.customerId as string;
    const subId       = tx.subscriptionId as string | null;
    const txId        = tx.id as string;
    const amountUsd   = Number(tx.details?.totals?.total ?? 0) / 100;

    if (!userId) {
      console.error('[paddle] transaction.completed: userId missing in customData', txId);
      return NextResponse.json({ ok: true });
    }

    // Paddle 고객 ID 저장
    await service.from('profiles')
      .update({ paddle_customer_id: customerId })
      .eq('id', userId);

    if (subId) {
      // 구독 결제 (최초 또는 갱신)
      const plan = resolvePlan(tx);
      if (!plan) {
        console.error('[paddle] Unknown plan for transaction', txId);
        return NextResponse.json({ ok: true });
      }

      const { data: existingSub } = await service
        .from('subscriptions')
        .select('id')
        .eq('paddle_subscription_id', subId)
        .single();

      if (existingSub) {
        // 갱신: 크레딧 리셋
        if (plan === 'enterprise') {
          await service.from('credits').update({ unlimited: true }).eq('user_id', userId);
        } else {
          const credits = PLAN_CREDITS[plan];
          await service.from('credits').update({ balance: credits }).eq('user_id', userId);
          await service.from('credit_transactions').insert({
            user_id:     userId,
            amount:      credits,
            type:        'monthly_grant',
            description: `${plan} 플랜 월간 크레딧 갱신`,
          });
        }
      } else {
        // 최초 구독: 구독 레코드 생성 + 크레딧 지급
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        const isUnlimited = plan === 'enterprise';
        const credits = PLAN_CREDITS[plan] ?? 0;

        await service.from('subscriptions').insert({
          user_id:                userId,
          plan,
          status:                 'active',
          unlimited:              isUnlimited,
          credits_per_month:      credits,
          expires_at:             expiresAt,
          paddle_subscription_id: subId,
        });

        if (isUnlimited) {
          await service.from('credits').update({ unlimited: true }).eq('user_id', userId);
        } else {
          const { data: current } = await service.from('credits').select('balance').eq('user_id', userId).single();
          await service.from('credits')
            .update({ balance: (current?.balance ?? 0) + credits })
            .eq('user_id', userId);
          await service.from('credit_transactions').insert({
            user_id:     userId,
            amount:      credits,
            type:        'purchase',
            description: `${plan} 구독 시작`,
          });
        }

        await service.from('orders').insert({
          user_id:                userId,
          plan,
          amount_usd:             amountUsd,
          paddle_transaction_id:  txId,
          paddle_subscription_id: subId,
          status:                 'paid',
          paid_at:                new Date().toISOString(),
        });
      }
    } else {
      // 단건 결제 (topup)
      const credits = PLAN_CREDITS['starter']; // topup은 100크레딧
      const { data: current } = await service.from('credits').select('balance').eq('user_id', userId).single();
      await service.from('credits')
        .update({ balance: (current?.balance ?? 0) + 100 })
        .eq('user_id', userId);
      await service.from('credit_transactions').insert({
        user_id:     userId,
        amount:      100,
        type:        'purchase',
        description: '크레딧 100개 충전',
      });
      await service.from('orders').insert({
        user_id:               userId,
        plan:                  'topup',
        amount_usd:            amountUsd,
        paddle_transaction_id: txId,
        status:                'paid',
        paid_at:               new Date().toISOString(),
      });
    }
  }

  if (event.eventType === EventName.SubscriptionCanceled) {
    const sub = event.data as any;
    await service
      .from('subscriptions')
      .update({ cancel_at_period_end: true, status: 'cancelled' })
      .eq('paddle_subscription_id', sub.id);
  }

  return NextResponse.json({ ok: true });
}

function resolvePlan(tx: any): string | null {
  const priceId: string = tx.items?.[0]?.price?.id ?? '';
  const map: Record<string, string> = {
    [process.env.PADDLE_PRICE_STARTER    ?? '']: 'starter',
    [process.env.PADDLE_PRICE_BUSINESS   ?? '']: 'business',
    [process.env.PADDLE_PRICE_ENTERPRISE ?? '']: 'enterprise',
  };
  return map[priceId] ?? null;
}
