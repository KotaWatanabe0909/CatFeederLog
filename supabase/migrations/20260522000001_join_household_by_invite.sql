do $$
begin
  if not exists (
    select 1
    from members
    group by household_id, user_id
    having count(*) > 1
  ) then
    create unique index if not exists members_household_user_unique
      on members (household_id, user_id);
  else
    raise notice 'members_household_user_unique was not created because duplicate memberships exist';
  end if;
end $$;

create or replace function public.join_household_by_invite(
  p_token text,
  p_display_name text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_invite record;
  v_membership record;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  select id, household_id
    into v_invite
  from invites
  where token = p_token
    and used_at is null
    and expires_at > now()
  for update;

  if not found then
    raise exception 'invite is invalid or expired';
  end if;

  select id, household_id
    into v_membership
  from members
  where household_id = v_invite.household_id
    and user_id = v_user_id;

  if found then
    return v_membership.household_id;
  end if;

  insert into members (household_id, user_id, display_name)
  values (v_invite.household_id, v_user_id, coalesce(nullif(trim(p_display_name), ''), 'メンバー'));

  update invites
  set used_at = now()
  where id = v_invite.id;

  return v_invite.household_id;
end;
$$;

grant execute on function public.join_household_by_invite(text, text) to authenticated;
