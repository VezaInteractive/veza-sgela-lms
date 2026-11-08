# Kiosk API: VR kiosk to platform contract

Status: **stub (M0-7)**. Full contract, examples and contract tests land in M1-5. Source: PRD 12.3.
Audience: Veza Unity team. The platform defines this contract and Unity builds to it (DECISIONS D-008).

## Auth

Each kiosk device has an API key: `Authorization: Bearer vk_live_...`. Keys are stored hashed and rotatable in admin.

## Endpoints (M1)

| Method and path                           | Purpose                                                                       |
| ----------------------------------------- | ----------------------------------------------------------------------------- |
| `POST /api/v1/kiosk/sessions`             | Create an expo session at the end of a learner run; returns claim code and QR |
| `POST /api/v1/kiosk/heartbeat`            | Device health: deviceId, appVersion, headsetModel, battery, queueDepth        |
| `POST /api/v1/kiosk/claim-codes:allocate` | (P1 fallback) pre-allocate 200 codes for offline use                          |
| `POST /api/v1/kiosk/sessions/:id/link`    | (P1) link a run to an existing learner via kiosk token                        |

## Result payload per world (draft)

- `worldCode`: AVI, ENG, CUL, MED or AGR
- `scenarioId`: e.g. `eng.panel.v1` (placeholder IDs until scenarios are final)
- `appVersion`, `headsetModel` (QUEST_3 or QUEST_2)
- `score` 0-100, `durationSec`, `accuracy` 0-100, `safetyErrors` (count), `decisionScore` 0-100
- `completed` (boolean)
- `rubric`: list of `{ criterion, score, max }`

### Scoring guidance for scenario designers (refine with industry partners)

| World               | Status         | Example criteria                                                                  |
| ------------------- | -------------- | --------------------------------------------------------------------------------- |
| ENG (panel wiring)  | in development | isolation before testing, correct wiring order, PPE worn, test procedure followed |
| AVI (pre-flight)    | in development | walkaround checklist coverage, hazards spotted, cockpit check order               |
| CUL (kitchen shift) | in development | hygiene steps, cross-contamination avoided, timing, plating                       |
| MED (ward)          | in development | hand hygiene moments, triage priority, infection-control zones                    |
| AGR (smart farm)    | not started    | soil test steps, irrigation set-up, harvest timing (draft)                        |

## Rules

- Claim codes: 6 chars, Crockford base32 (no I, L, O, U), unique, expire after 30 days.
- All device POSTs accept an `Idempotency-Key` header; retries never create duplicates.
- `startedAt` may be up to 14 days in the past (offline sync).
