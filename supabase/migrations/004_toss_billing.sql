-- 토스페이먼츠 빌링키 기반 국내 정기결제 연동을 위한 스키마 변경

-- ── subscriptions: 결제 출처 구분 + 토스 빌링 컬럼 + 다음 갱신일 ─────────────
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS provider          TEXT NOT NULL DEFAULT 'lemonsqueezy',
  ADD COLUMN IF NOT EXISTS toss_billing_key  TEXT,
  ADD COLUMN IF NOT EXISTS toss_customer_key TEXT,
  ADD COLUMN IF NOT EXISTS next_billing_at   TIMESTAMPTZ;

-- plan CHECK: 5개 플랜 모두 허용 (기존 lite/growth 누락으로 인한 insert 실패 버그 수정)
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_plan_check;
ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_plan_check
  CHECK (plan IN ('starter', 'lite', 'business', 'growth', 'enterprise'));

-- 크론 갱신 대상 조회 최적화
CREATE INDEX IF NOT EXISTS idx_subscriptions_toss_renewal
  ON public.subscriptions (provider, status, next_billing_at);

-- ── orders: 토스 결제 기록 컬럼 ─────────────────────────────────────────────
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS amount_krw       INT,
  ADD COLUMN IF NOT EXISTS toss_payment_key TEXT,
  ADD COLUMN IF NOT EXISTS toss_order_id    TEXT UNIQUE;

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_plan_check;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_plan_check
  CHECK (plan IN ('topup', 'starter', 'lite', 'business', 'growth', 'enterprise'));
