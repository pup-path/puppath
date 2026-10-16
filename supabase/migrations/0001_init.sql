-- PupPath MVP schema v1
-- Applied to the live project on 16 Oct 2026 via the Supabase connector. Do not re-run.
-- Source of truth for the design: docs/01-data-model-and-build-order.md

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type application_stage as enum (
  'enquiry', 'applied', 'reviewing', 'approved', 'waitlisted', 'matched', 'placed',
  'declined', 'withdrawn', 'on_hold'
);
create type person_source as enum ('website', 'instagram', 'facebook', 'referral', 'whatsapp', 'other');
create type sex_preference as enum ('male', 'female', 'any');
create type timing_preference as enum ('asap', 'next_litter', 'flexible', 'specific');
create type dog_sex as enum ('male', 'female');
create type dog_status as enum ('active', 'retired', 'deceased');
create type litter_status as enum ('planned', 'confirmed', 'born', 'weaning', 'ready', 'complete');
create type puppy_status as enum ('available', 'held', 'matched', 'placed', 'deceased');
create type allocation_status as enum ('offered', 'accepted', 'declined', 'confirmed', 'collected', 'cancelled');
create type activity_type as enum ('note', 'message', 'call', 'email', 'meeting', 'stage_change', 'allocation', 'system');
create type activity_direction as enum ('in', 'out');
create type activity_channel as enum ('whatsapp', 'email', 'sms', 'phone', 'in_person', 'web');
create type media_owner_type as enum ('puppy', 'litter', 'dog', 'application', 'litter_update');
create type member_role as enum ('owner', 'staff');

-- ---------------------------------------------------------------------------
-- Tenancy
-- ---------------------------------------------------------------------------
create table breeders (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  abn text,
  email text,
  phone text,
  logo_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table members (
  id uuid primary key references auth.users(id) on delete cascade,
  breeder_id uuid not null references breeders(id) on delete cascade,
  full_name text,
  role member_role not null default 'staff',
  created_at timestamptz not null default now()
);
create index on members (breeder_id);

-- Emails allowed to join a breeder. Converted to a member on first sign-in.
create table member_invites (
  email text primary key,
  breeder_id uuid not null references breeders(id) on delete cascade,
  full_name text,
  role member_role not null default 'staff',
  created_at timestamptz not null default now()
);

-- Breeder ids the current user belongs to. security definer so RLS on members
-- does not recurse.
create or replace function my_breeder_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select breeder_id from members where id = auth.uid()
$$;

-- Convert an invite into a membership when the user first signs in.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  inv member_invites%rowtype;
begin
  select * into inv from member_invites where lower(email) = lower(new.email);
  if found then
    insert into members (id, breeder_id, full_name, role)
    values (new.id, inv.breeder_id, inv.full_name, inv.role)
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- For a user who signed in before their invite existed: call from the app to
-- turn a matching invite into a membership. Returns true if a membership exists.
create or replace function claim_invite()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  u_email text;
  inv member_invites%rowtype;
begin
  if auth.uid() is null then return false; end if;
  if exists (select 1 from members where id = auth.uid()) then return true; end if;
  select email into u_email from auth.users where id = auth.uid();
  select * into inv from member_invites where lower(email) = lower(u_email);
  if not found then return false; end if;
  insert into members (id, breeder_id, full_name, role)
  values (auth.uid(), inv.breeder_id, inv.full_name, inv.role)
  on conflict (id) do nothing;
  return true;
end;
$$;
grant execute on function claim_invite() to authenticated;

-- ---------------------------------------------------------------------------
-- People and applications
-- ---------------------------------------------------------------------------
create table people (
  id uuid primary key default gen_random_uuid(),
  breeder_id uuid not null references breeders(id) on delete cascade,
  first_name text not null,
  last_name text,
  email text,
  phone text,
  suburb text,
  state text,
  postcode text,
  source person_source,
  referred_by text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on people (breeder_id);
create unique index people_breeder_email_key on people (breeder_id, lower(email)) where email is not null;

create table applications (
  id uuid primary key default gen_random_uuid(),
  breeder_id uuid not null references breeders(id) on delete cascade,
  person_id uuid not null references people(id) on delete cascade,
  stage application_stage not null default 'enquiry',
  waitlist_position integer,
  enquiry_message text,
  submitted_at timestamptz,
  approved_at timestamptz,
  deposit_requested_at timestamptz,
  deposit_received_at timestamptz,
  deposit_amount numeric(10,2),
  closed_at timestamptz,
  close_reason text,
  preferred_sex sex_preference default 'any',
  preferred_colours text[] not null default '{}',
  preferred_generation text,
  timing timing_preference default 'flexible',
  timing_note text,
  home jsonb not null default '{}'::jsonb,
  answers jsonb not null default '{}'::jsonb,
  internal_rating smallint check (internal_rating between 1 and 5),
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on applications (breeder_id, stage);
create index on applications (person_id);
create index on applications (breeder_id, waitlist_position) where stage = 'waitlisted';

-- ---------------------------------------------------------------------------
-- Dogs, litters, puppies
-- ---------------------------------------------------------------------------
create table dogs (
  id uuid primary key default gen_random_uuid(),
  breeder_id uuid not null references breeders(id) on delete cascade,
  name text not null,
  registered_name text,
  call_name text,
  sex dog_sex not null,
  breed_type text,
  generation text,
  dob date,
  colour text,
  microchip text,
  sire_id uuid references dogs(id) on delete set null,
  dam_id uuid references dogs(id) on delete set null,
  is_external boolean not null default false,
  owner_person_id uuid references people(id) on delete set null,
  status dog_status not null default 'active',
  photo_path text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on dogs (breeder_id);

create table litters (
  id uuid primary key default gen_random_uuid(),
  breeder_id uuid not null references breeders(id) on delete cascade,
  code text not null,
  dam_id uuid references dogs(id) on delete set null,
  sire_id uuid references dogs(id) on delete set null,
  mating_date date,
  due_date date,
  whelped_date date,
  go_home_date date,
  status litter_status not null default 'planned',
  expected_count integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (breeder_id, code)
);
create index on litters (breeder_id, status);

create table puppies (
  id uuid primary key default gen_random_uuid(),
  breeder_id uuid not null references breeders(id) on delete cascade,
  litter_id uuid not null references litters(id) on delete cascade,
  collar_colour text,
  temp_name text,
  sex dog_sex,
  colour text,
  birth_weight_g integer,
  microchip text,
  status puppy_status not null default 'available',
  temperament_notes text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on puppies (litter_id);
create index on puppies (breeder_id, status);

create table puppy_weights (
  id uuid primary key default gen_random_uuid(),
  breeder_id uuid not null references breeders(id) on delete cascade,
  puppy_id uuid not null references puppies(id) on delete cascade,
  recorded_on date not null default current_date,
  weight_g integer not null,
  notes text,
  created_at timestamptz not null default now()
);
create index on puppy_weights (puppy_id, recorded_on);

create table allocations (
  id uuid primary key default gen_random_uuid(),
  breeder_id uuid not null references breeders(id) on delete cascade,
  puppy_id uuid not null references puppies(id) on delete cascade,
  application_id uuid not null references applications(id) on delete cascade,
  status allocation_status not null default 'offered',
  offered_at timestamptz not null default now(),
  responded_at timestamptz,
  collected_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on allocations (application_id);
create index on allocations (puppy_id);
-- One live allocation per puppy and per application.
create unique index allocations_one_active_per_puppy on allocations (puppy_id) where status in ('offered', 'accepted', 'confirmed');
create unique index allocations_one_active_per_application on allocations (application_id) where status in ('offered', 'accepted', 'confirmed');

create table litter_updates (
  id uuid primary key default gen_random_uuid(),
  breeder_id uuid not null references breeders(id) on delete cascade,
  litter_id uuid not null references litters(id) on delete cascade,
  week_number integer,
  title text not null,
  body text,
  published_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on litter_updates (litter_id);

-- ---------------------------------------------------------------------------
-- Activities (the comms timeline) and media
-- ---------------------------------------------------------------------------
create table activities (
  id uuid primary key default gen_random_uuid(),
  breeder_id uuid not null references breeders(id) on delete cascade,
  person_id uuid not null references people(id) on delete cascade,
  application_id uuid references applications(id) on delete set null,
  litter_id uuid references litters(id) on delete set null,
  puppy_id uuid references puppies(id) on delete set null,
  type activity_type not null default 'note',
  direction activity_direction,
  channel activity_channel,
  body text,
  occurred_at timestamptz not null default now(),
  created_by uuid references members(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index on activities (person_id, occurred_at desc);
create index on activities (application_id, occurred_at desc);

create table media (
  id uuid primary key default gen_random_uuid(),
  breeder_id uuid not null references breeders(id) on delete cascade,
  owner_type media_owner_type not null,
  owner_id uuid not null,
  storage_path text not null,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index on media (owner_type, owner_id, sort_order);

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['breeders','people','applications','dogs','litters','puppies','allocations','litter_updates']
  loop
    execute format('create trigger %I_updated_at before update on %I for each row execute function set_updated_at()', t, t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Application stage logic
-- ---------------------------------------------------------------------------

-- Before update: stamp dates, auto-advance on deposit, manage waitlist position.
create or replace function applications_before_update()
returns trigger language plpgsql as $$
begin
  -- Deposit recorded while approved -> waitlisted.
  if new.deposit_received_at is not null and old.deposit_received_at is null and new.stage = 'approved' then
    new.stage := 'waitlisted';
  end if;

  if new.stage <> old.stage then
    if new.stage = 'applied' and new.submitted_at is null then new.submitted_at := now(); end if;
    if new.stage = 'approved' then
      new.approved_at := coalesce(new.approved_at, now());
      new.deposit_requested_at := coalesce(new.deposit_requested_at, now());
    end if;
    if new.stage in ('declined','withdrawn') then new.closed_at := coalesce(new.closed_at, now()); end if;
    if old.stage in ('declined','withdrawn') and new.stage not in ('declined','withdrawn') then
      new.closed_at := null; new.close_reason := null;
    end if;

    -- Waitlist position: assign on entry, clear on exit.
    if new.stage = 'waitlisted' and old.stage <> 'waitlisted' then
      select coalesce(max(waitlist_position), 0) + 1 into new.waitlist_position
        from applications where breeder_id = new.breeder_id and stage = 'waitlisted' and id <> new.id;
    elsif new.stage <> 'waitlisted' then
      new.waitlist_position := null;
    end if;
  end if;
  return new;
end;
$$;
create trigger applications_before_update before update on applications
  for each row execute function applications_before_update();

-- After update: log the stage change on the timeline.
create or replace function applications_log_stage_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.stage <> old.stage then
    insert into activities (breeder_id, person_id, application_id, type, body, created_by, metadata)
    values (
      new.breeder_id, new.person_id, new.id, 'stage_change',
      format('Stage changed from %s to %s', replace(old.stage::text, '_', ' '), replace(new.stage::text, '_', ' ')),
      (select id from members where id = auth.uid()),
      jsonb_build_object('from', old.stage, 'to', new.stage, 'reason', new.close_reason)
    );
  end if;
  return new;
end;
$$;
create trigger applications_log_stage_change after update on applications
  for each row execute function applications_log_stage_change();

-- New application: log creation.
create or replace function applications_log_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into activities (breeder_id, person_id, application_id, type, body, created_by, metadata)
  values (new.breeder_id, new.person_id, new.id, 'system',
          format('Application created at stage %s', replace(new.stage::text, '_', ' ')),
          (select id from members where id = auth.uid()),
          jsonb_build_object('to', new.stage));
  return new;
end;
$$;
create trigger applications_log_insert after insert on applications
  for each row execute function applications_log_insert();

-- ---------------------------------------------------------------------------
-- Allocation logic: keep puppy status and application stage in step, log it.
-- ---------------------------------------------------------------------------
create or replace function allocations_sync()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  active_exists boolean;
  app_stage application_stage;
  pup record;
  verb text;
begin
  if tg_op = 'UPDATE' and new.status <> old.status then
    new.responded_at := case when new.status in ('accepted','declined') then coalesce(new.responded_at, now()) else new.responded_at end;
    if new.status = 'collected' then new.collected_at := coalesce(new.collected_at, now()); end if;
  end if;

  -- Timeline entry
  select p.collar_colour, p.temp_name, l.code into pup
    from puppies p join litters l on l.id = p.litter_id where p.id = new.puppy_id;
  verb := case new.status
    when 'offered' then 'offered'
    when 'accepted' then 'accepted'
    when 'declined' then 'declined'
    when 'confirmed' then 'confirmed'
    when 'collected' then 'collected'
    when 'cancelled' then 'cancelled' end;
  insert into activities (breeder_id, person_id, application_id, puppy_id, type, body, created_by, metadata)
  select new.breeder_id, a.person_id, new.application_id, new.puppy_id, 'allocation',
         format('%s %s (%s)', initcap(verb), coalesce(pup.temp_name, pup.collar_colour || ' collar', 'puppy'), pup.code),
         (select id from members where id = auth.uid()),
         jsonb_build_object('allocation_id', new.id, 'status', new.status)
    from applications a where a.id = new.application_id;


  -- Puppy status
  if new.status in ('offered','accepted','confirmed') then
    update puppies set status = 'matched' where id = new.puppy_id and status <> 'placed';
  elsif new.status = 'collected' then
    update puppies set status = 'placed' where id = new.puppy_id;
  else
    select exists(select 1 from allocations where puppy_id = new.puppy_id and id <> new.id and status in ('offered','accepted','confirmed')) into active_exists;
    if not active_exists then
      update puppies set status = 'available' where id = new.puppy_id and status = 'matched';
    end if;
  end if;

  -- Application stage
  select stage into app_stage from applications where id = new.application_id;
  if new.status in ('offered','accepted','confirmed') and app_stage in ('waitlisted','approved','reviewing','applied') then
    update applications set stage = 'matched' where id = new.application_id;
  elsif new.status = 'collected' then
    update applications set stage = 'placed' where id = new.application_id;
  elsif new.status in ('declined','cancelled') and app_stage = 'matched' then
    select exists(select 1 from allocations where application_id = new.application_id and id <> new.id and status in ('offered','accepted','confirmed')) into active_exists;
    if not active_exists then
      update applications set stage = 'waitlisted' where id = new.application_id;
    end if;
  end if;

  return new;
end;
$$;
create trigger allocations_sync after insert or update of status on allocations
  for each row execute function allocations_sync();

-- ---------------------------------------------------------------------------
-- Public intake (anon). Breeder resolved by slug so no ids leak into the form.
-- ---------------------------------------------------------------------------
create or replace function find_or_create_person(
  p_breeder_id uuid, p_first_name text, p_last_name text, p_email text, p_phone text,
  p_suburb text, p_state text, p_postcode text, p_source person_source
) returns uuid language plpgsql security definer set search_path = public as $$
declare pid uuid;
begin
  if p_email is not null then
    select id into pid from people where breeder_id = p_breeder_id and lower(email) = lower(p_email);
  end if;
  if pid is null then
    insert into people (breeder_id, first_name, last_name, email, phone, suburb, state, postcode, source)
    values (p_breeder_id, p_first_name, p_last_name, nullif(p_email,''), nullif(p_phone,''), nullif(p_suburb,''), nullif(p_state,''), nullif(p_postcode,''), p_source)
    returning id into pid;
  else
    update people set
      phone = coalesce(nullif(p_phone,''), phone),
      suburb = coalesce(nullif(p_suburb,''), suburb),
      state = coalesce(nullif(p_state,''), state),
      postcode = coalesce(nullif(p_postcode,''), postcode),
      last_name = coalesce(nullif(p_last_name,''), last_name)
    where id = pid;
  end if;
  return pid;
end;
$$;

create or replace function submit_enquiry(
  breeder_slug text, first_name text, last_name text, email text, phone text,
  suburb text, source person_source, message text
) returns uuid language plpgsql security definer set search_path = public as $$
declare bid uuid; pid uuid; aid uuid;
begin
  select id into bid from breeders where slug = breeder_slug;
  if bid is null then raise exception 'Unknown breeder'; end if;
  if first_name is null or length(trim(first_name)) = 0 then raise exception 'First name required'; end if;
  if email is null or email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Valid email required'; end if;

  pid := find_or_create_person(bid, trim(first_name), nullif(trim(last_name),''), lower(trim(email)), phone, suburb, null, null, source);

  -- Reuse an open enquiry/application for this person rather than stacking duplicates.
  select id into aid from applications
    where person_id = pid and stage not in ('placed','declined','withdrawn')
    order by created_at desc limit 1;
  if aid is null then
    insert into applications (breeder_id, person_id, stage, enquiry_message)
    values (bid, pid, 'enquiry', message) returning id into aid;
  end if;

  insert into activities (breeder_id, person_id, application_id, type, direction, channel, body)
  values (bid, pid, aid, 'message', 'in', 'web', coalesce(message, '(enquiry form submitted, no message)'));
  return aid;
end;
$$;

create or replace function submit_application(
  breeder_slug text, first_name text, last_name text, email text, phone text,
  suburb text, state text, postcode text, source person_source,
  preferred_sex sex_preference, preferred_colours text[], preferred_generation text,
  timing timing_preference, timing_note text, home jsonb, answers jsonb
) returns uuid language plpgsql security definer set search_path = public as $$
declare bid uuid; pid uuid; aid uuid;
begin
  select id into bid from breeders where slug = breeder_slug;
  if bid is null then raise exception 'Unknown breeder'; end if;
  if first_name is null or length(trim(first_name)) = 0 then raise exception 'First name required'; end if;
  if email is null or email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Valid email required'; end if;

  pid := find_or_create_person(bid, trim(first_name), nullif(trim(last_name),''), lower(trim(email)), phone, suburb, state, postcode, source);

  select id into aid from applications
    where person_id = pid and stage in ('enquiry')
    order by created_at desc limit 1;

  if aid is null then
    insert into applications (breeder_id, person_id, stage, submitted_at, preferred_sex, preferred_colours, preferred_generation, timing, timing_note, home, answers)
    values (bid, pid, 'applied', now(), coalesce(preferred_sex,'any'), coalesce(preferred_colours,'{}'), preferred_generation, coalesce(timing,'flexible'), timing_note, coalesce(home,'{}'), coalesce(answers,'{}'))
    returning id into aid;
  else
    update applications set
      stage = 'applied', submitted_at = now(),
      preferred_sex = coalesce(submit_application.preferred_sex, applications.preferred_sex),
      preferred_colours = coalesce(submit_application.preferred_colours, applications.preferred_colours),
      preferred_generation = coalesce(submit_application.preferred_generation, applications.preferred_generation),
      timing = coalesce(submit_application.timing, applications.timing),
      timing_note = coalesce(submit_application.timing_note, applications.timing_note),
      home = coalesce(submit_application.home, applications.home),
      answers = coalesce(submit_application.answers, applications.answers)
    where id = aid;
  end if;

  insert into activities (breeder_id, person_id, application_id, type, direction, channel, body)
  values (bid, pid, aid, 'message', 'in', 'web', 'Application form submitted');
  return aid;
end;
$$;

revoke all on function submit_enquiry(text,text,text,text,text,text,person_source,text) from public;
revoke all on function submit_application(text,text,text,text,text,text,text,text,person_source,sex_preference,text[],text,timing_preference,text,jsonb,jsonb) from public;
grant execute on function submit_enquiry(text,text,text,text,text,text,person_source,text) to anon, authenticated;
grant execute on function submit_application(text,text,text,text,text,text,text,text,person_source,sex_preference,text[],text,timing_preference,text,jsonb,jsonb) to anon, authenticated;
revoke all on function find_or_create_person(uuid,text,text,text,text,text,text,text,person_source) from public, anon;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table breeders enable row level security;
alter table members enable row level security;
alter table member_invites enable row level security;
alter table people enable row level security;
alter table applications enable row level security;
alter table dogs enable row level security;
alter table litters enable row level security;
alter table puppies enable row level security;
alter table puppy_weights enable row level security;
alter table allocations enable row level security;
alter table litter_updates enable row level security;
alter table activities enable row level security;
alter table media enable row level security;

create policy breeders_member_read on breeders for select to authenticated using (id in (select my_breeder_ids()));
create policy breeders_owner_update on breeders for update to authenticated
  using (id in (select breeder_id from members where id = auth.uid() and role = 'owner'));

create policy members_same_breeder on members for select to authenticated using (breeder_id in (select my_breeder_ids()));
create policy invites_owner_all on member_invites for all to authenticated
  using (breeder_id in (select breeder_id from members where id = auth.uid() and role = 'owner'))
  with check (breeder_id in (select breeder_id from members where id = auth.uid() and role = 'owner'));

do $$
declare t text;
begin
  foreach t in array array['people','applications','dogs','litters','puppies','puppy_weights','allocations','litter_updates','activities','media']
  loop
    execute format(
      'create policy %I_member_all on %I for all to authenticated using (breeder_id in (select my_breeder_ids())) with check (breeder_id in (select my_breeder_ids()))',
      t, t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Storage: one private bucket, objects live under <breeder_id>/...
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', false, 10485760, array['image/jpeg','image/png','image/webp','image/heic','application/pdf'])
on conflict (id) do nothing;

create policy media_member_read on storage.objects for select to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] in (select my_breeder_ids()::text));
create policy media_member_write on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] in (select my_breeder_ids()::text));
create policy media_member_update on storage.objects for update to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] in (select my_breeder_ids()::text));
create policy media_member_delete on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] in (select my_breeder_ids()::text));

-- ---------------------------------------------------------------------------
-- Seed: Northern Beaches Groodles and the two logins
-- ---------------------------------------------------------------------------
insert into breeders (slug, name) values ('nbg', 'Northern Beaches Groodles');

insert into member_invites (email, breeder_id, full_name, role)
select 'jonathan.p.moody@gmail.com', id, 'Jonathan', 'owner' from breeders where slug = 'nbg';

-- Add Jen with her email before she signs in for the first time:
-- insert into member_invites (email, breeder_id, full_name, role)
-- select 'JEN_EMAIL_HERE', id, 'Jen', 'owner' from breeders where slug = 'nbg';
