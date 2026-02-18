-- Migration: credits -> balance_cents (BRL centavos)
-- 1 credito = 495 centavos (R$4,95 = metade do plano mais barato)

-- Adicionar coluna de saldo monetario
ALTER TABLE public.profiles
  ADD COLUMN balance_cents INTEGER NOT NULL DEFAULT 0;

-- Migrar creditos existentes
UPDATE public.profiles SET balance_cents = credits * 495;

-- Adicionar colunas ao log de transacoes
ALTER TABLE public.credit_transactions
  ADD COLUMN amount_cents INTEGER,
  ADD COLUMN operation_type TEXT;

-- Backfill transacoes existentes
UPDATE public.credit_transactions
  SET amount_cents = amount * 495,
      operation_type = CASE
        WHEN type = 'purchase' THEN 'deposit'
        WHEN type = 'consumption' THEN 'generation'
        WHEN type = 'bonus' THEN 'bonus'
      END;
