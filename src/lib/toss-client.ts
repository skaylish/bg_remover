// 토스 빌링(카드 등록) 인증창을 띄우는 클라이언트 헬퍼 — CDN의 window.TossPayments 사용
'use client';

export async function requestTossBilling(
  planKey: string,
  userId: string,
  email: string,
  lang: string,
): Promise<void> {
  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
  if (!clientKey) { alert('결제 설정 오류입니다. 잠시 후 다시 시도해주세요.'); return; }

  const Toss = (window as unknown as { TossPayments?: (key: string) => any }).TossPayments;
  if (!Toss) { alert('결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.'); return; }

  const tossPayments = Toss(clientKey);
  const payment = tossPayments.payment({ customerKey: userId });
  const origin = window.location.origin;

  // 인증 성공 시 successUrl로 authKey·customerKey가 쿼리에 붙어 리다이렉트됨
  await payment.requestBillingAuth({
    method: 'CARD',
    successUrl: `${origin}/api/toss/billing/confirm?plan=${planKey}&lang=${lang}`,
    failUrl:    `${origin}/${lang}/pricing?payment=fail`,
    customerEmail: email || undefined,
  });
}
