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
