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
    where source = 'sproutscout_seed_v1'
  ),
  18,
  'seed creates 18 local place fixtures'
);

select pg_temp.assert_eq(
  (
    select count(*)
    from public.events
    where source = 'sproutscout_seed_v1'
  ),
  3,
  'seed creates 3 local event fixtures'
);

select pg_temp.assert_eq(
  (
    select count(*)
    from public.places
    where source = 'sproutscout_seed_v1'
      and is_active
  ),
  18,
  'all seed places are active curated reads'
);

select pg_temp.assert_eq(
  (
    select count(*)
    from public.places
    where source = 'sproutscout_seed_v1'
      and source_place_id is not null
      and manually_reviewed_at is not null
      and verification_notes is not null
      and jsonb_typeof(amenities) = 'object'
  ),
  18,
  'seed places include provenance, freshness, and amenity metadata'
);

select pg_temp.assert_eq(
  (
    select count(*)
    from public.events
    where source = 'sproutscout_seed_v1'
      and source_event_id is not null
      and source_retrieved_at is not null
      and status = 'scheduled'
  ),
  3,
  'seed events include provenance, freshness, and scheduled status'
);

select pg_temp.assert_eq(
  (
    select count(*)
    from public.places
    where source = 'sproutscout_seed_v1'
      and (
        name ilike '%child name%'
        or address_text ilike '%home address%'
        or coalesce(description, '') ilike '%medical%'
      )
  ),
  0,
  'seed places avoid obvious sensitive placeholder data'
);
