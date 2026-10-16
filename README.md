# PupPath

Breeding and applicant management for Northern Beaches Groodles. Next.js (App Router) on Supabase, deployed on Vercel.

Design and build plan: see the `docs/` folder in the Dog CRM project (data model, build order, source wireframes).

## What's built

| Step | Status | What |
|---|---|---|
| 0 Foundation | Done | Scaffold, brand tokens, magic-link auth, membership, RLS, migrations, layouts |
| 1 Pipeline | Done | People + applications, kanban (desktop) and list (mobile), application detail, stage moves, deposit recording, Jen's assessment |
| 2 Comms timeline | Done | Log notes, messages, calls, emails, meetings; stage and puppy events logged automatically |
| 3 Public forms + email | Done | `/enquire` and `/apply` (question set in `src/lib/application-form.ts`), honeypot + optional Turnstile, Resend confirmations and breeder notifications once keys are set |
| 4 Waitlist | Done | Ordered list, move up/down, renumber, filters by sex and colour |
| 5 Dogs, litters, puppies | Stub | Schema exists |
| 6 Matching | Stub | Schema and triggers exist |
| 6b Litter updates | Stub | Schema exists |
| 7 Dashboard, settings | Partial | Home needs-attention list done; settings stub |

## One-time setup

1. **Supabase**: project `dsdtqlxbjjyzfvsdrqqd` (ap-southeast-1). Migrations `0001` and `0002` are already applied. New migrations go in `supabase/migrations/`, numbered, and are applied through the Supabase connector (or pasted into the SQL Editor).
2. **Logins**: `0001_init.sql` invites `jonathan.p.moody@gmail.com` as owner. Add Jen:
   ```sql
   insert into member_invites (email, breeder_id, full_name, role)
   select 'JEN_EMAIL', id, 'Jen', 'owner' from breeders where slug = 'nbg';
   ```
   Anyone who signs in without an invite sees a "no access" page and can retry after being added.
3. **Supabase Auth settings**: Authentication → URL Configuration. Site URL = your Vercel URL. Add `https://YOUR-APP.vercel.app/auth/callback` and `http://localhost:3000/auth/callback` to Redirect URLs. Leave the default email templates for now.
4. **Vercel**: project `puppath` in team `pup-path-8598`, linked to this repo; every push to `main` deploys. Environment variables:
   - `PUPPATH_SUPABASE_URL` and `PUPPATH_SUPABASE_ANON_KEY` (deliberately not `NEXT_PUBLIC_SUPABASE_*`: the Vercel Supabase marketplace integration overwrites those with a project it provisioned itself)
   - `NEXT_PUBLIC_SITE_URL` = `https://puppath-five.vercel.app`
   - `RESEND_API_KEY`, `RESEND_FROM` (e.g. `Northern Beaches Groodles <hello@nbg.com.au>`), `NOTIFY_EMAIL` (Jen's inbox for new-enquiry pings)
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` (optional; forms work without them, with a honeypot only)
5. Deploy. Open the URL on your phone, sign in with the magic link.

## Public forms

- `/enquire`: short form. Creates a person + application at stage `enquiry`, logs the message on the timeline.
- `/apply`: five-step form. Questions live in `src/lib/application-form.ts`; edit labels, options or add questions there and nothing else changes. Contact fields and the five preference fields map to real columns; everything else lands in `applications.home` / `applications.answers` and renders on the application page. Drafts autosave in the applicant's browser.
- Both call `security definer` Postgres functions as the anon role; no service key is involved.

## Local development

```bash
cp .env.example .env.local   # fill in the two Supabase values
npm install
npm run dev
```

## Database tests

`supabase/tests/0001_triggers.test.sql` runs the whole flow (invite → member, enquiry → application → waitlist → offer → decline → re-offer → collected) against a local Postgres with `supabase/tests/local-stubs.sql` standing in for Supabase's auth and storage schemas. 22 checks, all expected `t`.

```bash
psql -d yourdb -f supabase/tests/local-stubs.sql
psql -d yourdb -v ON_ERROR_STOP=1 -f supabase/migrations/0001_init.sql
psql -d yourdb -f supabase/tests/0001_triggers.test.sql
```

## How the pipeline works

Stages: enquiry → applied → reviewing → approved → waitlisted → matched → placed, plus on_hold, declined, withdrawn.

- Recording a deposit on an **approved** application moves it to **waitlisted** and assigns the next position.
- Offering a puppy (step 6) moves the application to **matched** and the puppy to **matched**. A decline puts both back. Collection moves them to **placed**.
- Every stage change and puppy event is written to the applicant's timeline by database triggers, so nothing depends on remembering to log it.

## Notes

- UI primitives in `src/components/ui` are hand-written in the shadcn/ui style (Radix + Tailwind). The shadcn registry wasn't reachable from the build environment; swapping to generated components later is a drop-in.
- Fonts are self-hosted via the `geist` package rather than fetched from Google at build time.
- Supabase free tier pauses after a week idle. Go Pro when the beta litter starts.
