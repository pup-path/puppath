# PupPath journey maps and process flows (content extract)

Extracted from `puppath-journey-maps.jsx` and `puppath-process-flows.jsx` on the PupPath Trello board (Documents card). Rendering code dropped, content kept verbatim. Originals remain on Trello.

## Buyer journey (before → after)

| Stage | Before (tools) | Pain | After | Time |
|---|---|---|---|---|
| 1 Discovery & Enquiry | Instagram/Facebook DM, email, website form | No confirmation, unsure if seen, days waiting, no visibility | Enquiry via website, instant confirmation, next steps and timeline | Instant |
| 2 Application | Email PDF/Word, email back | Clunky, no save, unsure if submitted, no status | Online form, mobile friendly, autosave, status visible | 15-20 mins |
| 3 Approval & Deposit | Email, bank transfer | No receipt, unclear waitlist position, deposit anxiety | Approval notification, payment confirmation, position visible, portal access | Immediate |
| 4 Waiting Period | Email, WhatsApp | Long silences, no litter visibility, feels forgotten, chases | Portal status, upcoming litters, automatic updates | Self-service |
| 5 Litter Born & Updates | WhatsApp, email, Facebook group | Photos scattered, misses updates, no record | Notification + weekly update in portal with photos | Streamlined |
| 6 Puppy Matching | Phone, WhatsApp | No visibility into selection, feels random | Match notification, puppy profile in portal | Instant |
| 7 Pre-Pickup Countdown | Email, WhatsApp, PDFs | Scattered info, contract via attachment, payment confusion | Countdown, checklist, contract signing, payment tracking | Organised |
| 8 Pickup & Beyond | Paper folder, email | Paper lost, records hard to find, relationship fades | Digital records, vaccination reminders, check-ins | Ongoing |

Emotion before: 2,2,2,1,3,3,2,4. After: 4,4,5,4,5,5,4,5.

## Breeder journey (Jen, before → after)

| Stage | Before (tools) | Pain | After | Time before → after |
|---|---|---|---|---|
| 1 Managing Enquiries | Instagram DM, Facebook, email, WhatsApp | Messages across 5+ platforms, loses track, repeats answers, can't filter serious buyers | Single inbox, auto-response to FAQs, qualify/disqualify, lead scoring | 2-3 hrs/day → 30 mins/day |
| 2 Application Screening | Email, Word/PDF, spreadsheet | Manual send and track, lost in inbox, no structured comparison | Application link, review in dashboard, one-click approve | 1-2 hrs/wk → 20 mins/wk |
| 3 Waitlist Management | Excel, bank statement, notebook | Messy spreadsheet, deposit reconciliation, forgets preferences, no buyer visibility | Auto-ordered waitlist, payments tracked, preferences stored | 1 hr/wk → 10 mins/wk |
| 4 Breeding Program Tracking | Paper diary, memory, spreadsheet | Cycles in head, guardian comms fragmented, misses timing | Cycle tracking, predicted windows, guardian notifications | Constant → automated |
| 5 Litter Updates | WhatsApp groups, Facebook, email | Same content to many places, not everyone sees it, no record | Post once, system distributes, history saved | 2-3 hrs/wk → 30 mins/wk |
| 6 Puppy-Buyer Matching | Memory, notes, phone | Mental juggling, hard to recall preferences, no audit trail | Waitlist + puppies side by side, drag-drop match, notify all | 2-3 hrs/litter → 30 mins |
| 7 Contracts & Handover | Word, email, printer, paper | Manual contract, chasing signatures, paper health records | Template contracts, e-signature, digital handover pack | 1-2 hrs/puppy → 15 mins |
| 8 Compliance & Records | Filing cabinet, spreadsheets | Scattered, can't find, audit anxiety, no backup | Searchable, audit trail, export | Hours → minutes |

## Guardian journey (deferred scope)

Stages: Becoming a Guardian, Living with Dog, Heat Cycle Reporting, Breeding Coordination, During Pregnancy, Contract Completion. Core pains: verbal agreements, unclear expectations, missed heat reports, last-minute logistics, no visibility into breeding count.

## Process flow 1: Enquiry → Owner (buyer journey)

Swimlanes: Prospect/Enquirer, Breeder (Jen), Applicant, Waitlist Buyer, Matched Buyer, New Owner.

1. Prospect submits enquiry via website/social → **Lead created (status: New)** (webhook/form)
2. Jen reviews enquiry → Suitable? No → polite decline → **Lead → Closed**. Yes ↓
3. **Application invite sent (email)** → applicant completes form → **Application created (status: Submitted)**
4. Jen notified → reviews responses → screens (lifestyle, experience) → Approved? No → records rejection reason → rejection email. Yes ↓
5. **Approval + deposit request sent** → buyer pays deposit (bank transfer) → Jen **records deposit received** → **Waitlist record created (status: Active)** → portal invite
6. When litter ~3.5 weeks: Jen reviews waitlist + puppy profiles → **matches puppy to buyer** → Puppy → Matched, Waitlist → Matched
7. Match notification (email + portal) → buyer views puppy profile → receives weekly litter updates → countdown to pickup
8. Week 8: Jen prepares handover pack, generates contract → contract sent for signature → records final payment → completes handover checklist
9. Owner signs, pays balance, collects → **Puppy → Sold**, **Person type → Owner** → check-in reminders

## Process flow 2: Guardian prospect → Active guardian (deferred)

Prospect expresses interest → Jen creates prospect record → screens → approved to prospect pool → when suitable dog identified, Jen matches and proposes → prospect accepts → Jen prepares contract (breeding count, duration) → signed → **Guardian record (Active)**, **Dog location → Guardian**, portal access → ongoing heat cycle logging by guardian → breeder notified, breeding window calculated → when max breedings reached: retirement, contract → Complete, dog transferred to guardian ownership.

## Process flow 3: Breeding cycle (litter flow)

1. Jen creates breeding plan (dam + sire) → compatibility check → incompatible → warning, pick another pairing. Compatible ↓
2. **Breeding plan (Planned)** → wait for heat → guardian/Jen observes heat → reports → **cycle log created**
3. Heat notification → schedule progesterone test → vet tests → record result → optimal? No → follow-up test. Yes ↓
4. Coordinate mating → mating occurs → record mating date → **plan → Mated**, expected birth date calculated (63 days)
5. ~4 weeks: pregnancy scan → not pregnant → **plan → Unsuccessful**, end. Confirmed ↓
6. **Litter record (Confirmed)** → birth → record birth details → create puppy records (collar colours) → **Litter → Born**
7. Weeks 1-8: photos, weights → litter update → publish → notifications to linked buyers
8. Weeks 3-4: review waitlist for this litter, assess temperaments, match → Puppy → Matched, notifications
9. Weeks 6-8: vet microchips, vaccinates, health checks → Jen records microchip numbers, vaccination details, uploads certificates
10. Week 8: handovers per buyer → Puppy → Sold → all placed? → **Litter → Complete**

## Process flow 4: Stud dog management (deferred)

Acquire/identify stud → dog record (Male, Stud, status Incomplete) → vet: DNA, hips/elbows, semen analysis → record results → all passed? No → stays Incomplete, retest or retire. Yes → Cleared → Active → available for breeding plans → compatibility check with dam → assigned → if stud lives with guardian: notification, availability, logistics → record mating → usage count, rest period flag → max usage → Retired, stays in lineage.

## Enum values from the original data model

- Dog.status: incomplete, cleared, active, retired, deceased
- Dog.location_type: breeder, guardian, sold, external_stud
- HealthRecord.record_type: dna, hips, elbows, vaccination, semen_analysis, fit_for_flight
- Application.status: submitted, reviewing, approved, rejected, withdrawn
- Waitlist.status: active, linked_to_litter, matched, completed, refunded
- Puppy.status: available, reserved, matched, sold, guardian, holding
- Litter.status: planned, confirmed, born, weaning, ready, completed
- Person.person_type: enquiry, applicant, waitlist, buyer, owner, guardian, guardian_prospect
- Document.doc_type: purchase_contract, guardian_contract, health_cert, registration, other

## Brand (from wireframes)

primary #E8D4C4 (peachy pink), secondary #E89B3C (orange sun), accent #5D3A4D (plum), cream #F5EDE6, dark #3D2A35. Logo: sun and palm trees in a peach circle. Tagline: "Ethically bred with love on Sydney's Northern Beaches".
