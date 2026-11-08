# Sgela: Veza Sgela Experience Enablement Platform

Build spec: [docs/PRD.md](docs/PRD.md). Decisions: [docs/DECISIONS.md](docs/DECISIONS.md). Kiosk contract: [docs/kiosk-api.md](docs/kiosk-api.md).

## Quick start

```bash
pnpm install
cp .env.example .env && cp .env.example packages/db/.env
pnpm db:up        # Postgres 16 + pgvector, Redis (Docker)
pnpm db:migrate
pnpm db:seed
pnpm dev          # http://localhost:3000
```

## Commands

`pnpm dev` · `pnpm build` · `pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm e2e` · `pnpm db:migrate` · `pnpm db:seed` · `pnpm db:studio`

Dev-only pages: `/dev/ui` (design tokens), `/api/dev/boom` (Sentry test), `/api/health`.

## Layout

- `apps/web`: Next.js app (learner, admin, public, API)
- `packages/*`: ui, db, analytics, geo, messaging, contracts, three, content, matching, coach, config
- `tools/asset-pipeline`: 3D asset processing (M3)
- `docs/`: PRD, spec, decisions, kiosk API
