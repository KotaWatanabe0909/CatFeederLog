create table invites (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade not null,
  token        text unique not null default encode(gen_random_bytes(24), 'base64url'),
  created_at   timestamptz not null default now(),
  expires_at   timestamptz not null default now() + interval '7 days',
  used_at      timestamptz
);

alter table invites enable row level security;

-- household members can create invite tokens
create policy "household members can create invites"
  on invites for insert
  with check (
    household_id in (
      select household_id from members where user_id = auth.uid()
    )
  );

-- household members can read their own invites
create policy "household members can read invites"
  on invites for select
  using (
    household_id in (
      select household_id from members where user_id = auth.uid()
    )
  );

-- anyone authenticated can read an invite by token (to join)
create policy "anyone can read valid invite by token"
  on invites for select
  using (
    used_at is null and expires_at > now()
  );
