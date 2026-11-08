# Kiosk API: VR kiosk to platform contract

Status: **v1, implemented in M1-5.** Source: PRD 12.3. Audience: Veza Unity team. The platform defines this contract and Unity builds to it (DECISIONS D-008).

Every JSON block below tagged `<!-- contract:… -->` is executed by the contract tests in `apps/web/lib/kiosk/kiosk.contract.test.ts`. If you change an example, the tests must still pass.

## Conventions

- Base URL: `https://sgela.veza.africa` (placeholder). Dev: `http://localhost:3000`.
- JSON bodies, UTF-8. Timestamps are ISO 8601 **with an offset** (`2026-11-20T09:12:00+02:00`).
- Errors always use this envelope (PRD 12.1):

<!-- contract:error-envelope -->

```json
{ "error": { "code": "UNAUTHENTICATED", "message": "Missing or malformed device key" } }
```

## Auth

Each kiosk device has its own API key, sent as `Authorization: Bearer vk_live_<32+ chars>` (`vk_test_…` for test devices). The server stores only a SHA-256 hash; the raw key is shown once when the device is registered:

```bash
pnpm kiosk:create-device --label "Soweto kiosk 1" --headset QUEST_3 --id kd_01
```

The `deviceId` in every body must match the device that owns the key, otherwise `403 DEVICE_MISMATCH`. A revoked device (`active = false`) gets `401`.

## Idempotency and offline sync

- Every device `POST` may send `Idempotency-Key: <8-128 chars of A-Z a-z 0-9 . _ : ->`. Use one fresh UUID per logical request and **reuse it on every retry**.
- Same key + same body: the stored response is returned with the original status and header `Idempotent-Replayed: true`. No duplicate session is created.
- Same key + different body: `422 IDEMPOTENCY_KEY_REUSED`.
- Keys are scoped per device. Server errors (5xx) are not stored, so a retry runs again.
- Kiosks normally run online via the Veza hotspot. During an outage, queue sessions locally and sync later: `startedAt` may be up to **14 days** in the past. Times more than 5 minutes in the future are rejected.

## Endpoints

| Method and path                           | Purpose                                                        | Status      |
| ----------------------------------------- | -------------------------------------------------------------- | ----------- |
| `POST /api/v1/kiosk/sessions`             | Create an expo session at the end of a run; returns claim code | v1 (M1)     |
| `POST /api/v1/kiosk/heartbeat`            | Device health and last-seen                                    | v1 (M1)     |
| `GET /api/v1/qr/:code`                    | PNG QR code for a claim URL (kiosk screen, printed card)       | v1 (M1)     |
| `POST /api/v1/kiosk/claim-codes:allocate` | Pre-allocate 200 codes for offline QR display                  | P1 fallback |
| `POST /api/v1/kiosk/sessions/:id/link`    | Link a run to an existing learner via a kiosk token            | P1          |

### 1. Create expo session

`POST /api/v1/kiosk/sessions` with `Authorization` and `Idempotency-Key`.

<!-- contract:create-session-request -->

```json
{
  "deviceId": "kd_01",
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
      "headsetModel": "QUEST_3",
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
    },
    {
      "worldCode": "MED",
      "scenarioId": "med.ward.v1",
      "appVersion": "1.4.0",
      "headsetModel": "QUEST_3",
      "score": 66,
      "durationSec": 520,
      "completed": true,
      "rubric": [{ "criterion": "Hand hygiene moments", "score": 4, "max": 5 }]
    }
  ]
}
```

`expoEventId` is optional; when present it must be an existing expo event (`422 UNKNOWN_EXPO_EVENT`).

**Response `201 Created`**

<!-- contract:create-session-response -->

```json
{
  "sessionId": "cmabc123example",
  "claimCode": "K7Q4MX",
  "claimUrl": "https://sgela.veza.africa/claim/K7Q4MX",
  "qrPngUrl": "https://sgela.veza.africa/api/v1/qr/K7Q4MX",
  "expiresAt": "2026-12-20T21:59:59.000Z"
}
```

Show the QR (`qrPngUrl`, 480 px PNG) and the human code as `K7Q-4MX` on the kiosk screen; optionally print a card. Codes use Crockford base32 (no I, L, O, U), are unique, and expire at 23:59:59 SAST 30 days after creation (setting `claim.expiryDays`). Learners may type them in any case, with or without the hyphen.

#### Result fields (per world)

| Field           | Type                        | Rules                                                   |
| --------------- | --------------------------- | ------------------------------------------------------- |
| `worldCode`     | `AVI ENG CUL MED AGR`       | required; each world at most once per session           |
| `scenarioId`    | string ≤ 80                 | required, e.g. `eng.panel.v1` (placeholder IDs for now) |
| `appVersion`    | string ≤ 40                 | required                                                |
| `headsetModel`  | `QUEST_3` or `QUEST_2`      | optional                                                |
| `score`         | integer 0-100               | required                                                |
| `durationSec`   | integer 0-14400             | required                                                |
| `accuracy`      | integer 0-100               | optional                                                |
| `safetyErrors`  | integer ≥ 0                 | optional                                                |
| `decisionScore` | integer 0-100               | optional                                                |
| `completed`     | boolean                     | required                                                |
| `rubric`        | `{criterion, score, max}[]` | optional, ≤ 30 items, defaults to `[]`                  |
| `events`        | object                      | optional compressed telemetry summary                   |

A session has 1 to 5 results. Session fields: `deviceId` (required), `startedAt`, `endedAt` (required, `endedAt ≥ startedAt`), `ageBand`, `gradeBand` (≤ 10 chars), `clarityPre` (1-5).

#### Errors

| Status | Code                      | When                                           |
| ------ | ------------------------- | ---------------------------------------------- |
| 400    | `INVALID_JSON`            | body is not JSON                               |
| 400    | `INVALID_SESSION`         | schema violation (`details` lists the issues)  |
| 400    | `INVALID_IDEMPOTENCY_KEY` | key has bad characters or length               |
| 401    | `UNAUTHENTICATED`         | missing, malformed, unknown or revoked key     |
| 403    | `DEVICE_MISMATCH`         | `deviceId` is not the key owner                |
| 409    | `IDEMPOTENCY_IN_PROGRESS` | same key still being processed; retry in 1-2 s |
| 422    | `INVALID_TIMES`           | `endedAt` before `startedAt`, or in the future |
| 422    | `SESSION_TOO_OLD`         | `startedAt` more than 14 days ago              |
| 422    | `UNKNOWN_EXPO_EVENT`      | `expoEventId` not found                        |
| 422    | `IDEMPOTENCY_KEY_REUSED`  | same key, different body                       |
| 503    | `CLAIM_CODE_EXHAUSTED`    | could not allocate a unique code (retry)       |

### 2. Heartbeat

`POST /api/v1/kiosk/heartbeat`, every 60 seconds while the kiosk app is open.

<!-- contract:heartbeat-request -->

```json
{
  "deviceId": "kd_01",
  "appVersion": "1.4.0",
  "headsetModel": "QUEST_2",
  "battery": 76,
  "queueDepth": 0
}
```

**Response `200 OK`**

<!-- contract:heartbeat-response -->

```json
{ "deviceId": "kd_01", "serverTime": "2026-11-20T07:30:00.000Z" }
```

Updates `lastSeenAt`, `appVersion`, `headsetModel`, `battery` (0-100) and `queueDepth` (sessions waiting to sync).

### 3. P1 fallbacks (not built yet)

- **Claim-code pre-allocation** (`POST /api/v1/kiosk/claim-codes:allocate`, blocks of 200 per device) for hotspot outages, so the QR still works when the kiosk is offline at the moment of play. Deferred per D-008 because kiosks are normally online.
- **Link to an existing learner** (`POST /api/v1/kiosk/sessions/:id/link`) with a short-lived learner kiosk token shown in the app.

## Scoring guidance for scenario designers (refine with industry partners)

Unity has no scoring yet. Until it does, `pnpm kiosk:simulate --world AVI,MED --score 78,66` creates sessions through the same service (results marked `simulated: true`) and prints claim URLs.

| World               | Status         | Example rubric criteria                                                           |
| ------------------- | -------------- | --------------------------------------------------------------------------------- |
| ENG (panel wiring)  | in development | isolation before testing, correct wiring order, PPE worn, test procedure followed |
| AVI (pre-flight)    | in development | walkaround checklist coverage, hazards spotted, cockpit check order               |
| CUL (kitchen shift) | in development | hygiene steps, cross-contamination avoided, timing, plating                       |
| MED (ward)          | in development | hand hygiene moments, triage priority, infection-control zones                    |
| AGR (smart farm)    | not started    | soil test steps, irrigation set-up, harvest timing (draft)                        |

`score` is the overall 0-100 result shown to the learner. Keep rubric `max` values small (5 or 10) so the learner app can show them as simple bars.
