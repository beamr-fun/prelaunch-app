create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  fid bigint unique not null,
  preferred_wallet text unique,
  referrer_fid bigint,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Automatically update `updated_at` on row changes
create or replace function update_updated_at_column()
returns trigger as $$
begin
   new.updated_at = now();
   return new;
end;
$$ language plpgsql;

create trigger set_updated_at
before update on users
for each row
execute function update_updated_at_column();