# PRD — Veza Sgela Experience Enablement Platform (EEP)

|                           |                                                                                               |
| ------------------------- | --------------------------------------------------------------------------------------------- |
| **Product**               | Veza Sgela Experience Enablement Platform (working name: **Sgela**)                           |
| **Owner**                 | Veza Interactive (Johannesburg) — Mmuso Mafisa, Thabo                                         |
| **Accreditation partner** | Bantu Marketing and Management Services                                                       |
| **Version**               | 1.0 — build-ready PRD for Claude Code                                                         |
| **Date**                  | November 2026                                                                                 |
| **Companion docs**        | `VEZA_EEP_SPEC.md` (product spec), `Screens Ref/` (Knowledge Pele LMS reference screens 1–28) |

> **How to use this document (for Claude Code):** Build in the milestone order in §17. Each milestone lists tickets with acceptance criteria. The data model in §11 and the API contracts in §12 are the source of truth. Where the PRD says _"provider abstraction"_, build an interface with a dev/console implementation first and leave the real vendor behind an env flag. When something is ambiguous, choose the simplest option that satisfies the acceptance criteria and record the decision in `docs/DECISIONS.md`.

---

## Table of contents

1. Vision & problem
2. Goals, non-goals & success metrics
3. Users & personas
4. Product principles
5. The learner journey (end to end)
6. Industries & content catalogue
7. Feature requirements — learner (MVP)
8. Feature requirements — admin (MVP)
9. Differentiators — Opportunities matching, AI Career Coach, National Career-Interest Heatmap
10. Later-phase roles & features
11. Data model
12. API & integration contracts (incl. VR kiosk hand-off)
13. Technical architecture & stack
14. Design system & UX standards
15. Non-functional requirements
16. Privacy, POPIA, safety & compliance
17. Delivery plan — milestones & tickets
18. Seed data & demo script
19. Testing strategy & definition of done
20. Risks, assumptions & open questions
21. Glossary

---

## 1. Vision & problem

### 1.1 Vision

**Every young South African should be able to step inside a career, learn it, prove it and be invited into it.**

Veza Sgela is a touring VR career expo: learners physically perform real work from five industries in a headset at a mobile kiosk. Today that experience ends when the headset comes off. The Experience Enablement Platform (EEP) turns the 15-minute expo moment into a continuous pathway:

```
DISCOVER  →  CLAIM  →  LEARN  →  PRACTISE  →  ACCREDIT  →  ADVANCE
VR expo      register   3D/AR      VR (deeper)  credits via   matched & invited to
kiosk        via QR     modules    sessions     Bantu (and    bursaries, learnerships,
                                                partners)     internships, YES, jobs
```

### 1.2 The problem

- **Career choices are made blind.** Learners choose subjects (Grade 9) and study paths without ever seeing the work.
- **Exposure doesn't scale.** Job shadowing, labs and site visits are expensive and reach few learners — least of all rural and township learners.
- **Youth unemployment is structural.** ~61% of 15–24-year-olds who want work cannot find it (Stats SA, Q4 2025). The failure starts upstream, at exposure and direction.
- **Training platforms dead-end.** Existing LMSs (including the Knowledge Pele reference) stop at a certificate. Nothing connects the learner to a real next step.
- **Sponsors can't see impact.** CSI and B-BBEE spend on youth is hard to evidence beyond attendance.

### 1.3 The product in one paragraph

A mobile-first web platform (PWA) where a learner claims their VR expo results by QR code, explores five career worlds, learns through interactive **3D models, simulations and AR** (the core layer), deepens practice in **VR** (the extension layer), earns **credits and credentials** through Veza's accredited partner, and is **matched and invited** to real opportunities posted by sponsors and industry partners — guided throughout by a **multilingual AI Career Coach**. Every interaction feeds an anonymised **National Career-Interest Heatmap** that shows sponsors, SETAs and government where the next generation of talent wants to go.

### 1.4 Positioning

- **Veza is the spatial computing and data visualisation company.** Veza builds the platform, 3D/AR/VR content and data products.
- **Bantu Marketing and Management Services** is the accredited provider for credit-bearing learning (current scopes: ICT, business management, agricultural training, carpentry).
- **Industry partners** co-create career-world content and post opportunities.
- **Sponsors** (CSI, B-BBEE, talent-pipeline budgets) fund the expo and platform.

---

## 2. Goals, non-goals & success metrics

### 2.1 Goals (MVP, first 12 months)

| #   | Goal                                         | Target                                                                                                |
| --- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| G1  | Convert expo learners into platform learners | ≥ 35% of expo sessions claimed within 30 days                                                         |
| G2  | Learners actively learn                      | ≥ 50% of registered learners complete ≥ 1 topic; ≥ 15% complete a course                              |
| G3  | 3D/AR is the hero                            | ≥ 70% of topic sessions include a 3D interaction; AR launched by ≥ 25% of learners on capable devices |
| G4  | Real next steps                              | ≥ 20% of eligible learners receive ≥ 1 opportunity invite; ≥ 5% of invited learners placed            |
| G5  | Accreditation                                | First credit-bearing cohort (Agriculture, via Bantu) completes and is submitted for recording         |
| G6  | Sponsor evidence                             | Every sponsor receives an automated impact pack (sessions → learners → credentials → placements)      |
| G7  | Coach is useful                              | ≥ 40% of active learners use the AI Coach; ≥ 80% thumbs-up on rated answers                           |
| G8  | Heatmap live internally                      | National heatmap populated from all expo + platform data with privacy thresholds enforced             |

### 2.2 Non-goals (MVP)

- Building the VR (Unity) experiences — separate track; EEP only defines and consumes the API contract (§12.3).
- Sponsor, school, assessor and opportunity-partner self-service portals (Phase 2–3; admins act on their behalf in MVP).
- Real-money movement in Veza Pay (data model only in MVP; payments Phase 2).
- Proctored remote exams (Phase 2+; MVP uses quizzes and PoE uploads).
- Native mobile apps (PWA only).
- Full ML-based matching (rules-based, explainable scoring in MVP).

### 2.3 North-star metric

**Learners advanced:** number of learners who move from an expo session to an accepted opportunity (bursary, learnership, internship, YES placement, job-shadow or job).

### 2.4 Funnel metrics (instrument from day one)

`expo_session` → `claim_started` → `account_created` → `consent_complete` → `first_topic_started` → `first_topic_completed` → `course_completed` → `credential_issued` → `match_created` → `invite_sent` → `invite_accepted` → `application_submitted` → `placed`

Plus: career-clarity score (pre-expo vs post-expo vs 30-day), weekly active learners, 3D interactions per session, coach conversations, AR launches, data-saver mode usage.

---

## 3. Users & personas

### 3.1 MVP users

| Role           | Description                                                                                                                                        | MVP access                              |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| **Learner**    | Ages ~13–35. Mainly Grade 8–12 learners met at the expo, plus out-of-school youth (18–35). Mostly on entry-level Android phones with prepaid data. | Full learner app                        |
| **Guardian**   | Parent/guardian of a learner under 18.                                                                                                             | Consent flow via SMS/WhatsApp link only |
| **Veza Admin** | Veza staff. Manages content, industries, opportunities (on behalf of partners), learners, reports.                                                 | Admin console                           |

### 3.2 Personas

**Thandeka, 16, Grade 10, Polokwane.** Tried Medical and Aviation at the expo at her school. Has a shared Android phone, data bought in small bundles, prefers Sesotho/English mix. Wants to know if she can become a pilot without a lot of money. _Needs:_ low-data experience, clear subject guidance, bursary invites, coach in her language, guardian consent that's easy for her mother to complete.

**Sipho, 22, unemployed, Soweto.** Matric with maths literacy. Tried Engineering and Agriculture at a mall stop. _Needs:_ a short accredited course he can finish, a credential employers trust, YES/learnership invites, stipend visibility (Veza Pay later).

**Lerato, 17, Grade 11, rural Mpumalanga.** Strong in Physical Science; loved the electrical panel VR task (top 10% score). _Needs:_ recognition of her VR performance, engineering bursary matches, a portfolio she can show.

**Nomsa, Veza programme admin.** Runs the expo tour data and partner relationships. _Needs:_ to publish content fast, post opportunities from partner emails, see funnel and heatmap, export sponsor reports.

### 3.3 Later-phase roles (designed for, not built in MVP)

Facilitator (kiosk staff), Sponsor, Opportunity Partner / Employer, Industry Content Partner, School/Teacher, Assessor/Moderator (Bantu), Funder viewer (SETA/NSF). See §10.

---

## 4. Product principles

1. **Show, don't tell.** 3D, simulation and AR beat text. Every topic has at least one interactive visual.
2. **Every path ends in a next step.** No dead ends: every screen offers the learner something to do next; every course points to opportunities.
3. **Built for a R1,500 phone and a R10 data bundle.** Low-data by default, progressive enhancement up to AR and VR.
4. **Speak the learner's language.** Literally (multilingual coach and UI-ready i18n) and culturally (local role models, local places).
5. **Data serves the learner first.** Learners own their profile; sponsors see aggregates unless a learner opts in.
6. **Explainable, not magical.** Matches and recommendations always show _why_.
7. **Mastery, not manipulation.** Gamification rewards real competency, never compulsive use.
8. **Same object, every layer.** A learning object is one 3D asset reused across web 3D, AR and VR.

---

## 5. The learner journey (end to end)

### 5.1 Journey map

| Stage       | Where                | What happens                                                         | Key screens           | Data captured                                     |
| ----------- | -------------------- | -------------------------------------------------------------------- | --------------------- | ------------------------------------------------- |
| 0. Pre-expo | School / venue       | Optional 3-question career-clarity check on facilitator tablet       | Kiosk (VR team)       | `clarity_pre`                                     |
| 1. Discover | VR kiosk             | Learner performs 1–5 career worlds (~10 min each window)             | Unity VR              | `ExpoSession`, `VRSessionResult` per world        |
| 2. Claim    | Phone                | Scans QR on kiosk screen / printed card → `/claim/{code}`            | Claim landing         | `claim_started`                                   |
| 3. Register | Phone                | Phone OTP → profile basics → guardian consent if under 18            | Onboarding 1–5        | `Learner`, `Consent`                              |
| 4. Compass  | Phone                | Personal career map lit by expo results; one recommended next step   | Home / Career Compass | interests                                         |
| 5. Explore  | Phone                | Career world pages: 3D hero, careers, subjects, study routes         | Explore               | `InterestSignal`                                  |
| 6. Learn    | Phone                | Courses → topics → sections with 3D/AR blocks, quizzes               | Course, Topic player  | `Progress`, events                                |
| 7. Practise | Kiosk / lab          | Book or link a VR session; results sync                              | Practise              | `VRSessionResult`                                 |
| 8. Assess   | Phone                | Quizzes, topic assessments, PoE uploads (credit-bearing)             | Assess                | `Attempt`, `EvidenceItem`                         |
| 9. Accredit | Platform + Bantu     | Certificate of completion (all) / credit submission (credit-bearing) | Credentials           | `Credential`                                      |
| 10. Advance | Phone + SMS/WhatsApp | Matched → invited → apply → placed                                   | Opportunities         | `Match`, `Invitation`, `Application`, `Placement` |
| Throughout  | Everywhere           | AI Coach; notifications; streaks/XP                                  | Coach                 | `CoachConversation`                               |

### 5.2 Happy path narrative (acceptance reference)

1. Thandeka finishes Aviation and Medical in VR. The kiosk screen shows a QR and a 6-character code `K7Q-4MX`.
2. She scans it; `/claim/K7Q4MX` shows: _"Welcome! You flew as a pilot and worked in a hospital ward today. Save your results."_
3. She enters her mobile number, receives an OTP by SMS, enters first name, date of birth, province/district, school, grade, preferred language.
4. Because she is 16, she enters her mother's mobile number. Her mother gets an SMS/WhatsApp link, reads a plain-language consent page in Sesotho, and taps _I agree_. Until then, Thandeka can learn, but is not matchable or discoverable.
5. Career Compass shows Aviation and Medical lit up, with her VR scores and _"Next: Explore what pilots study — 4 min"_.
6. She explores Aviation, rotates a 3D jet engine, sees _"Subjects you need: Mathematics + Physical Science"_, and asks the Coach in Sesotho how pilots pay for training.
7. She starts _Aviation Foundations_ (non-credit exposure track), completes Topic 1, earns XP and a badge.
8. Three weeks later, a sponsor posts a Grade 10–12 aviation bursary for Limpopo learners. The matching engine scores her 82/100 (_"Aviation interest from expo, Topic 1–3 complete, Limpopo, takes Physical Science"_). She receives an SMS and in-app invite, accepts, and applies.
9. Her application status updates to _Shortlisted_. The sponsor's impact pack counts her as a matched, applied learner from their booth.

---

## 6. Industries & content catalogue

### 6.1 The five career worlds

| Code  | Industry                        | VR expo world (Unity, separate track)                       | Accreditation status (initial)                                                                         | Content partner (target)                       |
| ----- | ------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| `AVI` | **Aviation**                    | Pre-flight walkaround & cockpit checks; drone mission       | Non-credit exposure track + Veza certificate                                                           | Airline / aviation training org (TBC)          |
| `ENG` | **Engineering**                 | Wire & safety-test an electrical panel; repair a power tool | Non-credit + **carpentry-related modules via Bantu** where applicable; seek engineering-trades partner | Utility / mining / manufacturing partner (TBC) |
| `CUL` | **Culinary skills**             | Commercial kitchen shift (prep, hygiene, service)           | Non-credit exposure track + Veza certificate                                                           | Hospitality group (TBC)                        |
| `MED` | **Medical & health facilities** | Clinic / ward walkthrough, triage & infection control       | Non-credit exposure track + Veza certificate                                                           | Hospital group / health NGO (TBC)              |
| `AGR` | **Sustainable agriculture**     | Smart farm: soil test, irrigation, hydroponics, harvest     | **Credit-bearing via Bantu (agricultural training)** — first accredited pathway                        | Agri-business partner (TBC)                    |

**Cross-cutting accredited tracks via Bantu:** **ICT** (digital literacy, basic computing) and **Business Management** (entrepreneurship, small business basics). Offered to every learner as "Career-Ready" add-ons.

> The data model supports both credit-bearing and non-credit courses (`Course.creditBearing`). Aviation, Culinary and Medical become credit-bearing when additional accredited partners are signed.

### 6.2 Careers per world (seed — partners to validate)

| World | Careers (seed)                                                                                                                 | Key school subjects (guidance)                                    |
| ----- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| AVI   | Commercial pilot · Aircraft maintenance engineer · Air traffic controller · Cabin crew · Drone (RPAS) pilot                    | Mathematics, Physical Science, English                            |
| ENG   | Electrician · Mechanical fitter / millwright · Renewable energy technician · Civil engineering technician · Carpenter / joiner | Mathematics, Physical Science, Engineering Graphics & Design      |
| CUL   | Chef · Pastry chef · Food safety officer · Hospitality / restaurant manager                                                    | Hospitality Studies, Consumer Studies, Mathematics/Maths Literacy |
| MED   | Professional nurse · Emergency care practitioner · Radiographer · Pharmacist's assistant · Biomedical technician               | Life Sciences, Physical Science, Mathematics                      |
| AGR   | Farm manager · Agronomist / crop scientist · Hydroponics technician · Agri-drone operator · Agro-processing technician         | Agricultural Sciences, Life Sciences, Mathematics                 |

Each `Career` record has: title, summary, day-in-the-life (3–5 bullets), study routes (TVET / university / learnership / short course), subjects required/recommended, salary band (`salaryBandNote`, sourced from partner data — placeholder text in seed), local role-model story (optional), linked courses, linked VR world, 3D hero asset.

### 6.3 Seed courses for MVP

1. **AGR-101 Sustainable Agriculture Foundations** — credit-bearing pathway (structure aligned to Bantu; exact qualification/skills programme mapping TBC — see §20). 5 topics: Soil health & testing · Water & irrigation · Crop planning · Hydroponics & protected farming · Farm safety & business basics. 3D objects: soil profile cross-section, drip-irrigation system (exploded), hydroponic NFT system, tractor safety zones.
2. **ENG-101 Repair & Maintain Electrical Power Tools** — showcase course (rebuild of reference screens 23–28, 10× version). 5 topics: Plan to repair & maintain · Prepare work area & safety · Testing & fault-finding · Repair & maintain · Complete repairs & quality checks. 3D objects: angle grinder (exploded with hotspots), pneumatic drill, cordless impact wrench, multimeter, safety-test bench.
3. **Exposure starters (1 topic each)** for AVI, CUL, MED — "A day as a…" with one 3D hero object each (jet engine; commercial kitchen line; hospital ward with equipment).
4. **Career-Ready: ICT Basics** and **Career-Ready: Starting a Small Business** — 1–2 topics each as stubs (Bantu-aligned later).

---

## 7. Feature requirements — learner (MVP)

Requirement IDs: `L-<area>-<n>`. Priority: **P0** = MVP must-have, **P1** = MVP should-have, **P2** = later. Each area lists the Knowledge Pele reference screen it replaces and the "10×" upgrade.

### 7.1 Expo claim & onboarding _(ref screens 1–5)_

**Routes:** `/claim/[code]`, `/start`, `/start/verify`, `/start/profile`, `/start/guardian`, `/start/done`, `/consent/[token]` (guardian)

**10× vs reference:** Reference = email/password + 4-step KYC with selfie/ID match before anything else. Veza = phone-first, 60-second sign-up that starts from the learner's own VR results; heavy KYC deferred to accredited enrolment only.

| ID      | Requirement                                                                                                                                                                                                                                                                                                                                                   | Pri |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| L-ON-1  | `/claim/[code]` resolves an `ExpoSession` by claim code (case-insensitive, hyphens ignored). Shows worlds played, per-world score badges and a hero line, then CTA _Save my results_. Invalid/expired codes show a friendly error + _Sign up anyway_.                                                                                                         | P0  |
| L-ON-2  | Phone sign-up: SA mobile number (normalise to E.164 `+27…`), OTP of 6 digits, 5-minute TTL, max 5 attempts, resend after 30 s, max 5 sends/hour/number and 20/hour/IP.                                                                                                                                                                                        | P0  |
| L-ON-3  | Profile: first name, last name (optional), date of birth, gender (optional, incl. _prefer not to say_), province, district/municipality (dropdown filtered by province), school (searchable list, free-text fallback) or _not in school_, grade (8–12) or highest qualification, subjects taken (multi-select, Grade 10+), preferred language. Max 2 screens. | P0  |
| L-ON-4  | If age < 18: collect guardian name + mobile; send consent link (SMS + WhatsApp when available). Learner proceeds with **restricted mode** (can learn; not matchable, not discoverable, no opportunity invites, coach age-safe mode) until consent is granted. Reminder to guardian at 48 h and 7 days.                                                        | P0  |
| L-ON-5  | Guardian consent page `/consent/[token]`: plain-language explanation (available in all 6 launch languages), what data is collected and why, opt-ins (a) platform use, (b) opportunity matching, (c) contact by partners after learner accepts an invite. Records `Consent` with timestamp, IP hash, version of consent text.                                  | P0  |
| L-ON-6  | Learner (18+) sees the same opt-ins on their own consent step. All opt-ins changeable later in Settings → Privacy.                                                                                                                                                                                                                                            | P0  |
| L-ON-7  | Claim links the `ExpoSession` (and all its `VRSessionResult`s) to the learner; initial `InterestSignal`s and career interests derived from worlds played + scores.                                                                                                                                                                                            | P0  |
| L-ON-8  | Sign-up without a claim code is supported (organic). Learner can later add a code from Profile → _Add expo results_.                                                                                                                                                                                                                                          | P0  |
| L-ON-9  | Post-onboarding 3-question career-clarity check (1–5 scale) — skippable, re-asked at 30 days.                                                                                                                                                                                                                                                                 | P1  |
| L-ON-10 | Returning login = phone + OTP; trusted-device session 30 days; logout everywhere option.                                                                                                                                                                                                                                                                      | P0  |

**Acceptance criteria (onboarding)**

- A new learner can go from QR scan to Career Compass in ≤ 6 taps of _Continue_ and ≤ 90 seconds on a 3G-fast throttle.
- A 16-year-old account is in restricted mode until a guardian consents; matching jobs exclude them (verified by test).
- Claiming the same code twice by different accounts is blocked; the second gets _"This code was already used — ask a facilitator"_.

### 7.2 Home — Career Compass _(ref screens 6–7)_

**Route:** `/home`

**10× vs reference:** Reference = generic welcome modal + static progress widgets. Veza = a live, personal 3D career map with one clear next step.

| ID     | Requirement                                                                                                                                                                                                           | Pri |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| L-HM-1 | **Compass visual:** 5 career worlds as nodes on an interactive 2.5D/3D map (react-three-fiber), sized/lit by the learner's interest score; tap to open the world. Static SVG fallback in data-saver mode or no WebGL. | P0  |
| L-HM-2 | **Next best step card:** exactly one primary CTA computed by the recommendation rules (§7.11).                                                                                                                        | P0  |
| L-HM-3 | Continue learning: last 2 in-progress courses with progress rings.                                                                                                                                                    | P0  |
| L-HM-4 | XP, level, streak (days with ≥ 1 learning action), latest badge.                                                                                                                                                      | P0  |
| L-HM-5 | Opportunities strip: count of new invites + top 2 matches (hidden in restricted mode).                                                                                                                                | P0  |
| L-HM-6 | My expo results: worlds played with scores, date, location.                                                                                                                                                           | P0  |
| L-HM-7 | Notices: platform announcements (admin-authored), targetable by province/industry.                                                                                                                                    | P1  |
| L-HM-8 | Coach entry point (floating button on all learner pages).                                                                                                                                                             | P0  |

### 7.3 Explore — career worlds

**Routes:** `/explore`, `/explore/[industry]`, `/explore/[industry]/careers/[career]`

| ID     | Requirement                                                                                                                                                                                                                 | Pri |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| L-EX-1 | Explore index: 5 world cards with 3D thumbnail/poster, learner's interest/score badge, sponsor credit line where present (_"Aviation World presented by [Sponsor]"_).                                                       | P0  |
| L-EX-2 | World page: hero 3D scene (lazy-loaded, poster first), "Why this world matters in SA" (3 bullets), careers list, courses list, VR world preview (video/poster), sponsor block.                                              | P0  |
| L-EX-3 | Career page: summary, day-in-the-life, **subjects you need** (highlight which the learner already takes / is missing), study routes, salary band note, role-model story, linked courses, _Ask the coach about this career_. | P0  |
| L-EX-4 | _I'm interested_ toggle on worlds and careers → strengthens interest score & `InterestSignal`.                                                                                                                              | P0  |
| L-EX-5 | Subject gap nudge for Grade 9 learners: _"Choosing subjects soon? Pilots need Mathematics (not Maths Literacy) and Physical Science."_                                                                                      | P1  |

### 7.4 Learn — courses, topics, sections _(ref screens 8–17, 23–28)_

**Routes:** `/learn`, `/learn/[courseSlug]`, `/learn/[courseSlug]/[topicSlug]`, `/learn/[courseSlug]/[topicSlug]/[sectionSlug]`

**10× vs reference:** Reference = long application form, video + text lectures, one AR tool panel. Veza = one-tap enrol for non-credit courses, sections built from rich interactive blocks, 3D/AR in every topic, offline-tolerant, gamified.

| ID      | Requirement                                                                                                                                                                                                                                                                                                               | Pri                            |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| L-LN-1  | Course catalogue with filters: industry, credit-bearing, duration, level; "Recommended for you" row.                                                                                                                                                                                                                      | P0                             |
| L-LN-2  | Course page: hero (3D poster), credit-bearing badge + partner (e.g. _Accredited via Bantu_), NQF level & credits (if applicable), duration, level, learning objectives, prerequisites, topic list with locks/progress, assessment & certification summary, _Enrol_ / _Continue_.                                          | P0                             |
| L-LN-3  | Enrolment: non-credit = 1 tap. Credit-bearing = enrolment form (ID number or passport, highest qualification, consent to share with accredited partner) + **identity verification** (provider abstraction; MVP = manual admin verification of uploaded ID + selfie).                                                      | P0                             |
| L-LN-4  | Topic page: sections list (left rail on desktop, stepper on mobile), progress %, estimated time, assessment criteria panel (as in ref 27), _Launch AR Lab_ when topic has AR blocks.                                                                                                                                      | P0                             |
| L-LN-5  | Section player renders ordered **content blocks**: `text` (MDX-lite), `image`, `video` (low/high quality variants, captions), `model3d`, `ar`, `hotspot_tour`, `procedure_sim`, `quiz`, `scenario`, `callout`, `download`.                                                                                                | P0                             |
| L-LN-6  | `model3d` block: orbit/zoom/pan, reset view, **explode/assemble slider**, numbered **hotspots** with title/description/media, component list (as in ref 27 "Available tools / Key components"), wireframe/x-ray toggle (P1). Loads poster first; tap to load model. Shows model size before load when > 3 MB on cellular. | P0                             |
| L-LN-7  | `ar` block: _View in your space_ via `<model-viewer>` (WebXR on Android Chrome / Scene Viewer, Quick Look on iOS with USDZ). Graceful fallback to 3D viewer.                                                                                                                                                              | P0                             |
| L-LN-8  | `hotspot_tour`: guided camera tour through hotspots in order with narration text (TTS optional P1).                                                                                                                                                                                                                       | P0                             |
| L-LN-9  | `procedure_sim`: step-by-step interactive procedure on a 3D model (e.g. _disconnect power → remove guard → inspect brushes_). Learner selects the correct part/action per step; wrong choices give feedback; score recorded.                                                                                              | P1 (one demo in ENG-101 is P0) |
| L-LN-10 | `scenario`: branching decision (2–4 options per node), feedback per choice, end-state score.                                                                                                                                                                                                                              | P1                             |
| L-LN-11 | Section completion: _Mark as complete_ enabled when required blocks are done (e.g. quiz passed, 3D tour viewed). Completion toasts, XP awards, topic completion card (as in ref 28, upgraded).                                                                                                                            | P0                             |
| L-LN-12 | Offline tolerance: text/images of the current topic cached by the service worker; progress queued offline and synced on reconnect.                                                                                                                                                                                        | P1                             |
| L-LN-13 | Notes per section (private), bookmarks.                                                                                                                                                                                                                                                                                   | P2                             |
| L-LN-14 | Accessibility: every 3D block has a text alternative (component list + description); captions on all video.                                                                                                                                                                                                               | P0                             |

### 7.5 Practise — VR

**Routes:** `/practise`

| ID     | Requirement                                                                                                                                                       | Pri |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| L-PR-1 | List of VR worlds with learner's best scores and attempts history (from `VRSessionResult`).                                                                       | P0  |
| L-PR-2 | Upcoming expo/kiosk stops near the learner (province/district) from `ExpoEvent`.                                                                                  | P0  |
| L-PR-3 | _Link a VR session:_ enter a claim code from a later kiosk visit to add results.                                                                                  | P0  |
| L-PR-4 | Result detail: score, time, accuracy, safety errors, decision quality, rubric breakdown (radar/bar chart), comparison to cohort percentile (only if cohort ≥ 20). | P0  |
| L-PR-5 | Book a VR session slot at a lab/partner site.                                                                                                                     | P2  |

### 7.6 Assess _(ref screens 15–21)_

| ID     | Requirement                                                                                                                                                                                                                                                                                         | Pri |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| L-AS-1 | Quiz engine: single choice, multiple choice, true/false, image-hotspot (tap the correct part on an image/3D), ordering. Per-question feedback, pass mark configurable (default 70%), unlimited retries for formative, configurable attempts for summative.                                          | P0  |
| L-AS-2 | Topic assessment (summative) unlocks when all sections complete.                                                                                                                                                                                                                                    | P0  |
| L-AS-3 | **Portfolio of Evidence (PoE):** for credit-bearing topics, learner uploads evidence items (photo, PDF, short video ≤ 60 s, text reflection) against assessment criteria. Status: submitted → under review → competent / not yet competent (admin-reviewed in MVP; Bantu assessor role in Phase 2). | P0  |
| L-AS-4 | Proctored exam mode (webcam)                                                                                                                                                                                                                                                                        | P2  |

### 7.7 Credentials & portfolio

**Routes:** `/credentials`, `/credentials/[id]`, public `/verify/[publicId]`, `/portfolio` (learner), public `/p/[handle]` (opt-in)

| ID     | Requirement                                                                                                                                                                                                                               | Pri |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| L-CR-1 | Certificate of completion issued automatically on course completion (PDF generated server-side; Veza branding; partner logo for co-created/accredited).                                                                                   | P0  |
| L-CR-2 | Each credential has a public verification page `/verify/[publicId]` showing learner name, credential, issuer, date, status (valid/revoked) — and a QR on the PDF linking to it. Data exposed is limited to what the learner consented to. | P0  |
| L-CR-3 | Credentials exported as **Open Badges 3.0**-compatible JSON (Verifiable Credential shape; signing P1).                                                                                                                                    | P1  |
| L-CR-4 | Credit-bearing tracking: status timeline _Enrolled → Assessed → Moderated → Submitted to partner → Recorded_ (admin-updated in MVP).                                                                                                      | P0  |
| L-CR-5 | Portfolio page: courses, credentials, best VR scores, badges, featured 3D/AR work, skills list. Opt-in public link `/p/[handle]` for sharing with employers.                                                                              | P1  |

### 7.8 Opportunities _(new — see §9.1 for engine)_

**Routes:** `/opportunities`, `/opportunities/[id]`, `/opportunities/invites`, `/opportunities/applications`

| ID     | Requirement                                                                                                                                                                                                                                 | Pri |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| L-OP-1 | **For you** tab: learner's matches sorted by score, each showing _why you match_ (top 3 reasons) and any **readiness gaps** with deep links (_"Complete Topic 4 to qualify"_).                                                              | P0  |
| L-OP-2 | **Invites** tab: personal invitations with sponsor/partner, deadline, _Accept / Save / Not for me_ (+ optional reason).                                                                                                                     | P0  |
| L-OP-3 | **Browse** tab: all open opportunities the learner is eligible to view, filterable by type, industry, province.                                                                                                                             | P0  |
| L-OP-4 | Opportunity detail: type (bursary, learnership, internship, YES placement, job-shadow, job, short course), partner, description, eligibility, location, stipend/value note, closing date, how to apply (in-platform form or external link). | P0  |
| L-OP-5 | Apply in-platform: pre-filled from profile + partner-specific questions (configurable form schema) + attach credentials/portfolio. On submit, learner explicitly consents to share named profile with that partner.                         | P0  |
| L-OP-6 | **Applications** tab: status pipeline _Invited → Applied → Shortlisted → Interview → Offered → Placed / Unsuccessful / Withdrawn_, with timestamps and notes visible to learner.                                                            | P0  |
| L-OP-7 | Restricted mode (under-18 without consent / opted out of matching): opportunities pages show an explainer and how to enable.                                                                                                                | P0  |
| L-OP-8 | Notifications for new invite, status change, deadline in 3 days (in-app + SMS/WhatsApp per learner preference, quiet hours 20:00–07:00).                                                                                                    | P0  |

### 7.9 AI Career Coach _(see §9.2 for full spec)_

**Route:** `/coach` + global floating panel

| ID     | Requirement                                                                                                                           | Pri |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------- | --- |
| L-CO-1 | Chat panel available on every learner page; context-aware (knows the current page/course/career).                                     | P0  |
| L-CO-2 | Text chat in English, isiZulu, Sesotho, Setswana, isiXhosa, Afrikaans (MVP launch quality: English + isiZulu + Sesotho; others beta). | P0  |
| L-CO-3 | Voice input/output (push-to-talk) via speech provider abstraction.                                                                    | P1  |
| L-CO-4 | Suggested prompts per context (_"How do I become a pilot?"_, _"Explain this hotspot"_, _"Which bursaries fit me?"_).                  | P0  |
| L-CO-5 | Thumbs up/down + optional comment on every answer.                                                                                    | P0  |
| L-CO-6 | _Talk to a person_ escalation creates a support ticket for admins.                                                                    | P0  |

### 7.10 Gamification

| ID     | Requirement                                                                                                                                                                                                                | Pri |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| L-GM-1 | XP awards: section complete 10, quiz pass 20 (+10 first-try), topic complete 50, course complete 200, VR session linked 30, AR launch 5 (max 3/day), streak day 5. Values in config.                                       | P0  |
| L-GM-2 | Levels: thresholds 0/100/300/600/1000/1500/2100/2800… (`level n = 50·n·(n+1)` approx; config).                                                                                                                             | P0  |
| L-GM-3 | Badges (seed 15): _First Flight_ (claimed expo), _Explorer_ (visited all 5 worlds), _Hands-On_ (first procedure sim), _AR Pioneer_, _Streak 7_, _Course Complete_, per-industry _Foundations_ badges, _Invited_, _Placed_. | P0  |
| L-GM-4 | Leaderboards: school and district, weekly XP, opt-in only, minimum 10 participants, first name + initial only.                                                                                                             | P1  |

### 7.11 Recommendations — "next best step" rules (deterministic, MVP)

Evaluate in order; first match wins:

1. Restricted mode & guardian consent pending > 48 h → _Remind your guardian_ (resend link).
2. Pending invite with deadline ≤ 7 days → _Respond to your invite from {partner}_.
3. In-progress section → _Continue {section}_.
4. Topic complete but assessment not attempted → _Take the {topic} check_.
5. Highest-interest world with no course started → _Start {course}_.
6. Readiness gap on a top match → _Complete {item} to qualify for {opportunity}_.
7. Fewer than 3 worlds explored → _Explore {next world}_.
8. Default → _Ask your coach what to do next_.

### 7.12 Profile, settings & support

| ID     | Requirement                                                                                                                                           | Pri |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| L-PF-1 | Edit profile, subjects, school, language, notification channels (in-app, SMS, WhatsApp) and quiet hours.                                              | P0  |
| L-PF-2 | Privacy centre: view/change consents, download my data (JSON + PDF summary), request account deletion (30-day grace).                                 | P0  |
| L-PF-3 | Data-saver mode: on by default when `navigator.connection.saveData` or effective type ≤ 3g; disables autoplay video and auto-loading 3D; shows sizes. | P0  |
| L-PF-4 | Help centre (FAQ articles), support ticket form, WhatsApp support link.                                                                               | P0  |

### 7.13 Veza Pay (stipend wallet) — low priority

| ID     | Requirement                                                                                                             | Pri             |
| ------ | ----------------------------------------------------------------------------------------------------------------------- | --------------- |
| L-VP-1 | Data model & read-only wallet screen showing stipend schedule and ledger entries created by admin (no money movement).  | P1              |
| L-VP-2 | Integrate a payments/disbursement provider for real stipends (YES / learnerships); KYC tier rules; double-entry ledger. | P2              |
| L-VP-3 | Never display full card/account numbers; last 4 digits only.                                                            | P0 (when built) |

---

## 8. Feature requirements — admin (MVP)

**Route group:** `/admin` (role `ADMIN` or `SUPER_ADMIN`). Desktop-first, responsive.

| ID   | Requirement                                                                                                                                                                                                                                                 | Pri |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| A-1  | **Dashboard:** funnel (§2.4) with date/province/industry/expo-event filters; active learners; credentials; placements.                                                                                                                                      | P0  |
| A-2  | **Industries & careers CRUD** incl. subjects, study routes, sponsor attribution, 3D hero asset.                                                                                                                                                             | P0  |
| A-3  | **Course builder:** course → topics → sections → blocks; drag to reorder; block editors for each block type; preview as learner; draft/published states; versioning (publish creates immutable version; learners keep progress mapped by stable block IDs). | P0  |
| A-4  | **3D asset library:** upload glTF/GLB (+ optional USDZ), auto-generate poster image and LODs/compressed variant via pipeline (§13.5), edit hotspots visually (click on model to place), define explode groups, component list.                              | P0  |
| A-5  | **Quiz/question bank** with tagging by assessment criterion.                                                                                                                                                                                                | P0  |
| A-6  | **Learners:** search, view profile/progress/consents, verify identity for credit-bearing enrolment, reset OTP lockouts, deactivate. Access is audit-logged.                                                                                                 | P0  |
| A-7  | **PoE review queue:** view evidence, mark competent / not yet competent with feedback.                                                                                                                                                                      | P0  |
| A-8  | **Credentials:** issue, revoke, update credit-bearing status timeline.                                                                                                                                                                                      | P0  |
| A-9  | **Partners & sponsors:** CRUD for `Partner` (types: sponsor, opportunity partner, content partner, accreditation partner), logos, booth/industry links.                                                                                                     | P0  |
| A-10 | **Opportunities:** create on behalf of partners (form schema builder for application questions, eligibility rules UI), open/close, view matches, **approve & send invites** (bulk), manage applications pipeline, record placements.                        | P0  |
| A-11 | **Expo events & devices:** CRUD expo events (date, venue, school, district, sponsor), register kiosk devices and rotate API keys.                                                                                                                           | P0  |
| A-12 | **Heatmap (internal):** see §9.3.                                                                                                                                                                                                                           | P0  |
| A-13 | **Sponsor impact pack export:** per sponsor/industry/date range → PDF + CSV (aggregates only).                                                                                                                                                              | P0  |
| A-14 | **Coach review:** flagged conversations, low-rated answers, escalations; knowledge-base management (career facts, FAQs).                                                                                                                                    | P0  |
| A-15 | **Notices & notifications:** compose targeted notices and SMS/WhatsApp broadcasts (with consent + quiet-hours enforcement).                                                                                                                                 | P1  |
| A-16 | **Audit log** viewer.                                                                                                                                                                                                                                       | P0  |
| A-17 | **Settings:** XP values, pass marks, matching weights/thresholds, privacy thresholds, feature flags.                                                                                                                                                        | P0  |

---

## 9. Differentiators

### 9.1 Opportunities matching & invitations

**Purpose:** answer _"and then what?"_ — every learner path ends in a real next step, and every sponsor sees its booth turn into a talent pipeline.

**Opportunity types:** `BURSARY`, `LEARNERSHIP`, `INTERNSHIP`, `YES_PLACEMENT`, `JOB_SHADOW`, `JOB`, `SHORT_COURSE`, `COMPETITION`.

**Eligibility (hard filters — all must pass)** stored as JSON rules on `Opportunity.eligibility`:

```json
{
  "ageMin": 15,
  "ageMax": 18,
  "provinces": ["LP", "MP"],
  "districts": [],
  "grades": [10, 11, 12],
  "inSchool": true,
  "requiredSubjects": ["MATHEMATICS", "PHYSICAL_SCIENCE"],
  "requiredCredentials": ["course:AVI-101"],
  "requiredTopicsComplete": ["AVI-101/t1", "AVI-101/t2"],
  "minVrScore": { "world": "AVI", "score": 60 },
  "industries": ["AVI"]
}
```

Learners must also have `consent.matching = true` (and guardian consent if < 18).

**Scoring (0–100) — weights configurable in Settings:**

| Signal      | Weight | Computation                                                                                                                           |
| ----------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Interest    | 30     | Normalised interest score for opportunity industry (expo world played, _I'm interested_ toggles, time in world/careers, coach topics) |
| Performance | 25     | Best VR score in related world (0–100) blended 50/50 with average quiz score in related courses                                       |
| Progress    | 20     | % of related course(s) completed; +bonus if credential held                                                                           |
| Location    | 15     | 100 same district · 70 same province · 30 adjacent province · 0 otherwise (or 100 if opportunity is remote)                           |
| Activity    | 10     | Recency: active in last 7 days = 100, 30 days = 60, 90 days = 20                                                                      |

**Near-miss / readiness gaps:** if a learner fails only `requiredTopicsComplete`, `requiredCredentials` or `minVrScore`, create a `Match` with `status = NEAR_MISS` and a list of gaps with deep links. Near-misses drive the _next best step_ and coach suggestions.

**Explainability:** every `Match` stores `reasons[]` (top 3 human-readable strings, e.g. _"Played Aviation at the expo (score 78)"_, _"Lives in Capricorn District"_, _"Completed 3 of 5 Aviation Foundations topics"_) and `gaps[]`.

**Pipeline:**

1. `matchOpportunity(opportunityId)` job runs on opportunity publish, nightly, and when a learner completes a topic/course or links a VR session (`matchLearner(learnerId)`).
2. Matches ≥ `inviteThreshold` (default 70) are queued as _suggested invites_.
3. MVP: admin reviews and **approves invites in bulk** (A-10). Phase 2: partner approves in their portal, or auto-invite if partner enables it.
4. Invite caps: max 3 new invites per learner per 7 days; partner can set max invites per opportunity.
5. Invitation sent in-app + SMS/WhatsApp (respecting preferences & quiet hours); deep link to `/opportunities/invites/[id]`.
6. Learner accepts → applies (L-OP-5) → status pipeline managed by admin (MVP) / partner (Phase 2) → `Placement` recorded with start date and type.
7. Outcomes roll into sponsor impact packs and the heatmap.

**Fairness guardrails:** matching never uses gender, race, disability or home language as signals. Monitor invite rates by province, school quintile and gender in an internal fairness report (A-1 tab); alert if any group's invite rate is < 80% of the overall rate for the same eligibility pool.

**Acceptance criteria**

- Given the seed data, publishing the seed aviation bursary produces ≥ 1 match with 3 reasons and correct eligibility filtering (unit + integration tests with fixtures for each hard filter).
- A learner without matching consent never appears in matches (test).
- A near-miss learner sees the exact gap and the deep link opens the right topic.
- Invite caps and quiet hours are enforced (tests with fake clock).

### 9.2 AI Career Coach (multilingual)

**Purpose:** a personal guide that explains, motivates and directs — in the learner's language — grounded in Veza's content and verified career data.

**Capabilities**

- Career Q&A (_"What does a radiographer do? What subjects? Where can I study in Gauteng?"_).
- Learning help: explain the current section, a hotspot or a quiz concept (never gives summative assessment answers).
- Planning: _"What should I do next?"_ → uses the next-best-step rules + matches.
- Opportunities: explain why the learner matches, what's missing, how to apply.
- Application help: draft a motivation letter _with_ the learner (coaching, not ghost-writing the full text for summative/credit applications).

**Architecture**

- Server route `POST /api/coach/messages` (streaming). LLM via provider abstraction (`CoachLLM`), default Anthropic Claude API.
- **Retrieval (RAG):** pgvector index over published course sections, career records, FAQs and admin knowledge base. Chunk ~500 tokens with metadata (industry, course, language).
- **Tools the model can call:**
  - `get_learner_context()` → first name, age band, grade, province, language, interests, progress summary, credentials, restricted-mode flag (no phone/ID/DOB).
  - `search_content(query, industry?)`
  - `get_career(slug)`
  - `list_matches(limit)` / `explain_match(opportunityId)` (disabled in restricted mode)
  - `get_next_step()`
  - `create_support_ticket(summary)` (escalation)
- **Languages:** respond in the learner's message language; default to profile language. Text MVP: EN, isiZulu, Sesotho high-quality targets; Setswana, isiXhosa, Afrikaans beta. Native-speaker review of system prompts and a 50-question evaluation set per language before launch.
- **Voice (P1):** `SpeechProvider` abstraction for STT/TTS. Evaluate vendors for SA-language quality (e.g. Lelapa AI, Google Cloud, Azure) — record decision in `docs/DECISIONS.md`.

**Guardrails**

- Age-appropriate mode for under-18s; no dating, no medical/legal/financial advice beyond general careers info; never requests personal identifiers.
- Distress/safety detection → empathetic response, configurable SA helpline list, and escalation ticket flagged _urgent_ to admins.
- No answers to summative quiz/assessment items (questions tagged `summative` are excluded from retrieval and the model is instructed to coach instead).
- Facts about careers come from retrieved records; if not found, say so and suggest _Ask a person_.
- PII redaction before logging; conversations retained 12 months then deleted (configurable).
- Rate limit: 40 messages/learner/day (config); token budget per message.
- Cost control: cache retrieval results; small model for classification/routing, larger model for answers.

**System prompt outline (store in `packages/coach/prompts/system.md`, versioned):** identity (_"Sgela Coach, a friendly career guide from Veza"_), audience (SA youth 13–35), tone (warm, encouraging, plain language, short paragraphs, mobile-friendly), language rules, grounding rules (cite which course/career record), tools usage, guardrails above, always end with one concrete next step.

**Acceptance criteria**

- Coach answers in isiZulu when asked in isiZulu (eval set pass ≥ 85% rated acceptable by native reviewer).
- Restricted-mode learner asking about bursaries gets explanation of guardian consent, not matches.
- Asking for a summative answer yields coaching, not the answer (eval).
- Distress test prompts produce escalation tickets (eval).

### 9.3 National Career-Interest Heatmap

**Purpose:** show where South Africa's next generation of talent wants to go — Veza's data-visualisation showcase and a data product for sponsors, SETAs and government.

**Data source:** `InterestSignal` (append-only, anonymised): `{ industryCode, careerId?, signalType, weight, provinceCode, districtCode, ageBand, gradeBand, schoolQuintile?, source (EXPO|PLATFORM), expoEventId?, sponsorId?, occurredAt }`. **No learner ID stored on the signal table** (link only via a one-way salted hash for de-duplication within a 24 h window).

**Signal types & weights (config):** `VR_WORLD_PLAYED` 3, `VR_HIGH_SCORE` (≥ 75) 2, `WORLD_INTEREST_TOGGLE` 2, `CAREER_VIEW` 1, `COURSE_ENROL` 3, `TOPIC_COMPLETE` 2, `CREDENTIAL` 5, `OPPORTUNITY_ACCEPT` 4.

**Metrics:** interest share per industry (%), interest index (weighted signals per 1,000 learners), engagement minutes, average VR score, conversion (expo → learner → credential → placed), trend over time.

**Geography:** 9 provinces and 52 district/metropolitan municipalities (Municipal Demarcation Board boundaries as simplified GeoJSON/TopoJSON in `packages/geo`).

**Privacy thresholds:** any cell (geography × filter combination) with < 20 distinct learners is suppressed and shown as _"< 20"_; enforce server-side in the aggregation query, not in the UI. Exports obey the same rule.

**Internal heatmap UI (MVP, `/admin/heatmap`):**

- 3D extruded map of SA (three.js / react-three-fiber or deck.gl) — height = interest index, colour = dominant industry; toggle to choropleth 2D.
- Filters: industry, career, date range, age band, grade band, source, sponsor/expo event.
- Drill-down: national → province → district; side panel with industry breakdown bars, trend sparkline, funnel.
- Compare mode: two provinces/districts side by side.
- Export PNG + CSV (thresholded).

**Aggregation:** nightly materialised views (`mv_interest_district_daily`) + on-demand query for last 24 h; target < 1.5 s response for any filter combination at 1M signals.

**Phases:** MVP internal → Phase 2 sponsor view (scoped to their industry/booth + national context) → Phase 3 public headline map + SETA/government reports and API (paid).

**Acceptance criteria**

- Seed generator produces 50k synthetic signals; map renders all 52 districts; suppression verified by test (a district with 19 learners shows _< 20_).
- No query path from heatmap endpoints can return learner-level rows (code review + test).

---

## 10. Later-phase roles & features (design for now, build later)

| Role                               | Phase | Core features                                                                                                                                                 |
| ---------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Facilitator**                    | 2     | Kiosk companion app: learner check-in, pre-expo clarity check, print/show claim QR, device status, event stats                                                |
| **Sponsor**                        | 2     | Booth dashboard (sessions, dwell, regional interest, conversions, credentials, placements), heatmap view scoped to sponsor, B-BBEE/SED evidence pack download |
| **Opportunity partner / employer** | 2     | Post opportunities, eligibility builder, view anonymised matched pool, approve invites, manage applicants to placement, placement reporting                   |
| **Industry content partner**       | 2     | Review/approve co-created content, SME comments on blocks, co-branding settings                                                                               |
| **Assessor / moderator (Bantu)**   | 2     | PoE review, competency decisions, moderation sampling, learner records export for submission                                                                  |
| **School / teacher**               | 3     | Class roster, progress, subject-choice insights, class leaderboards, expo booking                                                                             |
| **Funder viewer (SETA/NSF)**       | 3     | Read-only impact and heatmap reports for funded cohorts                                                                                                       |

Design implication for MVP: implement **RBAC with organisation scoping** from day one (`Membership { userId, orgId, role }`) so these roles plug in without schema rewrites.

---

## 11. Data model

Prisma schema lives in `packages/db/prisma/schema.prisma`. All IDs are `cuid2` strings; all tables have `createdAt`, `updatedAt`; soft delete via `deletedAt` where noted. Below is the normative model (fields abbreviated where obvious).

### 11.1 Identity, consent & orgs

```prisma
model User {
  id            String   @id @default(cuid())
  phoneE164     String   @unique
  email         String?  @unique
  role          UserRole @default(LEARNER)   // LEARNER | ADMIN | SUPER_ADMIN (platform roles)
  status        UserStatus @default(ACTIVE)  // ACTIVE | SUSPENDED | DELETION_PENDING
  learner       Learner?
  memberships   Membership[]
  sessions      AuthSession[]
  lastLoginAt   DateTime?
  deletedAt     DateTime?
}

model OtpChallenge { id String @id; phoneE164 String; codeHash String; purpose OtpPurpose; attempts Int @default(0); expiresAt DateTime; consumedAt DateTime?; ipHash String }

model Learner {
  id              String  @id @default(cuid())
  userId          String  @unique
  firstName       String
  lastName        String?
  dateOfBirth     DateTime
  gender          Gender?            // FEMALE | MALE | NON_BINARY | PREFER_NOT_TO_SAY
  provinceCode    String             // EC FS GP KZN LP MP NC NW WC
  districtCode    String             // MDB code
  schoolId        String?
  schoolNameFree  String?
  inSchool        Boolean
  grade           Int?               // 8–12
  highestQualification String?
  subjects        LearnerSubject[]
  language        LangCode @default(EN)   // EN ZU ST TN XH AF
  handle          String?  @unique   // public portfolio
  restricted      Boolean  @default(true) // true until consent complete
  xp              Int      @default(0)
  level           Int      @default(1)
  streakDays      Int      @default(0)
  lastActiveAt    DateTime?
  dataSaver       Boolean  @default(false)
  notifyChannels  Json     // { inApp: true, sms: true, whatsapp: false }
  quietHours      Json     // { start: "20:00", end: "07:00" }
  identityStatus  IdentityStatus @default(NONE) // NONE | PENDING | VERIFIED | REJECTED
  guardian        Guardian?
  consents        Consent[]
  // relations: enrolments, progress, attempts, evidence, credentials, matches, invitations, applications, expoSessions, badges, wallet, coachConversations
}

model Guardian { id String @id; learnerId String @unique; name String; phoneE164 String; relationship String?; consentToken String @unique; tokenExpiresAt DateTime; remindersSent Int @default(0) }

model Consent {
  id           String @id
  learnerId    String
  scope        ConsentScope   // PLATFORM | MATCHING | PARTNER_CONTACT | MARKETING | PUBLIC_PORTFOLIO | ACCREDITATION_SHARE
  granted      Boolean
  grantedBy    ConsentActor   // LEARNER | GUARDIAN
  textVersion  String
  language     LangCode
  ipHash       String?
  createdAt    DateTime @default(now())   // append-only; latest per scope wins
}

model Organisation { id String @id; name String; type OrgType /* SPONSOR | OPPORTUNITY_PARTNER | CONTENT_PARTNER | ACCREDITATION_PARTNER | SCHOOL | FUNDER | VEZA */; logoUrl String?; website String?; bbbeeLevel Int?; memberships Membership[] }
model Membership   { id String @id; userId String; orgId String; role OrgRole /* OWNER | MANAGER | VIEWER | ASSESSOR | FACILITATOR | TEACHER */; @@unique([userId, orgId]) }

model School  { id String @id; emisNumber String? @unique; name String; provinceCode String; districtCode String; quintile Int?; }
model Subject { code String @id; name String }   // MATHEMATICS, MATHEMATICAL_LITERACY, PHYSICAL_SCIENCE, LIFE_SCIENCES, AGRICULTURAL_SCIENCES, EGD, HOSPITALITY_STUDIES, CONSUMER_STUDIES, ACCOUNTING, IT, CAT, ...
model LearnerSubject { learnerId String; subjectCode String; @@id([learnerId, subjectCode]) }
```

### 11.2 Industries, careers, content

```prisma
model Industry { code String @id /* AVI ENG CUL MED AGR */; name String; tagline String; whyItMatters Json; heroAssetId String?; color String; sponsorOrgId String?; sortOrder Int; careers Career[]; courses Course[] }

model Career {
  id String @id; slug String @unique; industryCode String
  title String; summary String; dayInLife Json /* string[] */; studyRoutes Json /* {type,label,url?}[] */
  subjectsRequired String[]; subjectsRecommended String[]
  salaryBandNote String?; roleModel Json?; heroAssetId String?
  translations Json?   // { zu: {title, summary,...}, st: {...} }
}

model Course {
  id String @id; slug String @unique; code String @unique   // AGR-101
  industryCode String?; title String; summary String; level CourseLevel; durationMins Int
  creditBearing Boolean @default(false)
  accreditationPartnerId String?   // Organisation (Bantu)
  qualificationRef String?          // QCTO / SAQA reference — TBC
  nqfLevel Int?; credits Int?
  contentPartnerId String?
  objectives Json; prerequisites Json; assessmentInfo Json
  status PublishStatus @default(DRAFT) // DRAFT | PUBLISHED | ARCHIVED
  version Int @default(1); publishedAt DateTime?
  topics Topic[]
}

model Topic   { id String @id; courseId String; slug String; title String; summary String?; order Int; estMins Int; assessmentCriteria Json; hasAr Boolean @default(false); sections Section[]; @@unique([courseId, slug]) }
model Section { id String @id; topicId String; slug String; title String; order Int; estMins Int; completionRule Json /* { requireBlocks: [blockId], quizPass: true } */; blocks ContentBlock[]; @@unique([topicId, slug]) }

model ContentBlock {
  id String @id            // stable across versions
  sectionId String; order Int
  type BlockType           // TEXT IMAGE VIDEO MODEL3D AR HOTSPOT_TOUR PROCEDURE_SIM QUIZ SCENARIO CALLOUT DOWNLOAD
  data Json                // type-specific payload, validated by zod schemas in packages/content
  assetId String?
  translations Json?
}

model Asset3D {
  id String @id; name String; industryCode String?
  glbUrl String; glbSizeBytes Int; glbLiteUrl String?; glbLiteSizeBytes Int?
  usdzUrl String?; posterUrl String
  hotspots Json     // [{ id, n, label, description, position:[x,y,z], normal:[x,y,z], mediaUrl? }]
  explodeGroups Json // [{ nodeName, direction:[x,y,z], distance }]
  components Json   // [{ name, description }]
  license String; sourceNote String?
  processingStatus AssetStatus // UPLOADED | PROCESSING | READY | FAILED
}

model MediaAsset { id String @id; kind MediaKind; url String; sizeBytes Int; variants Json?; captionsUrl String?; alt String? }
```

### 11.3 Learning, assessment, credentials, gamification

```prisma
model Enrolment { id String @id; learnerId String; courseId String; courseVersion Int; status EnrolStatus /* ACTIVE COMPLETED WITHDRAWN PENDING_VERIFICATION */; enrolledAt DateTime; completedAt DateTime?; @@unique([learnerId, courseId]) }
model SectionProgress { learnerId String; sectionId String; status ProgressStatus /* NOT_STARTED IN_PROGRESS COMPLETED */; blocksDone String[]; timeSpentSec Int @default(0); completedAt DateTime?; @@id([learnerId, sectionId]) }
model TopicProgress   { learnerId String; topicId String; percent Int; completedAt DateTime?; @@id([learnerId, topicId]) }

model Question { id String @id; type QuestionType; prompt Json; options Json; answer Json; feedback Json?; criterionTags String[]; summative Boolean @default(false); industryCode String? }
model Quiz     { id String @id; title String; questionIds String[]; passMark Int @default(70); maxAttempts Int?; summative Boolean @default(false); shuffle Boolean @default(true) }
model Attempt  { id String @id; learnerId String; quizId String; answers Json; score Int; passed Boolean; startedAt DateTime; submittedAt DateTime? }

model EvidenceItem { id String @id; learnerId String; topicId String; criterionRef String; kind EvidenceKind; fileUrl String?; text String?; status EvidenceStatus /* SUBMITTED UNDER_REVIEW COMPETENT NOT_YET_COMPETENT */; reviewerId String?; feedback String?; reviewedAt DateTime? }

model Credential {
  id String @id; publicId String @unique; learnerId String; courseId String?
  kind CredentialKind  // COMPLETION | ACCREDITED | BADGE
  title String; issuerOrgId String; partnerOrgId String?
  issuedAt DateTime; revokedAt DateTime?; pdfUrl String?
  accreditationStatus AccredStatus? // ENROLLED ASSESSED MODERATED SUBMITTED RECORDED
  statusHistory Json; obv3 Json?
}

model Badge { code String @id; name String; description String; icon String; criteria Json }
model LearnerBadge { learnerId String; badgeCode String; awardedAt DateTime; @@id([learnerId, badgeCode]) }
model XpEvent { id String @id; learnerId String; reason String; amount Int; refType String?; refId String?; createdAt DateTime @default(now()) }
```

### 11.4 Expo & VR

```prisma
model ExpoEvent  { id String @id; name String; startsAt DateTime; endsAt DateTime; venueType VenueType /* SCHOOL MALL CAMPUS CAREER_FAIR OTHER */; venueName String; schoolId String?; provinceCode String; districtCode String; sponsorOrgId String?; unitCode String? }
model KioskDevice { id String @id; label String; apiKeyHash String; unitCode String?; lastSeenAt DateTime?; active Boolean @default(true) }
model ExpoSession {
  id String @id; expoEventId String?; deviceId String
  claimCode String @unique          // 6 chars, Crockford base32, no ambiguous chars
  claimExpiresAt DateTime; claimedByLearnerId String?; claimedAt DateTime?
  startedAt DateTime; endedAt DateTime
  ageBand String?; gradeBand String?   // from facilitator pre-check (optional)
  clarityPre Int?
  results VRSessionResult[]
}
model VRSessionResult {
  id String @id; expoSessionId String?; learnerId String?
  worldCode String /* AVI ENG CUL MED AGR */; scenarioId String; appVersion String
  score Int; durationSec Int; accuracy Int?; safetyErrors Int?; decisionScore Int?
  rubric Json   // [{ criterion, score, max }]
  events Json?  // optional compressed telemetry summary
  completed Boolean; recordedAt DateTime
}
```

### 11.5 Opportunities

```prisma
model Opportunity {
  id String @id; partnerOrgId String; sponsorOrgId String?
  type OppType; title String; summary String; description String
  industryCodes String[]; provinceCodes String[]; remote Boolean @default(false)
  eligibility Json; valueNote String?; stipendNote String?
  opensAt DateTime; closesAt DateTime; slots Int?; maxInvites Int?
  applyMode ApplyMode  // IN_PLATFORM | EXTERNAL_LINK
  externalUrl String?; formSchema Json?   // JSON schema for partner questions
  autoInvite Boolean @default(false)
  status OppStatus     // DRAFT OPEN CLOSED ARCHIVED
}
model Match       { id String @id; opportunityId String; learnerId String; score Int; status MatchStatus /* ELIGIBLE NEAR_MISS SUGGESTED INVITED DISMISSED */; reasons Json; gaps Json; computedAt DateTime; @@unique([opportunityId, learnerId]) }
model Invitation  { id String @id; matchId String @unique; sentAt DateTime; channels String[]; respondedAt DateTime?; response InviteResponse? /* ACCEPTED SAVED DECLINED */; declineReason String?; expiresAt DateTime }
model Application { id String @id; opportunityId String; learnerId String; invitationId String?; answers Json; attachments Json; status AppStatus /* APPLIED SHORTLISTED INTERVIEW OFFERED PLACED UNSUCCESSFUL WITHDRAWN */; history Json; consentToShareAt DateTime; @@unique([opportunityId, learnerId]) }
model Placement   { id String @id; applicationId String @unique; startDate DateTime; endDate DateTime?; type OppType; notes String? }
```

### 11.6 Coach, heatmap, wallet, ops

```prisma
model CoachConversation { id String @id; learnerId String; language LangCode; context Json; startedAt DateTime; messages CoachMessage[] }
model CoachMessage { id String @id; conversationId String; role String /* user | assistant | tool */; content String; toolCalls Json?; rating Int? /* -1, 1 */; ratingComment String?; flagged Boolean @default(false); tokensIn Int?; tokensOut Int?; createdAt DateTime @default(now()) }
model KnowledgeDoc { id String @id; title String; body String; language LangCode; industryCode String?; status PublishStatus }
model Embedding    { id String @id; sourceType String; sourceId String; chunk String; language LangCode; meta Json; vector Unsupported("vector(1024)") }

model InterestSignal {
  id BigInt @id @default(autoincrement())
  learnerHash String?    // salted one-way hash, rotated salt per quarter; NOT a FK
  industryCode String; careerId String?; signalType String; weight Int
  provinceCode String; districtCode String; ageBand String; gradeBand String?; schoolQuintile Int?
  source String; expoEventId String?; sponsorOrgId String?
  occurredAt DateTime
  @@index([occurredAt, districtCode, industryCode])
}

model Wallet { id String @id; learnerId String @unique; currency String @default("ZAR"); status String }
model LedgerEntry { id String @id; walletId String; amountCents Int; direction String /* CREDIT DEBIT */; kind String /* STIPEND ADJUSTMENT PAYOUT */; reference String; programmeOrgId String?; createdAt DateTime @default(now()) }

model Notification { id String @id; userId String; kind String; title String; body String; deepLink String?; channels String[]; sentAt DateTime?; readAt DateTime? }
model SupportTicket { id String @id; userId String?; source String /* FORM COACH WHATSAPP */; summary String; priority String; status String; assigneeId String? }
model Event { id BigInt @id @default(autoincrement()); userId String?; anonId String?; name String; props Json; occurredAt DateTime; @@index([name, occurredAt]) }  // product analytics
model AuditLog { id BigInt @id @default(autoincrement()); actorId String; action String; targetType String; targetId String; meta Json?; ipHash String?; createdAt DateTime @default(now()) }
model Setting { key String @id; value Json }
model FeatureFlag { key String @id; enabled Boolean; rules Json? }
```

---

## 12. API & integration contracts

### 12.1 Conventions

- Next.js App Router: UI via Server Components + Server Actions; external/integration endpoints under `/api/v1/*` (JSON, versioned).
- Validation with **zod** schemas shared from `packages/contracts`; generate OpenAPI 3.1 (`/api/v1/openapi.json`) from the same schemas.
- Errors: `{ "error": { "code": "CLAIM_EXPIRED", "message": "...", "details": {} } }` with correct HTTP status.
- Idempotency: `Idempotency-Key` header supported on all POSTs from devices.
- Rate limits via Upstash Redis (or equivalent) — per IP, per user, per device.

### 12.2 Internal endpoints (selected)

| Method & path                                   | Purpose                                                     |
| ----------------------------------------------- | ----------------------------------------------------------- |
| `POST /api/v1/auth/otp/request`                 | `{ phone, purpose }` → 202                                  |
| `POST /api/v1/auth/otp/verify`                  | `{ phone, code }` → session cookie                          |
| `GET /api/v1/claim/:code`                       | Public preview of an expo session (worlds, scores) — no PII |
| `POST /api/v1/claim/:code`                      | Authenticated — link session to learner                     |
| `POST /api/v1/consent/guardian/:token`          | Guardian grants/declines scopes                             |
| `POST /api/v1/progress/blocks`                  | Batch block-completion events (offline queue flush)         |
| `POST /api/v1/quizzes/:id/attempts`             | Submit attempt                                              |
| `POST /api/v1/evidence`                         | Create evidence item (signed upload URL flow)               |
| `GET /api/v1/opportunities?tab=for-you\|browse` | Learner opportunities                                       |
| `POST /api/v1/invitations/:id/respond`          | Accept/save/decline                                         |
| `POST /api/v1/applications`                     | Submit application                                          |
| `POST /api/coach/messages`                      | Streamed coach reply (SSE)                                  |
| `GET /api/v1/verify/:publicId`                  | Public credential verification JSON                         |
| `GET /api/v1/admin/heatmap`                     | Aggregates with thresholds (admin only)                     |
| `POST /api/v1/events`                           | Product analytics events (batched)                          |

### 12.3 VR kiosk ↔ platform contract (Unity team builds the client)

**Auth:** each `KioskDevice` has an API key (`Authorization: Bearer vk_live_…`); keys rotatable in admin; stored hashed.

**1) Create expo session at end of a learner's VR run**
`POST /api/v1/kiosk/sessions`

```json
{
  "deviceId": "kd_01",
  "expoEventId": "ev_2026_11_gp_soweto_01",
  "startedAt": "2026-11-20T09:12:00+02:00",
  "endedAt": "2026-11-20T09:27:40+02:00",
  "ageBand": "15-17",
  "gradeBand": "10-12",
  "clarityPre": 2,
  "results": [
    {
      "worldCode": "AVI",
      "scenarioId": "avi.preflight.v1",
      "appVersion": "1.4.0",
      "score": 78,
      "durationSec": 410,
      "accuracy": 82,
      "safetyErrors": 1,
      "decisionScore": 74,
      "completed": true,
      "rubric": [
        { "criterion": "Walkaround checks", "score": 8, "max": 10 },
        { "criterion": "Safety", "score": 7, "max": 10 }
      ]
    }
  ]
}
```

**Response 201**

```json
{
  "sessionId": "es_…",
  "claimCode": "K7Q4MX",
  "claimUrl": "https://sgela.veza.africa/claim/K7Q4MX",
  "qrPngUrl": "https://…/qr/K7Q4MX.png",
  "expiresAt": "2026-12-20T23:59:59+02:00"
}
```

The kiosk shows the QR + human code on screen and can print a card. Claim codes: 6 chars Crockford base32 (no I, L, O, U), unique, expire after 30 days (config).

**2) Link to an existing learner (returning visitor at kiosk, P1):** `POST /api/v1/kiosk/sessions/:id/link` with a short-lived **learner kiosk token** shown as QR in the learner's app (`/practise` → _Show my kiosk code_).

**3) Heartbeat:** `POST /api/v1/kiosk/heartbeat` `{ deviceId, appVersion, battery, queueDepth }` — updates `lastSeenAt`.

**Offline kiosks:** the Unity client queues sessions locally and syncs when online; the server accepts `startedAt` in the past (≤ 14 days) and dedupes via `Idempotency-Key`. Claim codes can be **pre-allocated** in blocks of 200 per device (`POST /api/v1/kiosk/claim-codes:allocate`) so the QR works even when the kiosk is offline at the moment of play.

### 12.4 Messaging providers (abstractions in `packages/messaging`)

- `SmsProvider.send(to, text)` — dev: console log; prod: SA bulk SMS vendor (decide; e.g. Clickatell / BulkSMS / Twilio).
- `WhatsAppProvider.sendTemplate(to, templateName, params)` — WhatsApp Business Cloud API; pre-approved templates: `otp_code`, `guardian_consent`, `new_invite`, `application_update`, `deadline_reminder`.
- All sends write a `Notification` row and respect consent, channel preference and quiet hours (OTP exempt from quiet hours).

### 12.5 Other provider abstractions

`IdentityVerificationProvider` (MVP: manual admin review), `SpeechProvider` (P1), `CoachLLM`, `EmbeddingProvider`, `StorageProvider` (S3-compatible), `PdfRenderer`, `PaymentsProvider` (Phase 2).

---

## 13. Technical architecture & stack

### 13.1 Stack (decided — change only via `docs/DECISIONS.md`)

| Concern                 | Choice                                                                                                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Monorepo                | pnpm workspaces + Turborepo                                                                                                                                      |
| Web app                 | Next.js 15 (App Router, React 19, TypeScript strict), deployed as PWA                                                                                            |
| Styling/UI              | Tailwind CSS v4 + shadcn/ui (Radix) themed with Veza tokens; lucide-react icons                                                                                  |
| i18n                    | next-intl; locales `en`, `zu`, `st`, `tn`, `xh`, `af` (UI strings English-complete at MVP; zu/st translated for onboarding, consent, nav; others progressively)  |
| 3D                      | three.js via @react-three/fiber + @react-three/drei; GLTFLoader with Draco + Meshopt + KTX2                                                                      |
| AR                      | `@google/model-viewer` web component (WebXR / Scene Viewer / Quick Look)                                                                                         |
| Charts                  | Recharts (learner) / visx or ECharts (admin)                                                                                                                     |
| Heatmap                 | react-three-fiber extruded geometry from TopoJSON (or deck.gl) — pick one in DECISIONS                                                                           |
| DB                      | PostgreSQL 16 + Prisma; pgvector extension                                                                                                                       |
| Cache/rate limit/queues | Redis (Upstash) + background jobs (Inngest or BullMQ worker)                                                                                                     |
| Auth                    | Auth.js v5 with custom phone-OTP credentials provider; DB sessions; RBAC middleware                                                                              |
| Storage/CDN             | S3-compatible (Cloudflare R2 or AWS S3) + CDN for 3D/media                                                                                                       |
| PDF                     | @react-pdf/renderer (certificates, impact packs)                                                                                                                 |
| LLM                     | Anthropic Claude API via `CoachLLM` abstraction                                                                                                                  |
| Observability           | Sentry (errors), OpenTelemetry traces, structured logs (pino)                                                                                                    |
| Analytics               | Own `Event` table (source of truth) + optional PostHog for product analytics (self-host/EU, configurable)                                                        |
| Testing                 | Vitest (unit), Playwright (e2e incl. mobile emulation), axe-core (a11y), k6 (load, heatmap)                                                                      |
| CI/CD                   | GitHub Actions: lint, typecheck, test, build, Prisma migrate check, Lighthouse CI                                                                                |
| Hosting                 | Prefer South African region for data at rest (AWS af-south-1 or Azure South Africa North). Dev/staging can run on Vercel + Neon/Supabase. Final decision in §20. |

### 13.2 Repository structure

```
veza-sgela/
├─ apps/
│  └─ web/                      # Next.js app (learner + admin + public)
│     ├─ app/
│     │  ├─ (public)/           # landing, claim, verify, consent, portfolio
│     │  ├─ (auth)/start/…      # onboarding
│     │  ├─ (learner)/          # home, explore, learn, practise, opportunities, credentials, coach, profile
│     │  ├─ admin/              # admin console
│     │  └─ api/                # /api/v1/*, /api/coach
│     ├─ components/            # app-specific components
│     ├─ lib/                   # auth, rbac, rate-limit, recommendations
│     └─ public/                # icons, manifest, offline page
├─ packages/
│  ├─ db/                       # prisma schema, migrations, seed
│  ├─ contracts/                # zod schemas + OpenAPI generation
│  ├─ ui/                       # design system (tokens, shadcn components)
│  ├─ three/                    # ModelViewer3D, Hotspots, ExplodeController, ProcedureSim, CompassScene, SAHeatmap
│  ├─ content/                  # block type schemas, renderers, MDX-lite
│  ├─ matching/                 # eligibility + scoring + reasons (pure TS, fully unit-tested)
│  ├─ coach/                    # prompts, tools, retrieval, guardrails, evals
│  ├─ messaging/                # SMS/WhatsApp providers + templates
│  ├─ geo/                      # provinces/districts TopoJSON + codes
│  ├─ analytics/                # event names, client + server trackers
│  └─ config/                   # eslint, tsconfig, tailwind preset
├─ tools/
│  └─ asset-pipeline/           # gltf-transform scripts: draco/meshopt, KTX2, LOD, poster render, USDZ
├─ docs/
│  ├─ DECISIONS.md
│  ├─ PRD.md                    # this document
│  └─ kiosk-api.md              # §12.3 for the Unity team
└─ .github/workflows/
```

### 13.3 Rendering & performance strategy

- Server Components for all content pages; client components only for interactive blocks, 3D, coach.
- 3D code split per block (`next/dynamic`, no SSR); three.js never in the initial bundle of non-3D pages.
- Poster-first 3D: show poster image + size; load on tap (always on cellular/data-saver; auto on Wi-Fi P1).
- Media: next/image with AVIF/WebP; video HLS with 240p/480p/720p variants.

### 13.4 Background jobs

| Job                  | Trigger                                                          |
| -------------------- | ---------------------------------------------------------------- |
| `match.opportunity`  | Opportunity published/updated; nightly                           |
| `match.learner`      | Topic/course complete, VR session linked, profile change         |
| `notify.dispatch`    | Notification created (respects quiet hours; delays until window) |
| `guardian.reminders` | 48 h / 7 d after consent request                                 |
| `asset.process`      | 3D asset uploaded                                                |
| `embed.content`      | Course/career/knowledge doc published                            |
| `heatmap.refresh`    | Nightly + hourly incremental                                     |
| `credentials.issue`  | Course completed                                                 |
| `privacy.purge`      | Daily: execute deletions past grace period; coach log retention  |
| `impact.pack`        | On demand                                                        |

### 13.5 3D asset pipeline (`tools/asset-pipeline`)

1. Input: GLB/glTF from artists or partners (also the master asset used in Unity).
2. `gltf-transform`: dedupe, weld, simplify to LOD targets, Draco or Meshopt compression, textures → KTX2 (max 2048, 1024 for lite).
3. Output: `full.glb` (target ≤ 5 MB), `lite.glb` (target ≤ 1.5 MB), `poster.webp` (headless render via Playwright + model-viewer), optional `model.usdz` (via external converter — note manual step if unavailable).
4. Validate with glTF-Validator; fail asset if errors.
5. Write sizes and URLs to `Asset3D`.

**Same object, every layer:** the master asset ID is shared with the Unity project (`assetKey` naming convention `IND/object/v#`, e.g. `ENG/angle-grinder/v1`) so web, AR and VR stay in sync.

---

## 14. Design system & UX standards

### 14.1 Brand

- **Typefaces:** Sora (headings, 600/700), Manrope (body/UI, 400/500/600). Self-host via `next/font`.
- **Core colours:** Lime `#ABCF37` (primary/action), Deep-space `#0B0F14` (dark background), Ink `#231F20` (text on light).
- **Lime ramp (derive and confirm against brand file):** 50 `#F6FAE7` · 100 `#EAF4C6` · 200 `#DAEB9C` · 300 `#C8E070` · 400 `#B8D74F` · **500 `#ABCF37`** · 600 `#8DAE27` · 700 `#6C861F` · 800 `#4D5F18` · 900 `#2F3A10`.
- **Neutrals:** 0 `#FFFFFF` · 50 `#F5F7FA` · 100 `#E8ECF1` · 200 `#CDD4DD` · 400 `#8B95A3` · 600 `#4A5361` · 800 `#1A2029` · 900 `#11161D` · 950 `#0B0F14`.
- **Industry accents** (for worlds, charts, heatmap): AVI `#4FA3FF` · ENG `#FFB547` · CUL `#FF6B5A` · MED `#3FD1B5` · AGR `#ABCF37`. Validate contrast and colour-blind separability with the dataviz checker; never encode meaning by colour alone.
- **Semantic:** success `#3FB950`, warning `#F2B233`, danger `#F25F5C`, info `#4FA3FF`.
- **Theme:** dark-first (immersive, matches the pitch deck), full light theme supported; respect `prefers-color-scheme`, user toggle.

### 14.2 UX standards

- Mobile-first at 360×740; touch targets ≥ 44 px; bottom tab bar on mobile: **Home · Explore · Learn · Opportunities · Me**; Coach as floating action button.
- Desktop: left sidebar (replacing the yellow Knowledge Pele rail) with collapsible labels.
- One primary action per screen. Plain language (Grade 7 reading level target for learner copy).
- Empty states always suggest an action. Skeleton loaders, optimistic updates for progress.
- Motion: subtle, ≤ 200 ms UI transitions; 3D camera tweens ≤ 800 ms; respect `prefers-reduced-motion`.
- Celebrate real milestones (topic/course complete, invite, placement) with tasteful animation — no confetti on trivial actions.
- Copy voice: warm, direct, encouraging, South African (use "learner", "matric", "TVET", "learnership"; ZAR as "R").

### 14.3 Key components (packages/ui + packages/three)

`AppShell`, `BottomNav`, `SideNav`, `CareerCompass` (3D/2D), `WorldCard`, `CareerCard`, `CourseCard`, `ProgressRing`, `SectionStepper`, `BlockRenderer`, `ModelViewer3D` (orbit, hotspots, explode slider, component list, size gate), `ARButton`, `HotspotTour`, `ProcedureSim`, `QuizCard`, `ScenarioPlayer`, `EvidenceUploader`, `CredentialCard`, `VerifyBadge`, `MatchCard` (score ring + reasons + gaps), `InviteCard`, `ApplicationTimeline`, `CoachPanel`, `XPBar`, `BadgeGrid`, `DataSaverToggle`, `ConsentForm`, `SAHeatmap`, `FunnelChart`, `StatTile`.

---

## 15. Non-functional requirements

| Area                                                       | Requirement                                                                                                                                                                                                                                                             |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Performance (learner, mid-range Android, 3G-fast / 4G)** | LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 on Home, Explore, Course pages. Initial JS ≤ 180 KB gzipped on non-3D routes. Lighthouse mobile ≥ 90 performance, ≥ 95 accessibility.                                                                                              |
| **Data budget**                                            | Home ≤ 400 KB first load (data-saver ≤ 200 KB); a text section ≤ 150 KB; 3D only on request with size shown.                                                                                                                                                            |
| **3D**                                                     | ≥ 30 fps on Samsung Galaxy A05-class device for lite models; graceful fallback when WebGL2 is unavailable.                                                                                                                                                              |
| **Availability**                                           | 99.5% monthly (MVP); kiosk API 99.9% target during expo hours with offline queueing.                                                                                                                                                                                    |
| **Scalability**                                            | 100k learners, 1M interest signals, 2k concurrent users without architectural change. Load test kiosk API at 50 req/s and heatmap endpoints at 20 req/s.                                                                                                                |
| **Accessibility**                                          | WCAG 2.1 AA; screen-reader labels on all controls; text alternatives for 3D; captions on video; keyboard-navigable admin.                                                                                                                                               |
| **Browser support**                                        | Chrome Android ≥ last 3 years, Samsung Internet, Safari iOS ≥ 16, desktop evergreen.                                                                                                                                                                                    |
| **Security**                                               | OWASP ASVS L2 targets; CSP; secure cookies; CSRF protection on server actions; RBAC checks server-side on every query (lint rule/helper `requireRole`); secrets in env/secret manager; dependency scanning; encryption at rest (DB, storage) and in transit (TLS 1.2+). |
| **Auditability**                                           | All admin reads of learner PII and all mutations on learners, credentials, opportunities, consents → `AuditLog`.                                                                                                                                                        |
| **Backups**                                                | Daily DB snapshots, 30-day retention, point-in-time recovery; quarterly restore drill.                                                                                                                                                                                  |
| **Observability**                                          | Error rate, p95 latency per route, job failures, SMS/WhatsApp delivery rates, coach cost/day dashboards; alerts to Veza ops.                                                                                                                                            |

---

## 16. Privacy, POPIA, safety & compliance

1. **Lawful basis & minimisation:** collect only fields listed in §11; ID numbers only for credit-bearing enrolment or opportunities that require them.
2. **Children (under 18):** POPIA requires consent from a competent person (parent/guardian) to process a child's personal information. Restricted mode until guardian consent (L-ON-4/5). Child-safe coach mode.
3. **Special personal information:** do not collect race, health, religion, etc. Gender optional. If a sponsor's B-BBEE reporting needs demographic aggregates, collect only with explicit opt-in consent, store separately, and report aggregates only — flag for legal review before enabling.
4. **Consent records:** append-only `Consent` with text version; consent text versions stored in repo (`packages/content/consent/*.md`) and translated.
5. **Data subject rights:** download my data, correct my data, delete my account (L-PF-2), withdraw consents; admin process for access requests within 30 days.
6. **Sharing:** sponsors/partners receive aggregates by default; named learner data only after the learner (and guardian) consents to a specific application/partner.
7. **Information Officer:** register Veza's Information Officer with the Information Regulator; record in `docs/COMPLIANCE.md`.
8. **Operator agreements:** with Bantu (accreditation data), messaging and hosting vendors; cross-border transfer assessment if hosting outside SA.
9. **Retention:** inactive learner accounts anonymised after 3 years (config); coach logs 12 months; OTP records 30 days; audit logs 5 years.
10. **Safety:** coach distress escalation; report-abuse links; no learner-to-learner messaging in MVP; leaderboards first-name + initial only.
11. **Accreditation integrity:** PoE and assessment decisions recorded with reviewer identity; credit-bearing credentials only issued after accreditation partner confirmation.

---

## 17. Delivery plan — milestones & tickets

Build strictly in order; each milestone ends with a demoable increment, green CI and updated `docs/DECISIONS.md`. Ticket IDs: `M<n>-<k>`. Estimates assume one senior full-stack engineer + Claude Code; adjust as needed.

### M0 — Foundations (week 1)

| Ticket | Description                                                                                                                        | Acceptance criteria                                                                           |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| M0-1   | Scaffold monorepo (§13.2), pnpm, Turborepo, TS strict, ESLint, Prettier, Husky + lint-staged                                       | `pnpm dev` runs web; `pnpm lint typecheck test build` pass in CI                              |
| M0-2   | `packages/ui`: Tailwind v4 preset with Veza tokens (§14.1), fonts, dark/light themes, shadcn base components                       | Storybook-lite page `/dev/ui` shows tokens, type scale, buttons, inputs, cards in both themes |
| M0-3   | `packages/db`: Prisma schema (§11) + first migration, pgvector enabled, seed script skeleton                                       | `pnpm db:migrate && pnpm db:seed` works on clean Postgres                                     |
| M0-4   | AppShell: mobile bottom nav, desktop sidebar, coach FAB placeholder, i18n wiring (next-intl) with `en` + `zu` + `st` message files | Navigation works at 360 px and 1440 px; language switch persists                              |
| M0-5   | Observability: Sentry, pino logger, request IDs; `Event` tracking helper (client + server)                                         | Test error appears in Sentry (dev DSN); `trackEvent` writes rows                              |
| M0-6   | CI: GitHub Actions (lint, typecheck, unit, Playwright smoke, Lighthouse CI on 3 routes)                                            | PR shows all checks                                                                           |
| M0-7   | `docs/DECISIONS.md`, `docs/kiosk-api.md` stubs; `.env.example` with all provider flags                                             | Files exist and documented                                                                    |

### M1 — Auth, onboarding, consent & expo claim (weeks 2–3)

| Ticket | Description                                                                                               | Acceptance criteria                                                                               |
| ------ | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| M1-1   | Phone OTP auth (L-ON-2, L-ON-10) with `SmsProvider` console impl, rate limits                             | Unit tests for TTL, attempts, resend, limits; e2e sign-in                                         |
| M1-2   | Onboarding screens (L-ON-3) incl. province→district dropdown from `packages/geo`, school search           | Completes in ≤ 2 profile screens; validation messages localised                                   |
| M1-3   | Guardian flow & restricted mode (L-ON-4/5), reminders job                                                 | Under-18 restricted until consent; guardian page in en/zu/st; reminder job tested with fake clock |
| M1-4   | Consent model & privacy centre basics (L-ON-6, L-PF-2 view/change)                                        | Consents append-only; latest-wins query tested                                                    |
| M1-5   | Kiosk API: device auth, `POST /kiosk/sessions`, claim code generation & pre-allocation, heartbeat (§12.3) | Contract tests from `docs/kiosk-api.md` examples; idempotency verified                            |
| M1-6   | Claim flow (L-ON-1, L-ON-7, L-ON-8)                                                                       | QR → preview → sign-up → linked results; double-claim blocked                                     |
| M1-7   | Kiosk simulator script `pnpm kiosk:simulate` to create fake sessions + print claim URLs                   | Demo usable without Unity                                                                         |

### M2 — Career Compass & Explore (weeks 4–5)

| Ticket | Description                                                                            | Acceptance criteria                                                          |
| ------ | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| M2-1   | Industries & careers seed (§6.2) + admin CRUD (A-2)                                    | 5 worlds, 24 careers seeded; editable in admin                               |
| M2-2   | `ModelViewer3D` v1 in `packages/three` (orbit, reset, poster-first, size gate)         | Loads seed GLB; fallback poster without WebGL                                |
| M2-3   | Career Compass (L-HM-1..8) with 3D scene + SVG fallback; next-best-step engine (§7.11) | Unit tests for each rule order; Compass ≥ 30 fps on throttled mobile profile |
| M2-4   | Explore index, world page, career page (L-EX-1..5) with subject-gap logic              | Subjects learner lacks are highlighted; e2e                                  |
| M2-5   | Interest scoring + `InterestSignal` emitter (hashing, bands)                           | Signals created for each listed action; no learner FK on table               |

### M3 — Learn: courses, blocks, 3D/AR (weeks 6–8)

| Ticket | Description                                                                                                  | Acceptance criteria                                                         |
| ------ | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| M3-1   | Content block schemas (zod) + `BlockRenderer` for TEXT, IMAGE, VIDEO, CALLOUT, DOWNLOAD                      | Snapshot tests per block                                                    |
| M3-2   | `ModelViewer3D` v2: hotspots, explode slider, component list, x-ray (P1)                                     | Hotspot click opens panel; explode animates; a11y text alternative rendered |
| M3-3   | AR block via model-viewer (L-LN-7)                                                                           | AR button visible on supported devices; fallback otherwise                  |
| M3-4   | Hotspot tour block (L-LN-8)                                                                                  | Tour advances through ordered hotspots with camera tween                    |
| M3-5   | Procedure sim block (L-LN-9) — one ENG-101 demo: _safe disassembly of angle grinder_                         | Steps, feedback, score saved to `Attempt`-like record                       |
| M3-6   | Course/topic/section pages, enrolment (non-credit), progress tracking, completion rules (L-LN-1..4, L-LN-11) | Progress persists; topic completion card; XP awarded                        |
| M3-7   | Admin course builder + block editors + preview + publish/versioning (A-3)                                    | Admin builds a section with 3D block without code                           |
| M3-8   | Asset pipeline + admin 3D library with visual hotspot placement (A-4, §13.5)                                 | Uploading a GLB yields full/lite/poster, sizes stored                       |
| M3-9   | Offline queue for progress + SW caching of current topic (L-LN-12)                                           | Airplane-mode test: progress syncs on reconnect                             |
| M3-10  | Seed content: AGR-101 (5 topics), ENG-101 (5 topics), AVI/CUL/MED starters, Career-Ready stubs (§6.3)        | All seed courses navigable end-to-end                                       |

### M4 — Assess, credentials & gamification (weeks 9–10)

| Ticket | Description                                                                               | Acceptance criteria                                  |
| ------ | ----------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| M4-1   | Quiz engine + question bank (L-AS-1/2, A-5)                                               | All 5 question types; pass marks; retries            |
| M4-2   | Credit-bearing enrolment + manual identity verification (L-LN-3, A-6)                     | Enrolment pending until admin verifies; audit logged |
| M4-3   | PoE upload + admin review queue (L-AS-3, A-7)                                             | Signed uploads; status transitions; learner notified |
| M4-4   | Certificates PDF + `/verify/[publicId]` + accreditation status timeline (L-CR-1/2/4, A-8) | QR on PDF resolves; revoked shows revoked            |
| M4-5   | XP, levels, streaks, badges (L-GM-1..3)                                                   | Rules unit-tested; badge awarded on triggers         |
| M4-6   | Practise page + VR results detail with rubric chart & cohort percentile (L-PR-1..4)       | Percentile hidden when cohort < 20                   |

### M5 — Opportunities matching & invitations (weeks 11–12)

| Ticket | Description                                                                                           | Acceptance criteria                                                       |
| ------ | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| M5-1   | `packages/matching`: eligibility evaluator, scoring, reasons, gaps (pure functions)                   | ≥ 95% branch coverage; fixtures for every rule                            |
| M5-2   | Admin opportunities CRUD + eligibility builder UI + form schema builder (A-10)                        | Seed bursary created via UI                                               |
| M5-3   | Match jobs (`match.opportunity`, `match.learner`) + suggested invites + bulk approve                  | Publishing seed bursary yields expected matches                           |
| M5-4   | Learner Opportunities (L-OP-1..7): For you, Invites, Browse, detail, apply, applications timeline     | e2e: invite → accept → apply → admin shortlists → learner sees status     |
| M5-5   | Notifications dispatch with channels, quiet hours, caps (L-OP-8, §12.4) incl. WhatsApp template stubs | Fake-clock tests for quiet hours & caps                                   |
| M5-6   | Placement recording + fairness report tab (§9.1)                                                      | Report shows invite rates by province/quintile/gender with 80% rule alert |

### M6 — AI Career Coach (weeks 13–14)

| Ticket | Description                                                                                                                            | Acceptance criteria                                       |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| M6-1   | `packages/coach`: `CoachLLM` (Anthropic), streaming route, conversation storage, rate limits                                           | Streams in UI; limits enforced                            |
| M6-2   | Embedding pipeline + pgvector retrieval over courses, careers, knowledge docs (`embed.content` job)                                    | Retrieval returns relevant chunks for 20 test queries     |
| M6-3   | Tools (§9.2) with restricted-mode gating                                                                                               | Tool calls logged; restricted learners can't list matches |
| M6-4   | Guardrails: summative exclusion, distress escalation, PII redaction, age-safe mode                                                     | Eval suite passes (M6-6)                                  |
| M6-5   | `CoachPanel` UI: context chips, suggested prompts, ratings, _talk to a person_                                                         | Works on every learner page                               |
| M6-6   | Evals: `pnpm coach:eval` with ≥ 150 cases (EN, isiZulu, Sesotho) covering careers, learning help, safety, refusal of summative answers | CI job (nightly) reports pass rate; target ≥ 85%          |
| M6-7   | Admin coach review & knowledge docs (A-14)                                                                                             | Low-rated answers listed; knowledge doc edits re-embed    |

### M7 — National Career-Interest Heatmap + admin analytics (weeks 15–16)

| Ticket | Description                                                                     | Acceptance criteria                                     |
| ------ | ------------------------------------------------------------------------------- | ------------------------------------------------------- |
| M7-1   | `packages/geo`: simplified TopoJSON for 9 provinces + 52 districts, codes table | Renders all shapes; codes match `Learner.districtCode`  |
| M7-2   | Aggregation SQL/materialised views + thresholding + API (§9.3)                  | Suppression test (< 20); p95 < 1.5 s at 1M signals (k6) |
| M7-3   | `SAHeatmap` 3D extruded + 2D choropleth, filters, drill-down, compare, export   | Demo with 50k synthetic signals                         |
| M7-4   | Admin dashboard funnel & KPIs (A-1)                                             | Funnel matches seeded counts                            |
| M7-5   | Sponsor impact pack PDF + CSV (A-13)                                            | Pack generated for seed sponsor; aggregates only        |

### M8 — Hardening & pilot readiness (weeks 17–18)

| Ticket | Description                                                                                  | Acceptance criteria                                 |
| ------ | -------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| M8-1   | Performance pass to §15 budgets; Lighthouse CI thresholds enforced                           | All budgets green                                   |
| M8-2   | Accessibility audit (axe + manual screen-reader pass)                                        | Zero critical/serious axe issues                    |
| M8-3   | Security review: RBAC tests on every admin/learner route, rate limits, CSP, dependency audit | Report in `docs/SECURITY.md`                        |
| M8-4   | Privacy: data export, deletion with grace, retention jobs, consent text translations         | e2e for export and deletion                         |
| M8-5   | Real providers behind flags: SMS vendor, WhatsApp templates, storage, Sentry prod            | Staging works end-to-end with real SMS              |
| M8-6   | Pilot runbook: expo-day checklist, kiosk API key provisioning, support process               | `docs/PILOT_RUNBOOK.md`                             |
| M8-7   | Veza Pay read-only wallet (L-VP-1)                                                           | Admin can add ledger entries; learner sees schedule |

**Phase 2 backlog (post-pilot):** partner/sponsor/assessor portals, voice coach, proctored exams, verifiable credential signing, public portfolios, leaderboards, Veza Pay disbursements, kiosk link-to-learner token, sponsor heatmap view, ICT/Business Management full Bantu tracks.
**Phase 3 backlog:** school/teacher portal, public heatmap + SETA reports API, more industries, full 6-language UI.

---

## 18. Seed data & demo script

### 18.1 Seed (`pnpm db:seed`)

- 9 provinces, 52 districts, ~200 sample schools (fictional names, real district codes, quintiles 1–5).
- Organisations: Veza (VEZA), Bantu Marketing and Management Services (ACCREDITATION_PARTNER), 3 fictional sponsors (e.g. _"Horizon Air Foundation"_, _"Ubuntu Agri Group"_, _"Apex Power Utilities"_), 2 fictional opportunity partners. **Use fictional sponsor names only — never real company names/logos in seed.**
- 5 industries, 24 careers, courses per §6.3, ~120 questions.
- 3D assets: open-licensed placeholder GLBs (e.g. Khronos glTF Sample Assets, CC0 sources) with license recorded; replace with Veza assets later.
- 10 expo events across 4 provinces; 500 synthetic expo sessions with VR results; 150 synthetic learners at varied progress (incl. under-18 restricted and consented).
- 8 opportunities (one of each type) incl. _Horizon Air Foundation Aviation Bursary (LP, MP; Grade 10–12; Maths + Physical Science)_.
- 50,000 synthetic interest signals for the heatmap.
- Admin user `+27000000001` (OTP shown in console in dev); demo learner `+27000000002` (Thandeka persona).

### 18.2 Demo script (10 minutes, for sponsors and partners)

1. `pnpm kiosk:simulate --world AVI,MED --score 78,66` → open claim URL on a phone.
2. Sign up as a 16-year-old → show restricted mode → complete guardian consent from a second phone (Sesotho).
3. Career Compass lights up Aviation & Medical → Explore Aviation → rotate jet engine → _View in your space_ (AR).
4. Ask the Coach in isiZulu: _"Ngingaba kanjani umshayeli wendiza?"_ (How can I become a pilot?).
5. Do ENG-101 Topic 1 section with exploded angle grinder + procedure sim → XP + badge.
6. Admin publishes the aviation bursary → approve invites → phone receives invite → accept → apply.
7. Admin heatmap: drill Limpopo → Capricorn district → aviation interest trend; export sponsor impact pack.

---

## 19. Testing strategy & definition of done

### 19.1 Testing

- **Unit (Vitest):** matching, recommendations, XP/levels/badges, consent resolution, claim codes, thresholding, OTP logic — high coverage (≥ 90% for `packages/matching`, `lib/recommendations`).
- **Contract:** kiosk API against `docs/kiosk-api.md` examples; OpenAPI snapshot.
- **Integration:** Prisma against a test Postgres (Testcontainers or a CI service).
- **E2E (Playwright):** mobile (Pixel 7, Galaxy A-series viewport, iPhone 13) + desktop; critical journeys: claim→onboard→consent, learn section with 3D, quiz, credential verify, invite→apply, admin publish course, admin heatmap.
- **Accessibility:** axe in e2e on every critical page.
- **Performance:** Lighthouse CI budgets; k6 for kiosk + heatmap.
- **Coach evals:** nightly eval suite with pass-rate trend.
- **Visual regression (P1):** Playwright screenshots for key components in both themes.

### 19.2 Definition of done (every ticket)

- Acceptance criteria met and demonstrated.
- Types strict, lint clean, tests added/updated and passing in CI.
- RBAC enforced server-side for any new data access; audit logs for admin actions.
- i18n keys added (no hard-coded learner-facing strings); `en` complete.
- Mobile 360 px layout checked; dark + light themes checked; a11y labels present.
- Analytics events added for new user actions (names in `packages/analytics/events.ts`).
- Docs updated (`DECISIONS.md` if a choice was made; API docs if contracts changed).

---

## 20. Risks, assumptions & open questions

### 20.1 Risks & mitigations

| Risk                                                                                                   | Impact                                   | Mitigation                                                                                                               |
| ------------------------------------------------------------------------------------------------------ | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Accreditation scope gap (Bantu covers AGR, ICT, business mgmt, carpentry — not AVI/CUL/MED)            | Credit promises can't be met in 3 worlds | Launch AVI/CUL/MED as non-credit exposure tracks; sign additional accredited partners; data model already supports both  |
| Legacy unit standards being phased out in favour of QCTO occupational qualifications/skills programmes | Courses mapped to expiring standards     | Confirm with Bantu which QCTO-registered programmes they're accredited for before mapping AGR-101 (open question Q1)     |
| Low-end devices & data costs                                                                           | Low engagement with 3D                   | Data-saver default, poster-first 3D, lite models, zero-rated data partnership with a telco (in-kind sponsor)             |
| Guardian consent friction                                                                              | Under-18s stuck in restricted mode       | Learning allowed while restricted; SMS+WhatsApp consent in home language; facilitator-assisted consent at expo (Phase 2) |
| Coach quality in SA languages                                                                          | Trust loss                               | Native-speaker evals, beta labels, human escalation, start with EN/zu/st                                                 |
| Opportunity supply too thin                                                                            | Matching feels empty                     | Sponsor contracts include opportunity commitments; seed with job-shadow days and short courses; YES placements           |
| Sponsor data expectations vs POPIA                                                                     | Legal/reputational                       | Aggregates by default; named data only with consent per application; legal review of sponsor agreements                  |
| Content production at scale                                                                            | Slow world expansion                     | Industry content partnerships; one master 3D asset reused across web/AR/VR; asset pipeline automation                    |
| Kiosk connectivity at venues                                                                           | Lost sessions                            | Pre-allocated claim codes, offline queue, idempotent sync                                                                |

### 20.2 Assumptions

- Learners have access to a smartphone (own or shared) at least weekly.
- Sponsors fund the platform per learner/booth from CSI, B-BBEE Skills Development/SED and talent-pipeline budgets; SETA/NSF/YES routes supplement.
- Unity VR team adopts the kiosk API contract in §12.3.
- Bantu will provide assessors/moderation for credit-bearing tracks and accept platform PoE exports.

### 20.3 Open questions (owner → due before milestone)

| #   | Question                                                                                    | Owner         | Needed by     |
| --- | ------------------------------------------------------------------------------------------- | ------------- | ------------- |
| Q1  | Exact QCTO/SAQA programmes Bantu is accredited for; mapping for AGR-101, ICT, Business Mgmt | Mmuso / Bantu | M3            |
| Q2  | Accredited partners for Aviation, Culinary, Medical                                         | Mmuso / Thabo | Phase 2       |
| Q3  | Industry content partner per world                                                          | Veza BD       | M3 (AGR, ENG) |
| Q4  | Hosting region & vendor (SA region preferred)                                               | Veza tech     | M8            |
| Q5  | SMS vendor and WhatsApp Business account                                                    | Veza ops      | M5            |
| Q6  | Domain (e.g. `sgela.veza.africa`) and product name confirmation                             | Veza brand    | M0            |
| Q7  | Pricing: opportunity partner fees, heatmap reports, per-learner platform fee for sponsors   | Mmuso / Thabo | Phase 2       |
| Q8  | Which VR worlds exist today vs to be built; Unity app versions                              | VR lead       | M1            |
| Q9  | Speech vendor for SA languages                                                              | Veza tech     | Phase 2       |
| Q10 | Legal review of consent texts and sponsor data agreements; Information Officer registration | Veza / legal  | M8            |

---

## 21. Glossary

| Term                   | Meaning                                                                                               |
| ---------------------- | ----------------------------------------------------------------------------------------------------- |
| **Veza Sgela**         | Veza's touring VR career expo and its learning platform                                               |
| **EEP**                | Experience Enablement Platform — this product                                                         |
| **Career world**       | One of the five industry experiences (AVI, ENG, CUL, MED, AGR)                                        |
| **Claim code**         | 6-character code/QR linking a VR expo session to a learner account                                    |
| **Restricted mode**    | Learner state before required consent; learning allowed, matching/discovery off                       |
| **PoE**                | Portfolio of Evidence — learner evidence for competency assessment                                    |
| **QCTO**               | Quality Council for Trades and Occupations — quality assures occupational qualifications              |
| **SAQA / NQF / NLRD**  | SA Qualifications Authority / National Qualifications Framework / National Learners' Records Database |
| **SETA**               | Sector Education and Training Authority (levy-funded skills bodies)                                   |
| **NSF**                | National Skills Fund                                                                                  |
| **YES**                | Youth Employment Service — 12-month youth work experience initiative linked to B-BBEE recognition     |
| **B-BBEE / SED / CSI** | Broad-Based Black Economic Empowerment / Socio-Economic Development / Corporate Social Investment     |
| **POPIA**              | Protection of Personal Information Act                                                                |
| **Interest signal**    | Anonymised event feeding the National Career-Interest Heatmap                                         |
| **Veza Pay**           | Stipend wallet for funded learners (low priority)                                                     |

_End of PRD v1.0_
