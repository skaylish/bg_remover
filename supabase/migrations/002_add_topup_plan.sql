-- orders.plan CHECK 에 'topup' 추가
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_plan_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_plan_check
  CHECK (plan IN ('topup', 'starter', 'pro', 'enterprise'));
