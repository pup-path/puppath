\set ON_ERROR_STOP on
-- 1. Jonathan signs in: invite becomes membership
insert into auth.users (id, email) values ('11111111-1111-1111-1111-111111111111', 'Jonathan.P.Moody@gmail.com');
select 'member created' as check, count(*) = 1 as ok from members where id = '11111111-1111-1111-1111-111111111111';

-- 2. Jen signs in before her invite exists, then claims it
insert into auth.users (id, email) values ('22222222-2222-2222-2222-222222222222', 'jen@example.com');
select 'no member yet' as check, count(*) = 0 as ok from members where id = '22222222-2222-2222-2222-222222222222';
insert into member_invites (email, breeder_id, full_name, role) select 'jen@example.com', id, 'Jen', 'owner' from breeders where slug='nbg';
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
select 'claim_invite' as check, claim_invite() as ok;
select 'jen is member' as check, count(*) = 1 as ok from members where id = '22222222-2222-2222-2222-222222222222';

-- 3. Public enquiry (anon)
reset request.jwt.claim.sub;
select submit_enquiry('nbg', 'Sarah', 'Thompson', 'sarah@example.com', '0400000000', 'Dee Why', 'instagram', 'Hi, do you have any puppies coming up?') as app_id \gset
select 'enquiry stage' as check, stage = 'enquiry' as ok from applications where id = :'app_id';
select 'enquiry logged' as check, count(*) = 2 as ok from activities where application_id = :'app_id';

-- 4. Same person submits the full application: upgrades the same record
select submit_application('nbg', 'Sarah', 'Thompson', 'SARAH@example.com', null, 'Dee Why', 'NSW', '2099', 'website',
  'female', array['apricot','cream'], 'F1b', 'next_litter', null,
  '{"household":"couple","children":"none","other_pets":"one cat","yard":"medium, fully fenced","hours_alone":"3","experience":"had a cavoodle"}'::jsonb,
  '{"why_groodle":"temperament"}'::jsonb) as app_id2 \gset
select 'same application' as check, :'app_id' = :'app_id2' as ok;
select 'applied stage' as check, stage = 'applied' and submitted_at is not null as ok from applications where id = :'app_id';
select 'one person' as check, count(*) = 1 as ok from people where lower(email) = 'sarah@example.com';

-- 5. Jen works the pipeline
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
update applications set stage = 'reviewing' where id = :'app_id';
update applications set stage = 'approved' where id = :'app_id';
select 'approved stamps' as check, approved_at is not null and deposit_requested_at is not null as ok from applications where id = :'app_id';
update applications set deposit_received_at = now(), deposit_amount = 500 where id = :'app_id';
select 'deposit -> waitlisted #1' as check, stage = 'waitlisted' and waitlist_position = 1 as ok from applications where id = :'app_id';

-- second applicant straight to waitlist
select submit_enquiry('nbg', 'Mike', 'R', 'mike@example.com', null, 'Manly', 'website', 'Keen on a male') as app2 \gset
update applications set stage = 'waitlisted' where id = :'app2';
select 'second waitlisted #2' as check, waitlist_position = 2 as ok from applications where id = :'app2';

-- 6. Litter and puppies
insert into litters (breeder_id, code, status) select id, 'Maple x Teddy 2026', 'born' from breeders where slug='nbg' returning id as litter_id \gset
insert into puppies (breeder_id, litter_id, collar_colour, sex, colour) select breeder_id, id, 'Pink', 'female', 'Apricot' from litters where id = :'litter_id' returning id as pup1 \gset
insert into puppies (breeder_id, litter_id, collar_colour, sex, colour) select breeder_id, id, 'Blue', 'male', 'Cream' from litters where id = :'litter_id' returning id as pup2 \gset

-- 7. Offer Pink to Sarah
insert into allocations (breeder_id, puppy_id, application_id) select breeder_id, :'pup1', :'app_id' from litters where id = :'litter_id' returning id as alloc1 \gset
select 'puppy matched' as check, status = 'matched' as ok from puppies where id = :'pup1';
select 'application matched' as check, stage = 'matched' and waitlist_position is null as ok from applications where id = :'app_id';
select 'allocation logged' as check, count(*) = 1 as ok from activities where application_id = :'app_id' and type = 'allocation';

-- second active allocation for same puppy must fail
\set ON_ERROR_STOP off
insert into allocations (breeder_id, puppy_id, application_id) select breeder_id, :'pup1', :'app2' from litters where id = :'litter_id';
\set ON_ERROR_STOP on
select 'unique guard held' as check, count(*) = 1 as ok from allocations where puppy_id = :'pup1';

-- 8. Sarah declines, goes back to waitlist, puppy available again
update allocations set status = 'declined' where id = :'alloc1';
select 'puppy available again' as check, status = 'available' as ok from puppies where id = :'pup1';
select 'back to waitlisted' as check, stage = 'waitlisted' and waitlist_position is not null as ok from applications where id = :'app_id';

-- 9. Offer Blue to Mike, accept, collect
insert into allocations (breeder_id, puppy_id, application_id) select breeder_id, :'pup2', :'app2' from litters where id = :'litter_id' returning id as alloc2 \gset
update allocations set status = 'accepted' where id = :'alloc2';
update allocations set status = 'confirmed' where id = :'alloc2';
update allocations set status = 'collected' where id = :'alloc2';
select 'puppy placed' as check, status = 'placed' as ok from puppies where id = :'pup2';
select 'application placed' as check, stage = 'placed' as ok from applications where id = :'app2';

-- 10. Timeline for Sarah
select type, left(body, 60) as body from activities where application_id = :'app_id' order by occurred_at, created_at;
