-- Paddle 결제 연동을 위한 스키마 변경

-- ── profiles: Paddle 고객 ID 추가 ──────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS paddle_customer_id TEXT UNIQUE;

-- ── orders: Portone/Bootpay 컬럼 제거, Paddle 컬럼 추가 ─────────
ALTER TABLE public.orders
  DROP COLUMN IF EXISTS amount_krw,
  DROP COLUMN IF EXISTS portone_order_id,
  DROP COLUMN IF EXISTS portone_payment_id;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS amount_usd       NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS paddle_transaction_id  TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS paddle_subscription_id TEXT;

-- plan 값: pro → business
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_plan_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_plan_check
  CHECK (plan IN ('topup', 'starter', 'business', 'enterprise'));

-- ── subscriptions: plan 값 업데이트, Paddle 컬럼 추가 ────────────
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_plan_check;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_plan_check
  CHECK (plan IN ('starter', 'business', 'enterprise'));

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS paddle_subscription_id  TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end     BOOLEAN NOT NULL DEFAULT FALSE;
