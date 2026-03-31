-- ============================================================
-- BG Remover - Initial DB Schema
-- Run this in: Supabase Dashboard > SQL Editor
-- ============================================================

-- ── 1. profiles ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  name        TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: self read"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles: self update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ── 2. credits ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.credits (
  user_id    UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance    INT NOT NULL DEFAULT 0,
  unlimited  BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "credits: self read"   ON public.credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "credits: self update" ON public.credits FOR UPDATE USING (auth.uid() = user_id);

-- ── 3. credit_transactions ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount      INT NOT NULL,            -- positive = 지급, negative = 사용
  type        TEXT NOT NULL CHECK (type IN ('purchase','use','refund','monthly_grant')),
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "txn: self read" ON public.credit_transactions FOR SELECT USING (auth.uid() = user_id);

-- ── 4. subscriptions ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan              TEXT NOT NULL CHECK (plan IN ('starter','pro','enterprise')),
  status            TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','cancelled','expired')),
  credits_per_month INT NOT NULL DEFAULT 0,
  unlimited         BOOLEAN NOT NULL DEFAULT FALSE,
  started_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subs: self read" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- ── 5. orders (포트원 결제 연동용) ───────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan               TEXT NOT NULL CHECK (plan IN ('starter','pro','enterprise')),
  amount_krw         INT NOT NULL,          -- 결제 금액 (원)
  portone_order_id   TEXT UNIQUE,           -- 포트원 merchant_uid
  portone_payment_id TEXT,                  -- 포트원 imp_uid
  status             TEXT NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending','paid','failed','refunded')),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at            TIMESTAMPTZ
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders: self read" ON public.orders FOR SELECT USING (auth.uid() = user_id);

-- ── 6. 신규 가입 시 자동으로 profile + credits 생성 ──────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  INSERT INTO public.credits (user_id, balance, unlimited)
  VALUES (NEW.id, 0, FALSE);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 7. updated_at 자동 갱신 ─────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER credits_updated_at BEFORE UPDATE ON public.credits
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
