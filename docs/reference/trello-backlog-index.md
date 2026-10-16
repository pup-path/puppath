# PupPath Trello backlog index

Board: https://trello.com/b/JoSmtqqS/puppath (36 cards, 9 lists). Snapshot 16 Oct 2026. Full acceptance criteria and tasks live on the cards. Labels: Must/Should Have, S/M/L, persona.

**In MVP (beta)** = part of the agreed in-house MVP. **Partial** = a slice is in. **Deferred** = after one litter has run through.

## Backlog
- Documents (attachments: wireframes, data model, journey maps, process flows, tech architecture) → copied to `reference/`

## Tech Setup
- Initialize Next.js project (Must, M) — In MVP
- Configure Supabase project (Must, M) — In MVP
- Set up authentication, magic link (Must, L) — In MVP
- Create database schema, 14 tables (Must, L) — Partial: MVP tables only, migrations versioned
- Implement Row-Level Security (Must, M) — In MVP (breeder policies; buyer/guardian policies deferred)
- Configure file storage (Must, M) — In MVP (one private `media` bucket)
- Set up Vercel deployment (Must, S) — In MVP
- Build design system foundation (Must, M) — In MVP (shadcn/ui + NBG brand tokens)
- Create shared layouts (Should, M) — Partial: dashboard + public layouts; portal layouts deferred
- Set up email service (Should, M) — Partial: enquiry/application confirmation only

## Dog Management
- Create dog profile (Must, M) — Partial: basic record, photo, sire/dam link; no health tabs
- Search and filter dogs (Must, S) — Deferred (Jen has a handful of dogs)
- View dog lineage tree (Should, L) — Deferred

## Health & Breeding Readiness
- Record health tests (Must, M) — Deferred
- View breeding readiness checklist (Must, M) — Deferred
- Check DNA compatibility (Should, L) — Deferred

## Breeding Planning
- Log heat cycles (Must, M) — Deferred
- Create breeding plan (Must, L) — Deferred (litter carries dam/sire directly for now)
- View breeding calendar (Should, M) — Deferred

## Litter Management
- Record litter details (Must, M) — In MVP
- Track puppy development (Must, M) — Partial: weights, collar colours, photos; no milestones/charts
- Match puppies to buyers (Must, M) — In MVP
- Post litter updates (Must, S) — Decision pending (see docs/01)

## Buyer Journey
- Submit enquiry (Must, S) — In MVP
- Complete application (Must, M) — In MVP (no save/resume in v1)
- Join waitlist (Must, S) — In MVP (deposit recorded manually, no payments)
- Access buyer portal (Must, M) — Deferred
- View matched puppy (Should, S) — Deferred
- Complete pickup process (Should, M) — Deferred

## Guardian Program
- Submit guardian application, Manage guardian contract, Access guardian portal, Coordinate breeding logistics — all Deferred

## Portal & Communications
- Configure breeder profile (Must, S) — Partial: name, contact, logo; no portal theming
- View communication history (Should, S) — In MVP (this is the comms timeline)
- Send bulk communications (Should, M) — Deferred
- Receive notifications (Must, M) — Deferred (dashboard "needs attention" list instead)
