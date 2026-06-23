// 토스 국내 결제용 플랜별 KRW 가격·크레딧 상수 (클라이언트/서버 공용, 시크릿 없음)

// 환율 1,511원 기준으로 환산 후 한국식 가격대(끝자리 900)로 조정한 월 구독가
export const TOSS_KRW_PRICES: Record<string, number> = {
  starter:     5900,
  lite:       13900,
  business:   19900,
  growth:     44900,
  enterprise: 89900,
};

// 플랜별 월 지급 크레딧 (LemonSqueezy 웹훅과 동일 기준)
export const PLAN_CREDITS: Record<string, number> = {
  starter:     100,
  lite:        300,
  business:    500,
  growth:     2000,
  enterprise: 5000,
};

// ₩12,900 형태로 포맷
export function formatKrw(amount: number): string {
  return `₩${amount.toLocaleString('ko-KR')}`;
}
