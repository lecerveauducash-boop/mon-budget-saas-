-- À exécuter dans Supabase : Project > SQL Editor > New query > coller > Run

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  email text not null,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  status text not null default 'inactive', -- 'active' | 'inactive' | 'canceled' | 'past_due'
  current_period_end timestamptz,
  created_at timestamptz default now()
);

-- Empêche un utilisateur de lire les abonnements des autres
alter table public.subscriptions enable row level security;

create policy "Un utilisateur voit uniquement son propre abonnement"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Index pour retrouver rapidement un client par son id Stripe (utilisé par le webhook)
create index if not exists idx_subscriptions_stripe_customer on public.subscriptions(stripe_customer_id);

-- Stocke les données du budget de chaque client, une ligne par compte
create table if not exists public.budget_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

alter table public.budget_data enable row level security;

create policy "Un utilisateur voit uniquement ses propres données"
  on public.budget_data for select
  using (auth.uid() = user_id);

create policy "Un utilisateur modifie uniquement ses propres données"
  on public.budget_data for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
