# Decisions log

Format: ID, date, decision, alternatives, reason. Newest last. Change a decided item only by adding a new entry.

## D-001 · 2026-11-08 · Repo location and product name

- **Decision:** Monorepo at `Experience Enablement Platform/veza-sgela/`. Product name **Sgela**, domain `sgela.veza.africa` (placeholders until PRD Q6 is formally confirmed).
- **Alternatives:** scaffold in the parent folder; repo outside OneDrive.
- **Reason:** keeps source docs (PRD, spec, Screens Ref, pitch deck) beside the repo, not inside it. OneDrive sync can slow `node_modules`; move the repo outside OneDrive if file locking becomes a problem.

## D-002 · 2026-11-08 · Next.js 16 instead of 15

- **Decision:** Next.js 16.4 (App Router, React 19.3). Uses `proxy.ts` (renamed from `middleware.ts` in 16).
- **Alternatives:** Next 15.5 as written in PRD §13.1.
- **Reason:** 16 is the current stable line; starting on 15 means an immediate migration. No PRD feature depends on 15.

## D-003 · 2026-11-08 · TypeScript 5.9, ESLint 9

- **Decision:** TypeScript 5.9.3 and ESLint 9 flat config with `eslint-config-next`.
- **Alternatives:** TypeScript 7 (Go port), ESLint 10.
- **Reason:** Next.js tooling and typescript-eslint target TS 5.x; ESLint 10 plugin compatibility not yet broad. Revisit at M8.

## D-004 · 2026-11-08 · Prisma 7 with the pg driver adapter

- **Decision:** Prisma 7.10 (`prisma-client` generator, output `packages/db/src/generated/prisma`, `prisma.config.ts`, `@prisma/adapter-pg`).
- **Alternatives:** Prisma 6; Drizzle.
- **Reason:** PRD fixes Prisma; 7 is current stable. The pgvector extension is created at the top of the init migration (`CREATE EXTENSION IF NOT EXISTS vector`) because `Embedding.vector` is an `Unsupported` column.

## D-005 · 2026-11-08 · Local dev infra

- **Decision:** `docker compose` with `pgvector/pgvector:pg16` and `redis:7-alpine` for M0–M7. Commands: `pnpm db:up`, `pnpm db:migrate`, `pnpm db:seed`.
- **Alternatives:** Neon/Supabase + Vercel now.
- **Reason:** no accounts or keys needed; CI uses the same Postgres image. SA-region hosting decided in M8 (PRD Q4).

## D-006 · 2026-11-08 · i18n without locale-prefixed routes

- **Decision:** next-intl with the locale in a `NEXT_LOCALE` cookie (set by a server action), not `/en/...` URL prefixes. Locales shipped: `en`, `zu`, `st`; missing zu/st keys fall back to English at runtime. A unit test enforces that `nav`, `settings` and `coach` are fully translated.
- **Alternatives:** `[locale]` route segment.
- **Reason:** the learner app is authenticated and not SEO-driven; shorter URLs for QR claim links and SMS deep links; language will follow the learner profile (synced in M1).
- **Follow-up:** zu/st strings are first drafts and need native-speaker review before pilot.

## D-007 · 2026-11-08 · Theme handling

- **Decision:** `next-themes` with a `data-theme` attribute, default `system`; dark tokens on `:root` (dark-first), light overrides on `[data-theme="light"]`.
- **Reason:** respects `prefers-color-scheme`, persists user choice, no flash of the wrong theme.

## D-008 · 2026-11-08 · VR state (PRD Q8) and schema additions

- **Context:** Expo is at concept stage. ENG, AVI, MED, CUL scenarios are in development; the AGR scene is not started. Unity has no scoring yet. Headsets are Meta Quest 3 and Quest 2 (PRD said Quest 3S). Kiosks are normally online via a Veza hotspot.
- **Decision:**
  - `docs/kiosk-api.md` is the spec the Unity team builds to, including the scoring/rubric format.
  - `pnpm kiosk:simulate` (M1) is the primary expo data source until pilot.
  - Added `VRSessionResult.simulated` so synthetic results never mix with real ones in reporting.
  - Added `KioskDevice.headsetModel` (`QUEST_3` | `QUEST_2`).
  - Claim-code pre-allocation and offline queueing become P1 fallbacks for hotspot outages; idempotent sync stays P0.
  - AGR-101 must work fully without VR data: matching performance falls back to quiz scores; AGR seed opportunities have no `minVrScore`.

## D-009 · 2026-11-08 · Other schema additions to PRD §11

- `AuthSession` model (DB sessions, 30-day trusted device) — referenced by `User.sessions` but not defined in PRD §11.1.
- `Asset3D.assetKey` (unique) for the shared Unity asset key `IND/object/v#` (PRD §13.5).
- `Event.requestId` to correlate analytics with logs.
- `Learner.deletedAt` for the 30-day deletion grace period (L-PF-2).
- All tables have `createdAt`/`updatedAt` except append-only ones (`Consent`, `Event`, `AuditLog`, `XpEvent`, `LedgerEntry`, `InterestSignal`, `CoachMessage`).

## D-010 · 2026-11-08 · Observability

- **Decision:** pino JSON logs with PII redaction paths; request ID generated in `proxy.ts` (`x-request-id`) and stored on analytics events; Sentry (`@sentry/nextjs`) initialised only when `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` are set. Source-map upload (`withSentryConfig`) deferred until a Sentry project exists.
- **Test hook:** `GET /api/dev/boom` throws on purpose (dev only).

## D-011 · 2026-11-08 · Analytics transport

- **Decision:** client `track()` batches events and flushes with `navigator.sendBeacon` to `POST /api/v1/events` (zod-validated, max 50 per batch, names must exist in `packages/analytics/src/events.ts`). Server `trackEvent()` writes `Event` rows and never throws.
- **Follow-up:** rate limiting and user attribution once auth lands (M1).

## D-012 · 2026-11-08 · Own phone-OTP auth with database sessions (not Auth.js)

- **Decision:** Phone OTP and sessions are implemented directly (`apps/web/lib/auth`): `OtpChallenge` rows (HMAC-hashed code, 5-min TTL, 5 attempts, atomic consume), `AuthSession` rows storing only sha256 of a random cookie token, httpOnly `sgela_session` cookie (SameSite=Lax). Trusted device = 30 days; otherwise a browser-session cookie backed by a 12 h row. "Log out everywhere" deletes all rows. Route guards: `requireSession` / `requireRole` / `requireLearnerPage` in `lib/auth/rbac.ts`.
- **Alternatives:** Auth.js v5 with a custom credentials provider (PRD 13.1).
- **Reason:** Auth.js credentials providers only work with JWT sessions, so PRD's DB sessions, 30-day trusted device and logout-everywhere would need workarounds; Auth.js adds no value for a phone-only flow with no OAuth. Revisit if social/SSO login is ever needed.
- **Rate limits:** counted from `OtpChallenge` rows (5 sends/hour/number, 20/hour/IP via salted IP hash, 30 s resend), no Redis needed yet. Per-hour limits are env-configurable (`OTP_MAX_SENDS_PER_*`); e2e raises the IP limit because all traffic comes from one IP.

## D-013 · 2026-11-08 · Dev SMS outbox for tests

- **Decision:** Console SMS/WhatsApp providers keep the last 200 messages in memory; `GET /api/dev/sms-outbox` exposes them when the console provider is active and dev pages are on (or `ENABLE_SMS_OUTBOX=1` under `next start` in CI). Never available with a real vendor.
- **Alternatives:** fixed test OTP; DB `Notification` rows (needs a user, which does not exist before sign-up).
- **Reason:** e2e reads real OTPs and consent links without weakening the OTP path.

## D-014 · 2026-11-08 · Kiosk idempotency store

- **Decision:** `IdempotencyRecord` (unique per device + key) stores request hash, status and response. The key is reserved before the handler runs, so concurrent retries get `409 IDEMPOTENCY_IN_PROGRESS` or a replay and never a second session. Same key + different body = `422`. 5xx results are not stored. Device keys `vk_live_`/`vk_test_` are stored as sha256 (`KioskDevice.apiKeyHash`, unique) and registered with `pnpm kiosk:create-device`. Added `KioskDevice.appVersion`, `battery`, `queueDepth` for heartbeat. Claim-code pre-allocation stays P1 (D-008).
- **Reason:** PRD 12.1/12.3 require retries never to duplicate; hotspot drops make retries common.

## D-015 · 2026-11-08 · Consent storage and rules

- **Decision:** `Consent` is append-only, enforced by a Postgres trigger that rejects `UPDATE` (deletes stay possible for account erasure). Resolution (`packages/matching/src/consent.ts`): latest row per scope wins; for minors, learner-granted rows are ignored but learner withdrawals count. `Learner.restricted` = no effective `PLATFORM` consent, recomputed in the same transaction as each consent write. Consent text version `2026-11-v1` lives in the `consent.*` message keys (en/zu/st); markdown copies in `packages/content/consent` follow when legal review lands.
- **Matching gate:** `isMatchable` (pure) plus `findMatchableLearnerIds` (query filters `restricted = false` and then applies the pure gate) so M5 can never see a restricted minor.

## D-016 · 2026-11-08 · Guardian links and reminders

- **Decision:** The consent link token is an HMAC of learner id + request time (`AUTH_SECRET`); the DB stores only its sha256. Reminders can therefore resend the same link without storing it, and re-inviting invalidates old links. Links last 30 days. `guardian.reminders` runs via `POST /api/cron/guardian-reminders` (Bearer `CRON_SECRET`, every 15 min from the host scheduler) or `pnpm --filter @sgela/web job:guardian-reminders`; it claims each reminder with a conditional update so parallel runs never double-send, and after downtime sends only the latest due reminder.
- **Alternatives:** Inngest/BullMQ now (PRD 13.1).
- **Reason:** one cron job does not justify a queue yet; pick the job runner with hosting in M8.

## D-017 · 2026-11-08 · Onboarding shape

- **Decision:** Routes `/start` (phone), `/start/verify` (auto-submits on the 6th digit), `/start/profile` (two screens in one form), then `/start/guardian` (under 18) or `/start/consent` (18+, L-ON-6; route added beyond PRD 7.1), then `/start/done`. A claim code from `/claim/[code]` waits in a 24 h `sgela_claim` cookie and is linked at the end of onboarding; claiming uses a conditional update so two accounts can never both win. Claims create initial `InterestSignal` rows (salted quarterly learner hash, no FK). Learner area requires finished onboarding; restricted minors are let in. Lighthouse CI now audits `/start`, `/claim/:code` and `/consent/:token` because learner routes need a session.
- **Seed:** 156 sample schools (3 per district, names marked "(sample)") until a real EMIS import; dev admin is `+27600000001` (valid mobile format).
- **Follow-up:** native-speaker review of new zu/st strings (D-006); real EMIS school list; learner career interests land with Compass (M2).

## D-018 · 2026-11-08 · Clickable demo shell and insights preview

- **Decision:** Home (Career Compass), Explore (+ world pages), Learn (+ course pages), Opportunities and Me badges/credentials render sample content from `apps/web/lib/demo/data.ts`, marked on screen with a dashed "Sample content - preview" tag. Real data is used where it already exists: linked expo scores on Home, the learner subjects on world pages (subject gaps), and the restricted-mode lock on Opportunities. `/admin/insights` (ADMIN/SUPER_ADMIN only; staff without a learner profile land there after sign-in) shows live aggregates: KPI tiles, an event funnel, learners by province and interest by world, with groups under 20 suppressed server-side.
- **Charts:** bars use one lime hue with text labels; the brand world colours fail the dataviz validator (lightness band; AGR vs MED normal-vision ΔE 14.8), so colour is never the only identity cue.
- **Reason:** stakeholders asked to see every section before M2-M7 are built. Each milestone replaces its block of sample data with DB-backed data.
- **Dev note:** `next dev` reloads in a loop when the repo sits in OneDrive (sync touches `.next`). Run the demo with `pnpm build` then `pnpm --filter @sgela/web start`, or move the repo out of OneDrive (see D-001).

## D-019 · 2026-11-08 · Repo moved out of OneDrive

- **Decision:** The working repo now lives at `C:\Users\mrmaf\dev\veza-sgela` (supersedes the location in D-001). The copy under `OneDrive/.../Experience Enablement Platform/veza-sgela` is stale and can be deleted once the new one is confirmed.
- **Reason:** inside OneDrive, `next dev` reloaded every page in a loop (183 reloads in 10 s vs 2 outside OneDrive) because sync touched the `.next` folder, as D-001 warned. Docker volume `veza-sgela_pgdata` is unchanged (same compose project name), so the database carried over.

## D-020 · 2026-11-08 · Visual direction: night-sky career constellation

- **Decision:** Brand surfaces in `apps/web/app/globals.css`: soft lime and aviation-blue glows on the deep-space background, translucent "glass" panels, and world-tinted cards (`.world-tint` with `--w` set to the world colour) with large world icons (lucide: plane, bolt, chef hat, stethoscope, sprout). Home leads with a 2D Career Compass (SVG radar of the five worlds sized by the learner real expo scores, PRD 7.2 fallback) and a gradient headline. Explore, world pages, Learn, Opportunities and claim results use the same tinted cards.
- **Constraints kept:** text stays in foreground/muted ink on tints (axe-clean in light and dark); world identity always has a text label; no backdrop blur or fixed backgrounds (cost on low-end Android); motion is a 400 ms fade-up, disabled under reduced motion.
- **Reason:** stakeholder feedback that the first pass was dull; the pitch deck look is immersive and dark-first.
- **Extended 2026-11-09:** sign-up (`/start*`) and public pages render inside one glass panel with a world-icon row, a segmented step bar and gradient step titles (`SimpleShell`, `StepHeader`); admin insights gets a glass header, world-tinted KPI tiles with icons (icon tint is decorative, the label carries meaning) and glass chart cards.

## D-021 · 2026-11-09 · Light-first layout modelled on the reference screens

- **Decision:** Replace the D-020 night-sky look with the structure of the functional reference screens (`Screens Ref/`, Knowledge Pele LMS), drawn in Veza brand. Light is the default theme (`next-themes` `defaultTheme="light"`, system preference no longer overrides; dark stays one tap away and is remembered). Cards are plain white with a soft shadow; world cards are flat pastel tints of the world colour. The desktop sidebar is a solid lime brand panel with an original compass-ring pattern, ink nav text, a white pill for the active item and the learner's initials and name at the bottom. The top bar shows the section name, language, theme and a lime Sign out button. Delivered in phases (1 base look, 2 sign-up, 3 Home dashboard, 4 Learn/Explore/Opportunities, 5 admin).
- **Alternatives:** keep dark default with the new layouts (rejected by stakeholder preference for the reference look); copy the reference yellow and logo pattern (rejected, CLAUDE.md: reference is functional only).
- **Constraints kept:** white text on lime fails contrast, so sidebar text is ink (`#231F20`, about 9:1 on `#ABCF37`); dark-theme muted text raised to `#A3ACB8` so small text on pastel tints clears 4.5:1 (new dark-theme axe test on Home); no backdrop blur.
- **Reason:** stakeholder feedback that D-020 looked poor and should follow the reference screens.

## D-022 · 2026-11-09 · Split sign-up layout with animated brand panel

- **Decision:** Sign-up (`/start*`) and public pages (claim, guardian consent) use a half-and-half layout like the reference sign-up screens: the form card on one half, a deep-space brand panel on the other with the "Veza Sgela" wordmark (small spaced VEZA over a bold Sgela, replacing the reference logo), a vertical sign-up stepper (`start.steps.*`, en/zu/st) and the tagline. The panel art is an original SVG (compass needle, rings, radar sweep and five career-world orbits) animated with CSS transforms only. Phones get a slim banner version above the form. The learner sidebar wordmark gains the same VEZA line.
- **Not changed:** sign-in stays phone number + SMS code (D-012); no password field was added even though the reference shows one.
- **Constraints kept:** art is `aria-hidden`; motion stops under prefers-reduced-motion (global rule in tokens.css); no images or video, so it is cheap on data and low-end phones; axe-clean in light and dark.
- **Reason:** stakeholder asked for the reference sign-up layout with a subtle, futuristic motion graphic and the Veza Sgela name.
