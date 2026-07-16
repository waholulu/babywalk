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

select pg_temp.assert_eq(
  (
    select count(*)
    from public.places
    where source = 'sproutscout_pilot_20260716'
  ),
  69,
  'pilot import creates 69 curated places'
);

select pg_temp.assert_eq(
  (
    select count(*)
    from public.places
    where source = 'sproutscout_pilot_20260716'
      and is_active
  ),
  69,
  'all pilot places are active curated reads'
);

select pg_temp.assert_eq(
  (
    select count(*)
    from public.places
    where source = 'sproutscout_pilot_20260716'
      and source_place_id is not null
      and website_url is not null
      and manually_reviewed_at is not null
      and verification_notes is not null
      and jsonb_typeof(amenities) = 'object'
  ),
  69,
  'pilot places include source and freshness metadata'
);

select pg_temp.assert_eq(
  (
    select count(distinct category)
    from public.places
    where source = 'sproutscout_pilot_20260716'
  ),
  8,
  'pilot places cover expected category variety'
);

select pg_temp.assert_eq(
  (
    select count(*)
    from public.places
    where source = 'sproutscout_pilot_20260716'
      and (
        name ilike '%child name%'
        or address_text ilike '%home address%'
        or coalesce(description, '') ilike '%medical%'
        or verification_notes ilike '%service_role%'
        or verification_notes ilike '%password=%'
        or verification_notes ilike '%api_key=%'
      )
  ),
  0,
  'pilot places avoid obvious sensitive data and secrets'
);

set role anon;

select pg_temp.assert_eq(
  (
    select count(*)
    from public.places
    where source = 'sproutscout_pilot_20260716'
      and is_active
  ),
  69,
  'anon role can read active pilot places'
);

reset role;
