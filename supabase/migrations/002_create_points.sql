create table points (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  source text not null,
  amount int not null,
  metadata jsonb,
  created_at timestamptz default now()
);