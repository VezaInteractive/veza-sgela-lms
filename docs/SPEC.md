# Veza Sgela — Experience Enablement Platform (EEP)

### Product spec for build · v0.1 · Nov 2026 · Veza Interactive

> Hand-off brief for Claude Code. Learner-facing first version. The Knowledge Pele LMS screens in `Experience Enablement Platform/Screens Ref/` are a **functional reference only** — the target is a new, Veza-branded platform that is roughly 10× better in experience, visual depth and data.

---

## 1. What we're building

Veza Sgela is a touring VR career expo. Today it ends when the headset comes off. The EEP turns that 15-minute moment into a continuous pathway:

```
DISCOVER  →  CLAIM  →  LEARN  →  PRACTISE  →  ACCREDIT  →  ADVANCE
VR expo      register   3D/AR      VR (deeper)  credits via   matched & invited to
kiosk        via QR     modules    sessions     accredited    bursaries, learnerships,
                                                partner       internships, YES, jobs
```

The journey does not end at a certificate. Every learner path ends in a **real next step** offered by a sponsor or industry partner.

**Value stack**

| Layer         | What                                                                                            | Runs on                                                                       |
| ------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 1 · Core      | Interactive 3D models, simulations, AR "place it in your room" — data visualisation is the hero | Web / mobile (WebGL, WebXR, AR Quick Look / Scene Viewer)                     |
| 2 · Extension | VR practice sessions — scored, deeper versions of the same tasks                                | Meta Quest 3S at kiosks, labs, partner sites                                  |
| 3 · Outcome   | Credits, credentials, portfolio                                                                 | Platform + accredited partner (Bantsho – Management and Marketing Strategies) |
| Cross-cut     | Data: expo → registration → progress → credential, by industry, region and sponsor              | Analytics (internal now; sponsor dashboards later)                            |

Veza is the spatial computing and data visualisation tech company. Accreditation sits with the partner.

---

## 2. Industries (career worlds)

| #   | Industry                        | Example VR world (expo)                       | Example 3D/AR learning objects                                    | Accreditation path (initial)                                            |
| --- | ------------------------------- | --------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 1   | **Aviation**                    | Pre-flight walkaround / cockpit checks        | Exploded jet engine, aircraft systems, airport ops map            | Exposure track + Veza certificate of completion (seek aviation partner) |
| 2   | **Engineering**                 | Wire & safety-test a panel; power-tool repair | Power tools with hotspots (as in ref screens), circuits, machines | Bantsho: carpentry / related trades; seek engineering-trades partner    |
| 3   | **Culinary skills**             | Commercial kitchen shift                      | Kitchen layout & HACCP zones, knife skills, equipment             | Exposure track + Veza certificate (seek hospitality partner)            |
| 4   | **Medical & health facilities** | Clinic / ward walkthrough                     | Anatomy, hospital equipment, infection-control flows              | Exposure track + Veza certificate (seek health partner)                 |
| 5   | **Sustainable agriculture**     | Smart-farm / hydroponics operation            | Soil, irrigation, crop cycles, farm digital twin                  | **Bantsho: agricultural training — first fully accredited pathway**     |

Cross-cutting accredited tracks through Bantsho: **ICT** and **business management** — offer these to every learner as "career-ready" add-ons.

> ⚠️ Bantsho's current scopes cover agriculture, ICT, business management and carpentry. Aviation, culinary and medical need either additional accredited partners or should launch as non-credit exposure tracks. The data model must support both (`credit_bearing: true/false`).

---

## 3. Learner journey & screens (the 10× brief)

Each section lists the Knowledge Pele reference screen and what the Veza version must do better.

### 3.1 Expo hand-off & onboarding _(ref: screens 1–5)_

- **Kiosk QR claim:** each VR session produces a session ID; learner scans QR → lands on a pre-filled sign-up that already holds their expo results ("You tried Aviation and Agriculture — here's where you scored").
- Phone-first sign-up: mobile number + OTP (primary), email optional. Low-data friendly.
- **Minors & POPIA:** most expo learners are secondary-school learners under 18. Require parent/guardian consent flow for under-18s; collect only what's needed. ID/selfie verification (as in ref) only at the point of enrolling on an accredited programme, not at sign-up.
- Languages: English first; architecture ready for isiZulu, Sesotho, Setswana, isiXhosa, Afrikaans.

### 3.2 Home — "Career Compass" _(ref: screens 6–7)_

- Replace the generic dashboard with a **personal career map**: a 3D/2.5D visual of the five industries, lit up by the learner's interests, VR scores and progress.
- Recommended next step (one clear CTA), streaks, XP, upcoming VR sessions, notices.

### 3.3 Explore — career worlds

- One page per industry: 3D hero scene, day-in-the-life, roles and salary bands, study routes (subjects, TVET, university), VR world preview, sponsor branding slot ("The [Brand] Health Bay").

### 3.4 Learn — courses & modules _(ref: screens 8–17, 23–28)_

- Course → Topic → Section, with progress tracking (keep the structure from screens 25–28; it works).
- **Rich content blocks** inside sections: text, video, **interactive 3D viewer** (orbit, explode, numbered hotspots, step-through procedures), **AR launch** ("view in your space" on phone), quiz, scenario/branching decision.
- Learning objectives, prerequisites, assessment criteria visible per topic (as in screen 23 & 27), mapped to unit standards where credit-bearing.
- Simple "apply / enrol" flow (replaces the long application form in screens 9–12); deeper KYC only for accredited programmes.

### 3.5 Practise — VR

- Book a VR session (kiosk/lab/partner site), or link a headset session.
- VR results sync back to the profile: score, time, safety errors, decisions → shown as visual performance breakdowns.

### 3.6 Assess _(ref: screens 15–21)_

- Formative quizzes per section; summative assessment per topic.
- Portfolio of Evidence (PoE) upload for credit-bearing tracks (assessor/moderator review is a later role).
- Proctored online exam as an option, not the default.

### 3.7 Credentials & portfolio

- Digital certificates + shareable verifiable badge (QR/URL verify page).
- Portfolio: everything mastered, VR scores, 3D work, credits earned — a learner CV for employers and bursary providers.
- For credit-bearing completions: status tracking through the partner to NLRD recording.

### 3.8 Opportunities — matching & invitations _(new — answers "and then what?")_

- **Opportunity board:** sponsors and industry partners post bursaries, learnerships, internships, YES placements, job-shadow days and entry-level roles, tagged by industry, region, NQF level, required subjects/credentials and age.
- **Matching engine:** scores each learner against each opportunity using expo interest, VR performance, modules completed, credentials, location and school subjects. Start rules-based and transparent; add ML later.
- **Invitations, not just listings:** matched learners receive a personal invite (in-app + SMS/WhatsApp) — "Sasol has a bursary open for learners who completed the Engineering track in Mpumalanga." Learner can accept, save or decline.
- **Application tracker:** invited → applied → shortlisted → interview → placed / unsuccessful, with status updates and nudges.
- **Readiness gaps:** if a learner is close but not eligible, show exactly what's missing ("Complete Topic 4 to qualify") and link to it.
- **Consent first:** learners (and guardians for under-18s) opt in to being discoverable. Partners see named profiles only after the learner accepts an invite; otherwise anonymised.
- **Outcome capture:** placements are recorded and feed the impact reporting in §8.

### 3.9 AI Career Coach _(differentiator — see §6)_

- Persistent coach available on every screen and inside the VR hand-off.
- Answers career questions, explains module content, recommends next steps and opportunities, helps prepare applications.
- **Multilingual, voice-first:** English, isiZulu, Sesotho, Setswana, isiXhosa, Afrikaans — speak or type, answer in the learner's language.

### 3.10 Veza Pay _(ref: screen 22 — in scope, low priority)_

- Stipend wallet for funded learners (YES / SETA learnerships): balance, transactions, stipend schedule.
- Phase 2+. Build the data model now; integrate a payments provider later. No card-number display in UI.

### 3.11 Support

- Help centre, chat/WhatsApp hand-off, facilitator contact.

---

## 4. Suggested additional user roles (later phases)

| Role                               | Why it matters                          | Key views                                                                                                                   |
| ---------------------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Facilitator** (expo youth staff) | Runs kiosks; creates the QR hand-off    | Session queue, learner check-in, device status                                                                              |
| **Sponsor / partner**              | Funds booths; buys the data story       | Booth dashboard: sessions, dwell, interest by region, conversions to learners, credentials earned, B-BBEE/SED evidence pack |
| **Opportunity partner / employer** | Turns the funnel into a talent pipeline | Post opportunities, view matched (anonymised) talent pool, send invites, track applicants to placement                      |
| **Industry content partner**       | Co-creates career worlds and modules    | Content review/approval, SME input, branding on co-created content                                                          |
| **School / teacher**               | Brings classes; tracks learners         | Class roster, progress, subject-choice insights                                                                             |
| **Assessor / moderator (Bantsho)** | Accreditation integrity                 | PoE review, assessment sign-off, learner records                                                                            |
| **Veza admin / content**           | Runs the platform                       | Course & 3D asset authoring, industries, users, reporting                                                                   |

---

## 5. Core data model (draft)

`Learner`, `Guardian`, `ExpoEvent`, `ExpoSession` (VR session at kiosk: world, score, duration, device), `Industry`, `Course` (credit_bearing, unit_standard, NQF level, credits, partner), `Topic`, `Section`, `ContentBlock` (type: text | video | model3d | ar | quiz | scenario), `Asset3D` (glTF/USDZ, hotspots), `Enrolment`, `Progress`, `Assessment`, `Attempt`, `EvidenceItem`, `VRSessionResult`, `Credential`, `Partner`, `Sponsor` (linked to Industry/booth), `Wallet`, `Transaction`, `Consent`, `Opportunity` (type, industry, region, eligibility rules, partner), `Match` (score, reasons), `Invitation`, `Application` (status pipeline), `Placement`, `ContentPartner`, `CoachConversation`, `InterestSignal` (anonymised event for the heatmap: industry, region, age band, school quintile, source).

---

## 6. Differentiators

### 6.1 National Career-Interest Heatmap

- Every expo session and platform interaction produces an anonymised **interest signal**: which careers young people choose, how long they engage, how well they perform — by province, district, age band and school quintile.
- Visualised as a live, interactive 3D map of South Africa (Veza's data-visualisation strength): toggle industry, region and time; drill from national → province → district.
- **Audiences:** sponsors (where is our future talent?), SETAs (evidence for annual Sector Skills Plans), government and DBE, universities and TVETs.
- **Product line:** public headline version (brand + PR), detailed reports and API access for sponsors and SETAs (revenue).
- **Privacy:** aggregated only, minimum cell sizes (no group under e.g. 20 learners shown), no individual data ever leaves the platform via the heatmap.
- MVP: internal heatmap fed by expo + platform data. Phase 2: sponsor view. Phase 3: public + SETA reports.

### 6.2 AI Career Coach (multilingual)

- Knows the learner's journey (expo results, progress, credentials, matches) and grounds answers in Veza's course content and verified career data (roles, salary bands, study routes, required subjects).
- Voice-first in South African languages — reaches township and rural learners who are underserved by English-only text platforms.
- Guardrails: age-appropriate, no personal data shared beyond the learner, escalates to a human facilitator for sensitive topics, logs for quality review.
- Also used by facilitators at kiosks to hand learners off ("Ask your coach what to do next").

---

## 7. Content model — industry partnerships

- Content is co-produced with **industry leaders per career world** (e.g. an airline/aviation body for Aviation, a hospital group for Medical, an agri-business for Agriculture). Partners provide subject-matter experts, real procedures, equipment references and site access; Veza provides 3D, AR, VR and platform.
- **One 3D asset, three layers:** each learning object is built once as a master 3D asset and reused across web 3D, AR and the Quest VR world.
- Partner review and sign-off step before publishing; partner branding on co-created worlds.
- Accredited content is aligned with Bantsho (and future partners) so credit-bearing modules meet assessment requirements.

## 8. Platform economics & impact

**Who pays after the expo**

- **Sponsors** — booth and presenting partners extend from the expo into the platform (their world, their learners, their pipeline).
- **CSI / B-BBEE budgets** — Skills Development and SED spend, with an evidence pack generated by the platform.
- **Companies wanting exposure and a youth talent pipeline** — pay to post opportunities, access matched talent and brand a career world.
- Supported by SA skills funding routes where applicable (SETAs, NSF, YES).

**Impact measures (reported to funders)**

- Expo session → registration → module completion → credential → matched → placed (conversion at every step).
- Career-clarity check before and after the expo.
- Placements by industry, region and sponsor.

---

## 9. Suggested stack (open to Claude Code's recommendation)

- **Web app:** Next.js (App Router) + TypeScript, Tailwind, PWA (offline-tolerant, low data).
- **3D / AR:** react-three-fiber + drei for in-page 3D; `<model-viewer>` for AR on phones (WebXR / Scene Viewer / Quick Look); glTF + USDZ assets.
- **Backend:** PostgreSQL (Supabase or Neon) + Prisma; auth with phone OTP.
- **VR:** Unity Quest apps post session results to a REST endpoint keyed by session ID / QR.
- **Analytics:** event table from day one (every view, 3D interaction, VR session).
- **AI coach:** LLM API with retrieval over course content and career data; speech-to-text and text-to-speech supporting SA languages.
- **Heatmap:** aggregated views/materialised tables; map rendering with deck.gl or three.js over SA province/district boundaries.
- **Messaging:** SMS + WhatsApp Business API for OTP, invites and nudges.

## 10. Brand

Veza identity: **Sora** (headings), **Manrope** (body); lime **#ABCF37**, deep-space **#0B0F14**, ink **#231F20**, full lime ramp + neutral scale. Dark-first, immersive feel (matches the pitch deck). Light mode supported.

---

## 11. Phasing

| Phase       | Scope                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **MVP**     | Phone OTP sign-up + guardian consent · Expo QR claim · Career Compass · Explore (5 industries) · Learn with 3D viewer + AR blocks · quizzes · progress · certificate of completion · 1 full course (Agriculture, Bantsho-aligned) + 1 showcase course (Engineering power tools) · **Opportunity board + rules-based matching + invitations** · **AI coach (English text, then isiZulu/Sesotho)** · **internal career-interest heatmap** |
| **Phase 2** | VR result sync · portfolio & verifiable badges · PoE + assessor role · ICT & business management tracks · application tracker to placement · opportunity-partner portal · sponsor heatmap view · voice coach · Veza Pay                                                                                                                                                                                                                 |
| **Phase 3** | Sponsor dashboards · school/teacher views · public + SETA heatmap reports · more industries · full multilingual                                                                                                                                                                                                                                                                                                                         |

## 12. Open items

1. Confirm which qualifications Bantsho is accredited for under QCTO (legacy unit standards such as the one in the reference are being phased out).
2. Accreditation partners for aviation, culinary, medical.
3. Industry content partner per career world.
4. Hosting region (POPIA) and data-sharing terms with sponsors and opportunity partners (aggregate/anonymised by default; named only with learner consent).
5. Which VR worlds exist today vs need building.
6. Pricing for opportunity partners and heatmap reports.
