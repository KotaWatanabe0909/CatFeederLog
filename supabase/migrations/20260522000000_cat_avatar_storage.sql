alter table cats add column if not exists avatar_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cat-avatars',
  'cat-avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'cat avatars are publicly readable'
  ) then
    create policy "cat avatars are publicly readable"
      on storage.objects for select
      using (bucket_id = 'cat-avatars');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'household members can upload cat avatars'
  ) then
    create policy "household members can upload cat avatars"
      on storage.objects for insert
      with check (
        bucket_id = 'cat-avatars'
        and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        and exists (
          select 1
          from cats
          where cats.id = ((storage.foldername(name))[1])::uuid
            and cats.deleted_at is null
            and cats.household_id in (
              select household_id from members where user_id = auth.uid()
            )
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'household members can update cat avatars'
  ) then
    create policy "household members can update cat avatars"
      on storage.objects for update
      using (
        bucket_id = 'cat-avatars'
        and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        and exists (
          select 1
          from cats
          where cats.id = ((storage.foldername(name))[1])::uuid
            and cats.deleted_at is null
            and cats.household_id in (
              select household_id from members where user_id = auth.uid()
            )
        )
      )
      with check (
        bucket_id = 'cat-avatars'
        and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        and exists (
          select 1
          from cats
          where cats.id = ((storage.foldername(name))[1])::uuid
            and cats.deleted_at is null
            and cats.household_id in (
              select household_id from members where user_id = auth.uid()
            )
        )
      );
  end if;
end $$;
