-- LemonSqueezy 전환을 위한 스키마 마이그레이션
-- subscriptions 테이블에 LS 구독 ID 컬럼 추가
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS lemonsqueezy_subscription_id TEXT;

-- orders 테이블에 LS 구독 ID 컬럼 추가
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS lemonsqueezy_subscription_id TEXT;

-- 인덱스 추가 (웹훅 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_subscriptions_ls_id
  ON subscriptions (lemonsqueezy_subscription_id);
