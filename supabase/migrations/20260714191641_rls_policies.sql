grant usage on schema public to anon, authenticated;

grant select on public.places to anon, authenticated;
grant select on public.events to anon, authenticated;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.child_preferences to authenticated;
grant select, insert, update, delete on public.saved_places to authenticated;
grant select, insert, update, delete on public.visits to authenticated;

grant select, insert on public.place_feedback to authenticated;

grant insert on public.recommendation_feedback to anon;
grant select, insert on public.recommendation_feedback to authenticated;

create policy places_read_active
on public.places
for select
to anon, authenticated
using (is_active);

create policy events_read_scheduled
on public.events
for select
to anon, authenticated
using (status = 'scheduled');

create policy profiles_read_own
on public.profiles
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy profiles_insert_own
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy profiles_update_own
on public.profiles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy profiles_delete_own
on public.profiles
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy child_preferences_read_own
on public.child_preferences
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy child_preferences_insert_own
on public.child_preferences
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy child_preferences_update_own
on public.child_preferences
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy child_preferences_delete_own
on public.child_preferences
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy saved_places_read_own
on public.saved_places
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy saved_places_insert_own
on public.saved_places
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy saved_places_delete_own
on public.saved_places
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy visits_read_own
on public.visits
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy visits_insert_own
on public.visits
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy visits_update_own
on public.visits
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy visits_delete_own
on public.visits
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy place_feedback_read_own
on public.place_feedback
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy place_feedback_insert_own
on public.place_feedback
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy recommendation_feedback_insert_anonymous
on public.recommendation_feedback
for insert
to anon
with check (user_id is null);

create policy recommendation_feedback_read_own
on public.recommendation_feedback
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy recommendation_feedback_insert_own
on public.recommendation_feedback
for insert
to authenticated
with check ((select auth.uid()) = user_id);
