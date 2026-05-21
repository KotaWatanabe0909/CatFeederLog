create table feeding_logs (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid references households(id) on delete cascade not null,
  cat_id        uuid references cats(id) on delete cascade not null,
  member_id     uuid references members(id) on delete cascade not null,
  food_type     text not null check (food_type in ('dry', 'wet')),
  amount        text check (amount in ('all', 'most', 'half', 'little', 'none')),
  note          text,
  fed_at        timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

alter table feeding_logs enable row level security;

-- members of the same household can read logs
create policy "household members can read feeding logs"
  on feeding_logs for select
  using (
    household_id in (
      select household_id from members where user_id = auth.uid()
    )
  );

-- members of the same household can insert logs
create policy "household members can insert feeding logs"
  on feeding_logs for insert
  with check (
    household_id in (
      select household_id from members where user_id = auth.uid()
    )
  );
