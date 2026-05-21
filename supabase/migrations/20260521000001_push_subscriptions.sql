create table push_subscriptions (
  id           uuid primary key default gen_random_uuid(),
  member_id    uuid references members(id) on delete cascade not null,
  household_id uuid references households(id) on delete cascade not null,
  endpoint     text not null,
  p256dh       text not null,
  auth         text not null,
  created_at   timestamptz not null default now(),
  unique (member_id, endpoint)
);

alter table push_subscriptions enable row level security;

-- members can manage their own subscriptions
create policy "members can manage own push subscriptions"
  on push_subscriptions for all
  using (
    member_id in (
      select id from members where user_id = auth.uid()
    )
  )
  with check (
    member_id in (
      select id from members where user_id = auth.uid()
    )
  );
