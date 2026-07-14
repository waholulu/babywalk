create or replace function pg_temp.assert_eq(
  actual bigint,
  expected bigint,
  message text
)
returns void
language plpgsql
as $$
begin
  if actual is distinct from expected then
    raise exception '%: expected %, got %', message, expected, actual;
  end if;
end;
$$;

create or replace function pg_temp.assert_raises(
  statement text,
  message text
)
returns void
language plpgsql
as $$
declare
  did_raise boolean := false;
begin
  begin
    execute statement;
  exception
    when others then
      did_raise := true;
  end;

  if not did_raise then
    raise exception '%: expected statement to fail', message;
  end if;
end;
$$;

insert into auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-0000-0000-0000000000a1',
    'authenticated',
    'authenticated',
    'rls-user-a@example.test',
    '',
    now(),
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-0000000000b2',
    'authenticated',
    'authenticated',
    'rls-user-b@example.test',
    '',
    now(),
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  )
on conflict (id) do nothing;

insert into public.places (
  id,
  source,
  source_place_id,
  name,
  category,
  latitude,
  longitude,
  indoor_outdoor,
  price_band,
  is_active
)
values
  (
    '10000000-0000-0000-0000-000000000001',
    'rls_test',
    'active-place',
    'Active Test Place',
    'library',
    40.735000,
    -74.172000,
    'indoor',
    'free',
    true
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'rls_test',
    'inactive-place',
    'Inactive Test Place',
    'park',
    40.735000,
    -74.172000,
    'outdoor',
    'free',
    false
  )
on conflict (id) do nothing;

insert into public.events (
  id,
  place_id,
  source,
  source_event_id,
  title,
  starts_at,
  ends_at,
  status
)
values
  (
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'rls_test',
    'scheduled-event',
    'Scheduled Test Event',
    '2027-01-01 15:00:00+00',
    '2027-01-01 16:00:00+00',
    'scheduled'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000001',
    'rls_test',
    'cancelled-event',
    'Cancelled Test Event',
    '2027-01-01 15:00:00+00',
    '2027-01-01 16:00:00+00',
    'cancelled'
  )
on conflict (id) do nothing;

insert into public.profiles (user_id, home_area_text)
values
  ('00000000-0000-0000-0000-0000000000a1', 'Montclair, NJ'),
  ('00000000-0000-0000-0000-0000000000b2', 'Hoboken, NJ')
on conflict (user_id) do nothing;

insert into public.child_preferences (id, user_id, age_months, interests)
values
  (
    '30000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-0000000000a1',
    18,
    array['story time']
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-0000000000b2',
    30,
    array['playground']
  )
on conflict (id) do nothing;

insert into public.saved_places (user_id, place_id)
values
  (
    '00000000-0000-0000-0000-0000000000a1',
    '10000000-0000-0000-0000-000000000001'
  ),
  (
    '00000000-0000-0000-0000-0000000000b2',
    '10000000-0000-0000-0000-000000000001'
  )
on conflict (user_id, place_id) do nothing;

insert into public.visits (id, user_id, place_id, visited_on, rating)
values
  (
    '40000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-0000000000a1',
    '10000000-0000-0000-0000-000000000001',
    '2026-07-14',
    5
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-0000000000b2',
    '10000000-0000-0000-0000-000000000001',
    '2026-07-14',
    4
  )
on conflict (id) do nothing;

insert into public.place_feedback (id, user_id, place_id, feedback_type, details)
values
  (
    '50000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-0000000000a1',
    '10000000-0000-0000-0000-000000000001',
    'incorrect_hours',
    'RLS test feedback A'
  ),
  (
    '50000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-0000000000b2',
    '10000000-0000-0000-0000-000000000001',
    'wrong_price',
    'RLS test feedback B'
  )
on conflict (id) do nothing;

insert into public.recommendation_feedback (
  id,
  user_id,
  candidate_id,
  action,
  reason_code
)
values
  (
    '60000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-0000000000a1',
    '10000000-0000-0000-0000-000000000001',
    'useful',
    'AGE_MATCH'
  ),
  (
    '60000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-0000000000b2',
    '10000000-0000-0000-0000-000000000001',
    'dismissed',
    'TOO_FAR'
  )
on conflict (id) do nothing;

begin;
  set local role anon;
  select set_config('request.jwt.claim.role', 'anon', true);
  select set_config('request.jwt.claim.sub', '', true);

  select pg_temp.assert_eq(
    (select count(*) from public.places where source = 'rls_test'),
    1,
    'anonymous users can read only active places'
  );
  select pg_temp.assert_eq(
    (select count(*) from public.events where source = 'rls_test'),
    1,
    'anonymous users can read only scheduled events'
  );
  select pg_temp.assert_raises(
    'select count(*) from public.profiles',
    'anonymous users cannot read profiles'
  );
  insert into public.recommendation_feedback (
    id,
    user_id,
    candidate_id,
    action
  )
  values (
    '60000000-0000-0000-0000-000000000003',
    null,
    '10000000-0000-0000-0000-000000000001',
    'viewed'
  );
  select pg_temp.assert_raises(
    $statement$
      insert into public.recommendation_feedback (
        user_id,
        candidate_id,
        action
      )
      values (
        '00000000-0000-0000-0000-0000000000a1',
        '10000000-0000-0000-0000-000000000001',
        'viewed'
      )
    $statement$,
    'anonymous users cannot attach recommendation feedback to a user'
  );
rollback;

begin;
  set local role authenticated;
  select set_config('request.jwt.claim.role', 'authenticated', true);
  select set_config(
    'request.jwt.claim.sub',
    '00000000-0000-0000-0000-0000000000a1',
    true
  );

  select pg_temp.assert_eq(
    (select count(*) from public.profiles),
    1,
    'user A reads only their profile'
  );
  select pg_temp.assert_eq(
    (select count(*) from public.profiles where user_id = '00000000-0000-0000-0000-0000000000b2'),
    0,
    'user A cannot read user B profile'
  );
  update public.profiles
  set default_drive_minutes = 30
  where user_id = '00000000-0000-0000-0000-0000000000a1';
  with updated as (
    update public.profiles
    set default_drive_minutes = 45
    where user_id = '00000000-0000-0000-0000-0000000000b2'
    returning 1
  )
  select pg_temp.assert_eq(
    (select count(*) from updated),
    0,
    'user A cannot update user B profile'
  );
  select pg_temp.assert_raises(
    $statement$
      insert into public.child_preferences (
        user_id,
        age_months
      )
      values (
        '00000000-0000-0000-0000-0000000000b2',
        12
      )
    $statement$,
    'user A cannot insert child preferences for user B'
  );
  select pg_temp.assert_eq(
    (select count(*) from public.child_preferences),
    1,
    'user A reads only their child preferences'
  );
  select pg_temp.assert_eq(
    (select count(*) from public.saved_places),
    1,
    'user A reads only their saved places'
  );
  select pg_temp.assert_eq(
    (select count(*) from public.visits),
    1,
    'user A reads only their visits'
  );
  select pg_temp.assert_eq(
    (select count(*) from public.place_feedback),
    1,
    'user A reads only their place feedback'
  );
  select pg_temp.assert_raises(
    $statement$
      update public.place_feedback
      set status = 'resolved'
      where id = '50000000-0000-0000-0000-000000000001'
    $statement$,
    'mobile users cannot update place feedback moderation status'
  );
  insert into public.place_feedback (
    id,
    user_id,
    place_id,
    feedback_type,
    details
  )
  values (
    '50000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-0000000000a1',
    '10000000-0000-0000-0000-000000000001',
    'other',
    'User A can submit own feedback'
  );
  select pg_temp.assert_eq(
    (select count(*) from public.recommendation_feedback),
    1,
    'user A reads only their recommendation feedback'
  );
  select pg_temp.assert_raises(
    $statement$
      insert into public.recommendation_feedback (
        user_id,
        candidate_id,
        action
      )
      values (
        '00000000-0000-0000-0000-0000000000b2',
        '10000000-0000-0000-0000-000000000001',
        'viewed'
      )
    $statement$,
    'user A cannot insert recommendation feedback for user B'
  );
rollback;

begin;
  set local role authenticated;
  select set_config('request.jwt.claim.role', 'authenticated', true);
  select set_config(
    'request.jwt.claim.sub',
    '00000000-0000-0000-0000-0000000000b2',
    true
  );

  select pg_temp.assert_eq(
    (select count(*) from public.profiles where user_id = '00000000-0000-0000-0000-0000000000a1'),
    0,
    'user B cannot read user A profile'
  );
  select pg_temp.assert_eq(
    (select count(*) from public.place_feedback where id = '50000000-0000-0000-0000-000000000001'),
    0,
    'user B cannot read user A place feedback'
  );
  with deleted as (
    delete from public.visits
    where id = '40000000-0000-0000-0000-000000000001'
    returning 1
  )
  select pg_temp.assert_eq(
    (select count(*) from deleted),
    0,
    'user B cannot delete user A visits'
  );
rollback;
