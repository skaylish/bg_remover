// 토스페이먼츠 빌링(자동결제) 서버 측 API 호출 헬퍼 — 빌링키 발급·정기결제 승인
import 'server-only';

const TOSS_API = 'https://api.tosspayments.com';

// 시크릿 키를 Basic 인증 헤더로 변환 (secretKey + ':' → base64)
function authHeader(): string {
  const secret = process.env.TOSS_SECRET_KEY;
  if (!secret) throw new Error('TOSS_SECRET_KEY not set');
  return `Basic ${Buffer.from(`${secret}:`).toString('base64')}`;
}

// orderId: 6~64자 영문/숫자. 멱등키로도 사용.
export function makeOrderId(userId: string, plan: string): string {
  return `bgr_${userId.slice(0, 8)}_${plan}_${Date.now()}`;
}

export interface TossCard {
  number?: string;
  cardType?: string;
  ownerType?: string;
}

// 빌링키 발급: 카드 등록창 인증 결과(authKey)로 영구 빌링키를 받는다.
export async function issueBillingKey(
  authKey: string,
  customerKey: string,
): Promise<{ ok: true; billingKey: string; card?: TossCard } | { ok: false; status: number; message: string }> {
  const res = await fetch(`${TOSS_API}/v1/billing/authorizations/issue`, {
    method: 'POST',
    headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ authKey, customerKey }),
  });
  const json = await res.json();
  if (!res.ok) {
    return { ok: false, status: res.status, message: json?.message ?? 'billing key issue failed' };
  }
  return { ok: true, billingKey: json.billingKey, card: json.card };
}

// 자동결제 승인: 저장된 빌링키로 실제 결제를 일으킨다.
export async function chargeBilling(
  billingKey: string,
  params: {
    customerKey: string;
    amount: number;
    orderId: string;
    orderName: string;
    customerEmail?: string;
    customerName?: string;
  },
): Promise<{ ok: true; paymentKey: string; approvedAt: string } | { ok: false; status: number; message: string }> {
  const res = await fetch(`${TOSS_API}/v1/billing/${billingKey}`, {
    method: 'POST',
    headers: {
      Authorization: authHeader(),
      'Content-Type': 'application/json',
      'Idempotency-Key': params.orderId, // 동일 주문 중복 결제 방지
    },
    body: JSON.stringify({
      customerKey:   params.customerKey,
      amount:        params.amount,
      orderId:       params.orderId,
      orderName:     params.orderName,
      customerEmail: params.customerEmail,
      customerName:  params.customerName,
    }),
  });
  const json = await res.json();
  if (!res.ok || json?.status !== 'DONE') {
    return { ok: false, status: res.status, message: json?.message ?? `payment not approved (status: ${json?.status})` };
  }
  return { ok: true, paymentKey: json.paymentKey, approvedAt: json.approvedAt };
}
