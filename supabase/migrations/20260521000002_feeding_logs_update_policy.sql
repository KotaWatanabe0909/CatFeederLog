-- allow household members to update their own feeding logs
create policy "members can update own feeding logs"
  on feeding_logs for update
  using (
    member_id in (
      select id from members where user_id = auth.uid()
    )
  );
