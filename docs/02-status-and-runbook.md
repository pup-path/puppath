# PupPath: status and runbook

Last updated 16 Oct 2026, after step 5.

## Where things live

- Code: https://github.com/pup-path/puppath (org `pup-path`). Every push to `main` deploys.
- App: https://puppath-five.vercel.app (Vercel team `pup-path-8598`, project `puppath`)
- Database/auth/storage: Supabase project `dsdtqlxbjjyzfvsdrqqd` ("pup-path's Project", ap-southeast-1). Migrations 0001 and 0002 applied via the Supabase connector. Photos go in the private `media` bucket and are served by signed URL.
- Email: Resend via Supabase custom SMTP (host smtp.resend.com, sender currently onboarding@resend.dev). App-side confirmations need `RESEND_API_KEY` in Vercel.
- Design docs: `docs/` in the repo and `Dog CRM/` on Jonathan's Mac.
- Trello board: https://trello.com/b/JoSmtqqS/puppath (connector account not yet a member)

## Logins

Owners: jonathan.p.moody@gmail.com, jen.p.moody@gmail.com (via `member_invites`, auto-converted to `members` on first sign-in). Sign in with magic link or password ("Use a password instead" on /login). Add anyone else by inserting into `member_invites`.

## Public forms

- Enquiry: https://puppath-five.vercel.app/enquire
- Application: https://puppath-five.vercel.app/apply
Both write through anon RPCs, so no login needed. A "Share forms" card on Settings is coming in step 7.

## Build status

| Step | Status |
|---|---|
| 0 Foundation (auth, shell, RLS, migrations, brand) | Done |
| 1 Pipeline (kanban/list, application detail, stage moves, deposit) | Done, in use with a real enquiry |
| 2 Comms timeline | Done |
| 3 Public forms (/enquire, /apply) + email confirmations | Done; emails fire once RESEND_API_KEY is in Vercel |
| 4 Waitlist (order, move up/down, filters) | Done |
| 5 Dogs, litters, puppies (profiles, photos, litter timeline, record birth, puppy cards, weights) | Done, needs Jonathan's click-through |
| 6 Matching (offer, accept, confirm, collected) | Next. Route exists as a placeholder at /litters/[id]/matching |
| 6b Litter updates with email broadcast | After 6 (decision: in). Placeholder tab on the litter page |
| 7 Dashboard polish, settings (breeder details, logo, members, share forms), seed Jen's data, mobile pass | Last before beta |

## How step 5 works

- Dogs: /dogs. Profile has tabs: overview, edit, health (placeholder), breeding (litters as dam or sire), lineage (placeholder). One photo per dog.
- Litters: /litters. New litter needs a code and ideally dam and sire; mating date auto-fills due date (+63 days). Litter page: status strip (planned, pregnant, born, weaning, ready, complete), "Puppies arrived?" card to record the birth (creates a card per puppy and sets go-home to +8 weeks), puppy grid with collar colours, linked waitlist (waitlisted and matched applications), key dates, photos, edit tab.
- Puppies: click a card. Details, status (available, holding, or deceased by hand; matched and placed come from the match), weight log with deltas, photos, delete (only while unmatched).

## Decisions made 16 Oct

- Seven pipeline stages: enquiry, applied, reviewing, approved, waitlisted, matched, placed (+ on_hold, declined, withdrawn).
- Litter updates are in the beta.
- Application questions drafted by Claude in `src/lib/application-form.ts`; Jen edits in beta.
- App reads `PUPPATH_SUPABASE_URL` / `PUPPATH_SUPABASE_ANON_KEY`, not `NEXT_PUBLIC_SUPABASE_*`.
- Photos are resized in the browser to 1600px JPEG before upload to keep storage small.

## Gotchas hit (so nobody repeats them)

1. **Vercel's Supabase marketplace integration provisions its own Supabase project** (`supabase-violet-compass`, ref `xgskyeztadjubxyjcwar`) and injects its credentials as `NEXT_PUBLIC_SUPABASE_*`. Those override anything set on the project. Symptoms: magic link redirecting to localhost:3000, "email rate limit exceeded", "invalid login credentials". Fix was to read differently named env vars. To do: remove the store in Vercel → Storage.
2. **Supabase built-in mailer**: 2 emails/hour, only to Supabase org members. Custom SMTP (Resend) lifts both. Jen's address needs the NBG domain verified in Resend before she can receive links.
3. **Vercel "redeploy" inherits the original deployment's env snapshot.** To pick up changed env vars, deploy fresh from git.
4. Vercel Authentication was on for all deployments by default; set to preview-only so Jen can reach production without a Vercel account.
5. Supabase SMTP settings are under Project Settings → Authentication (or Authentication → Emails → SMTP), not the main Auth menu.

## Open items for Jonathan / Jen

- Click through step 5: add a dog with a photo, create a litter, record a birth, add a weight.
- Verify NBG domain in Resend, add `RESEND_API_KEY`, `RESEND_FROM`, `NOTIFY_EMAIL` to Vercel.
- Remove the stray Supabase store in Vercel → Storage.
- Re-create Jen's user (it was deleted during the login debugging) or have her use the magic link once the domain is verified.
- Invite the work Trello account to the PupPath board, make the board private again.
- Jen: enter current enquiries via Add enquiry; review the application questions at /apply.
- Supabase Pro (~USD 25/mo) before the beta litter so the project never pauses.
