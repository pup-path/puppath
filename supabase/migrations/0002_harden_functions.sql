-- Lock down function execution so only the intended roles can call each one
-- over the REST API. Trigger functions never need to be callable directly.

-- Trigger functions and internal helpers: nobody calls these via RPC.
revoke all on function handle_new_user() from public, anon, authenticated;
revoke all on function set_updated_at() from public, anon, authenticated;
revoke all on function applications_before_update() from public, anon, authenticated;
revoke all on function applications_log_stage_change() from public, anon, authenticated;
revoke all on function applications_log_insert() from public, anon, authenticated;
revoke all on function allocations_sync() from public, anon, authenticated;
revoke all on function find_or_create_person(uuid,text,text,text,text,text,text,text,person_source) from public, anon, authenticated;

-- Used inside RLS policies, so signed-in users need it; anonymous does not.
revoke all on function my_breeder_ids() from public, anon;
grant execute on function my_breeder_ids() to authenticated;

-- Signed-in only.
revoke all on function claim_invite() from public, anon;
grant execute on function claim_invite() to authenticated;

-- Public intake stays callable by anon on purpose (submit_enquiry, submit_application).

-- Pin search_path on the two functions the linter flagged.
alter function set_updated_at() set search_path = public;
alter function applications_before_update() set search_path = public;
