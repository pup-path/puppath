# PupPath MVP: data model and build order

Status: v0.2, 16 Oct 2026. Reconciled against the Trello board (36 stories), the four wireframe screens, the 14-entity data model, the journey maps, the process flows and the tech architecture doc. All five source documents are in `reference/`.

## What the source documents actually cover

The wireframes are four screens: **Dog Profile, Breeding Plan, Litter Timeline, Buyer Portal**. Mapped against the agreed MVP scope:

| MVP scope item | Wireframe? | Source that defines it |
|---|---|---|
| Enquiry and application intake with pipeline | **No** | Trello stories (Submit enquiry, Complete application), Process Flow 1 |
| Waitlist | Partial (Litter Timeline has a "Linked Waitlist" side panel) | Trello (Join waitlist), Process Flow 1 |
| Litters and puppies with allocation | **Yes** (Litter Timeline: puppy grid, linked waitlist, Manage Matching) | Trello (Record litter details, Match puppies to buyers) |
| Comms timeline per applicant | **No** | Trello (View communication history) |
| Dogs (needed as dam/sire) | Yes, but 80% of the screen is deferred scope (DNA, hips, cycles, lineage) | Trello (Create dog profile) |

So three of the four wireframes are mostly deferred scope, and three of the four MVP features have no wireframe. The pipeline, application detail with timeline, waitlist and public form screens need designing. I will build them in the same visual language as the existing wireframes (brand tokens below) and in the same layout grammar (BrandedBox cards, StatusBadge, tabs). The Litter Timeline screen is built close to the wireframe minus the Litter Updates panel (see decisions).

## Decisions carried in

- In-house MVP for Jen and Northern Beaches Groodles. Beta is one real litter cycle. Product review in about a year.
- Stack per the tech architecture doc and Trello Tech Setup list: Next.js (App Router, TypeScript), Supabase (Postgres, Auth magic link, Storage), Tailwind + shadcn/ui, Vercel, GitHub. Doc says Next.js 14; we use whatever is current at scaffold time. React Query from the doc is dropped: server components and server actions cover it.
- Email: Resend (Trello card lists Resend/SendGrid/Supabase; Resend is the cheapest to wire into Next.js). MVP sends two emails only: enquiry confirmation and application confirmation.
- Deferred: health records, breeding readiness, DNA compatibility, heat cycles, breeding plans, breeding calendar, lineage, guardian program, buyer portal, pickup process, contracts, payments, bulk comms, notifications bell, audit log.

## Decisions I'm taking (say if wrong)

1. **Single breeder, multi-tenant shaped.** `breeder_id` on every table, RLS keyed on it. Matches the original architecture.
2. **One record per person per puppy sought: `applications`.** The original model has Person → Application → Waitlist as three tables with their own status fields, which means three states to keep in sync (Person.person_type, Application.status, Waitlist.status). I collapse Application and Waitlist into one `applications` row with one `stage`. Waitlist is a stage plus a position. Deposit received is a timestamp and amount on the application, recorded manually by Jen when the bank transfer lands. No payments integration.
3. **`people` not `contacts`**, keeping the original name so the Trello stories still read correctly. `person_type` is derived, not stored.
4. **Allocation is its own table.** The original puts `buyer_id` on Puppy. Jen offers, people decline, puppies get re-offered. `allocations` keeps that history; `puppies.status` is maintained by trigger.
5. **Comms are logged manually.** No WhatsApp or email ingestion. The `activities` table replaces the original `Communication` table and also carries system events (stage changes, allocations) via triggers so the timeline is complete without Jen remembering to log.
6. **Litters carry `dam_id` and `sire_id` directly.** `breeding_plan_id` is added when breeding plans come in post-beta.
7. **Public enquiry and application forms are unauthenticated**, writing through server actions with Turnstile captcha. Only Jen and Jonathan log in.
8. **Puppy status `held`** covers both "holding" and "guardian" from the original enum; a note says which. Guardian becomes its own status when the guardian program is built.

## Pipeline stages

Unified from Process Flow 1 (Lead New/Closed, Application Submitted, Approved, Deposit, Waitlist Active, Matched, Sold/Owner):

`enquiry` → `applied` → `reviewing` → `approved` → `waitlisted` → `matched` → `placed`

Side exits: `declined`, `withdrawn`, `on_hold`

- `approved` = Jen said yes, deposit requested, not yet received. Moves to `waitlisted` when Jen records the deposit.
- `matched` = active allocation exists. Set by trigger.
- `placed` = puppy collected. Set when the allocation is marked collected.

Kanban columns show the seven forward stages; side exits are a filter.

## Entities (MVP tables)

### breeders
`id, name, abn, email, phone, logo_path, created_at`

### members
Auth users who can see a breeder's data. `id (= auth.users.id), breeder_id, full_name, role (owner|staff), created_at`

### people
`id, breeder_id, first_name, last_name, email, phone, suburb, state, postcode, source (website|instagram|facebook|referral|whatsapp|other), referred_by, notes, created_at, updated_at`
Unique on `(breeder_id, lower(email))` where email is not null, so a repeat enquiry attaches to the same person.

### applications
`id, breeder_id, person_id, stage (enum), waitlist_position int null, enquiry_message text, submitted_at, approved_at, deposit_requested_at, deposit_received_at, deposit_amount numeric null, closed_at, close_reason, preferred_sex (male|female|any), preferred_colours text[], preferred_generation text, timing (asap|next_litter|flexible|specific), timing_note, home jsonb, answers jsonb, internal_rating smallint null, internal_notes, created_at, updated_at`

`home` holds the structured living-situation answers (household, children and ages, other pets, yard, hours alone, experience). `answers` holds anything else on the form. Both jsonb so the form can change without a migration. Promote a field to a column once Jen filters on it.

### dogs
`id, breeder_id, name, registered_name, call_name, sex, breed_type, generation, dob, colour, microchip, sire_id null, dam_id null, is_external bool, owner_person_id null, status (active|retired|deceased), photo_path, notes, created_at, updated_at`
Deferred columns (`location_type`, `guardian_id`) are not added until needed.

### litters
`id, breeder_id, code, dam_id, sire_id, mating_date, due_date, whelped_date, go_home_date, status (planned|confirmed|born|weaning|ready|complete), expected_count, notes, created_at, updated_at`
Status enum taken from the original model. `due_date` defaults to mating_date + 63 days.

### puppies
`id, breeder_id, litter_id, collar_colour, temp_name, sex, colour, birth_weight_g, microchip, status (available|held|matched|placed|deceased), temperament_notes, notes, created_at, updated_at`

### puppy_weights
`id, puppy_id, recorded_on, weight_g, notes`. Cheap to add, and "Track puppy development" is Must Have on the board.

### allocations
`id, breeder_id, puppy_id, application_id, status (offered|accepted|declined|confirmed|collected|cancelled), offered_at, responded_at, collected_at, notes, created_at`
Partial unique indexes: one allocation in (offered|accepted|confirmed) per puppy, and one per application.

### activities
The comms timeline. `id, breeder_id, person_id, application_id null, litter_id null, puppy_id null, type (note|message|call|email|meeting|stage_change|allocation|system), direction (in|out|null), channel (whatsapp|email|sms|phone|in_person|web|null), body, occurred_at, created_by null (member id), metadata jsonb, created_at`
Triggers insert `stage_change` and `allocation` rows.

### media
`id, breeder_id, owner_type (puppy|litter|dog|application), owner_id, storage_path, caption, sort_order, created_at`
One private Storage bucket `media`, signed URLs, images resized on upload.

### litter_updates (schema only in v1, see decisions)
`id, breeder_id, litter_id, week_number, title, body, published_at, created_at`. Photos via `media` with owner_type `litter_update`.

Every table: uuid PK, `created_at`, `updated_at` where rows change, RLS enabled, policy `breeder_id in (select breeder_id from members where id = auth.uid())`. Soft deletes are not in v1; nothing in the MVP is deleted except by Jen on purpose.

## Relationships

```
breeders 1─n members
breeders 1─n people 1─n applications 1─n allocations n─1 puppies n─1 litters
dogs (dam, sire) 1─n litters         dogs self-ref sire_id / dam_id
people 1─n activities (optionally → application / litter / puppy)
puppies 1─n puppy_weights
litters 1─n litter_updates
media → puppy | litter | dog | application | litter_update
```

## Screens

| Screen | Wireframe | Notes |
|---|---|---|
| Login (magic link) | None needed | shadcn form |
| Home / needs attention | None | New enquiries, unanswered > 3 days, offers awaiting response, deposits requested not received, go-home dates in 14 days |
| Pipeline (kanban + list) | **To design** | Seven columns, card = name, preference summary, days in stage, last contact. List mode on mobile |
| Application detail | **To design** | Header: person, stage, actions. Left: application answers, preferences, internal rating/notes. Right: comms timeline with quick add. Follows Dog Profile tab grammar |
| Waitlist | Partial (Litter Timeline side panel) | Ordered list, drag to reorder, preference chips, filter by sex/colour/timing, "link to litter" action |
| Public enquiry form | None | Name, email, phone, suburb, how found us, message |
| Public application form | None | Multi-step: about you, your home, your experience, your preferences, anything else. Fields from the Trello story |
| Dogs list + dog detail | Dog Profile wireframe, overview tab only | Health/breeding/lineage/documents tabs rendered as "coming later" placeholders, same as the wireframe does |
| Litters list + litter detail | **Litter Timeline wireframe** | Progress strip, puppy grid, linked waitlist panel, key dates. Litter Updates panel hidden unless decision 2 below says build it |
| Matching | Litter Timeline "Manage Matching" | Two columns: puppies left, waitlisted applications right, offer/accept/decline/confirm |
| Settings | None | Breeder name, contact, logo, members |

## Build order

Each step deploys and is usable by Jen before the next starts. Pipeline and comms first because the breeder journey map puts 2 to 3 hours a day on enquiries and that is the biggest pain.

| # | Step | Trello cards | Done when |
|---|------|-------------|-----------|
| 0 | **Foundation.** Repo, Next.js scaffold, Supabase project, Vercel, env, magic-link auth, `breeders` + `members`, RLS baseline, Supabase CLI migrations, design tokens from the wireframe brand, dashboard + public layouts | Initialize Next.js, Configure Supabase, Set up authentication, Set up Vercel, Build design system foundation, Create shared layouts (partial), Implement RLS | Jen logs in to an empty app on a real URL on her phone |
| 1 | **People, applications, pipeline.** Schema for `people`, `applications`, `activities` + triggers. Kanban and list, application detail, create/edit, stage changes, internal notes and rating | Create database schema (partial) | Every current enquiry is off the notepad |
| 2 | **Comms timeline.** Log note/message/call/email on an application, filter, quick-add from card. Stage changes already appear | View communication history | Jen stops scrolling WhatsApp to remember what she told someone |
| 3 | **Public forms + email.** Enquiry form and multi-step application form on public routes, Turnstile, Resend confirmations, link from the NBG website | Submit enquiry, Complete application, Set up email service (partial) | New applicants arrive without Jen typing |
| 4 | **Waitlist.** Approve → deposit requested → record deposit → waitlisted. Reorder positions, preference filters | Join waitlist | Jen answers "where am I on the list?" in one look |
| 5 | **Dogs, litters, puppies.** Dogs CRUD (overview only), litter page per wireframe, puppy grid, weights, collar colours, photo upload | Create dog profile (partial), Configure file storage, Record litter details, Track puppy development (partial) | A litter is recorded from mating to go-home |
| 6 | **Matching.** Offer/accept/decline/confirm/collected, triggers update puppy and application stages, litter page shows who has which puppy | Match puppies to buyers | Matching a litter happens in the app, not on paper |
| 7 | **Home dashboard, settings, beta prep.** Needs-attention list, breeder settings, seed Jen's real data, mobile pass | Configure breeder profile (partial) | Beta litter starts |

Post-beta backlog, in the order the Trello board and journey maps suggest: litter updates with email broadcast, buyer portal, health records and breeding readiness, heat cycles and breeding plans, deposits and payments (Stripe), contracts and pickup, guardian program, lineage, bulk comms, notifications.

## Decisions needed from Jonathan

1. **Pipeline stage names.** Seven forward stages above, or fold `reviewing` into `applied` and `approved` into `waitlisted` for a five-column board. Seven is my recommendation because deposit-pending is a real state Jen tracks today.
2. **Litter updates in or out of the beta.** It is Must Have on the board, it is on the Litter Timeline wireframe, and the breeder journey map puts 2 to 3 hours a week on it. Without a buyer portal the delivery channel would be email to everyone linked to the litter. I have left the table in the schema and the UI out of the build order. Say "in" and it becomes step 6b: compose update with photos, send to matched and waitlisted applicants via Resend.
3. **Application form fields.** The Trello story says living situation, experience, lifestyle, preferences, home photos. I need Jen's actual question list, or I draft one from the story and she edits it in the beta.
4. **Trello.** The board is under a different login to the Trello connector here, so I can't update it. If you want the board to track this plan, add a "MVP beta" label to the 17 cards marked In MVP / Partial in `reference/trello-backlog-index.md`, or give the connected account access.

## Things to watch

- **Supabase free tier pauses after a week idle.** Pro (about USD 25/month) once the beta litter starts.
- **Photos are the bulk of storage.** Resize client-side before upload.
- **Applicant home details are personal information under the Privacy Act.** Private bucket, tight RLS, no form bodies in Vercel logs, and a one-line privacy note on the public form.
- **Mobile first.** Jen works from her phone. Kanban collapses to a list below 768px.
- **Trello board is currently public.** Flip it back to private.
