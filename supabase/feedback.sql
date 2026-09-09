create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 60),
  rating integer not null check (rating between 1 and 5),
  review text not null check (char_length(review) between 1 and 1000),
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

drop policy if exists "Anyone can read public feedback" on public.feedback;
create policy "Anyone can read public feedback" on public.feedback
  for select using (true);

drop policy if exists "Anyone can submit public feedback" on public.feedback;
create policy "Anyone can submit public feedback" on public.feedback
  for insert with check (true);
