# AGENTS.md

## Repo overview

pnpm monorepo for a school sports competition management platform. Four apps + one shared package:

| Package | Path | Stack | Status |
|---|---|---|---|
| `@ssmp/shared-types` | `packages/shared-types/` | Zod schemas, TypeScript, OpenAPI generation | Core contract layer |
| `@ssmp/api` | `apps/api/` | Node.js/Express, PostgreSQL, Jest, Socket.IO | Backend |
| `@ssmp/admin` | `apps/admin/` | React 19, Vite, Tailwind 4 | Admin portal |
| `@ssmp/public` | `apps/public/` | Next.js, Tailwind 4 | Public site |
| `ssmp-android` | `apps/android/` | Kotlin, Jetpack Compose, Hilt, Room, WorkManager | Coach app |

Shared types are the single source of truth. API, admin, public, and Android all import from `@ssmp/shared-types`.

## Setup

```bash
pnpm install                                        # install all workspace deps
pnpm --filter @ssmp/shared-types build              # build shared types FIRST (required by api + admin)
```

For the API with real PostgreSQL:
```bash
# apps/api/.env must contain:
# DATABASE_URL=postgresql://postgres:<password>@localhost:5432/ssmp
# Run migrations:
psql -U postgres -d ssmp -f apps/api/src/db/migrations/001_initial.sql
psql -U postgres -d ssmp -f apps/api/src/db/migrations/002_fixtures_matches.sql
psql -U postgres -d ssmp -f apps/api/src/db/migrations/003_cards_suspensions.sql
# Seed test data:
psql -U postgres -d ssmp -f apps/api/src/db/seed.sql
```

## Dev servers

```bash
pnpm dev:api                          # API on :3001 (with Socket.IO)
pnpm --filter @ssmp/admin dev         # Admin on :3000 (Vite)
pnpm --filter @ssmp/public dev        # Public on :3002
```

Android app: open `apps/android/` in Android Studio, sync Gradle, build.

## Testing

```bash
pnpm --filter @ssmp/api test          # run all API integration tests (Jest) — 9 suites, ~80 tests
pnpm --filter @ssmp/api test:watch    # watch mode
```

Tests use a mock DB (in-memory Maps) — no PostgreSQL needed. Mock setup is in `apps/api/tests/setup.js`. The mock-db.js handles fixtures, matches, match_events, cards, suspensions, standings, and notifications.

## Type checking

```bash
pnpm --filter @ssmp/shared-types build    # tsc (strict mode)
pnpm --filter @ssmp/admin lint            # tsc --noEmit (admin uses strict: false)
```

## OpenAPI generation

After changing any Zod schema in `packages/shared-types/src/index.ts`:

```bash
pnpm --filter @ssmp/shared-types build    # rebuild types first
pnpm --filter @ssmp/api generate:openapi  # regenerate apps/api/swagger/openapi.yaml
```

The script is CJS (`scripts/generate-openapi.cjs`) because it imports from the compiled `dist/`. Always rebuild shared-types before regenerating.

## Key conventions

- **Backend is CJS** (`require`/`module.exports`). Admin is ESM (`import`/`export`). Android is Kotlin.
- **Shared types use `z.string()` for dates**, not `z.date()` — the API layer handles Date conversion. The admin mockDb uses ISO strings directly.
- **Zod is pinned to 3.23.8** — `@asteasolutions/zod-to-openapi@7.3.4` requires Zod 3.x (v8 needs Zod 4).
- **Admin tsconfig has `strict: false`** — the AI-generated admin code uses string dates and loose typing. Don't tighten without fixing all mockDb date assignments.
- **API modules follow vertical-slice pattern**: each entity gets `*.routes.js`, `*.controller.js`, `*.service.js` in `apps/api/src/modules/<entity>/`.
- **Services** live in `apps/api/src/services/` (socket, discipline, notification).
- **RBAC uses permission keys** (e.g. `team:create`), not raw role arrays. See `apps/api/src/middleware/permissions.js`.
- **Shared types exports**: main entry is `@ssmp/shared-types`, OpenAPI generator is `@ssmp/shared-types/openapi`.

## API architecture

### Match lifecycle (17 states)
`scheduled → officials_assigned → lineups_submitted → lineups_locked → kickoff → half_time → second_half → (extra_time → penalties) → full_time → report_submitted → verified → published`

Terminal states: `cancelled`, `abandoned`, `walkover`. See `apps/api/src/modules/matches/match.service.js`.

### Fixture generation
Round-robin group stage with conflict detection (pitch/time clashes). See `apps/api/src/modules/fixtures/fixture.service.js`.

### Discipline engine
Auto-suspension on yellow card threshold (configurable per competition). Immediate red card suspension. Suspensions auto-serve after match `full_time`. See `apps/api/src/services/discipline.service.js`.

### Real-time (Socket.IO)
Server broadcasts `match_status_change`, `match_event`, `score_update`, `notification` events. Rooms scoped by `match:<id>`. JWT auth on handshake. See `apps/api/src/services/socket.service.js`.

### Key API endpoints
- `POST /api/matches/:id/events` — record match event (triggers discipline check)
- `POST /api/matches/:id/submit-report` — official submits scores
- `POST /api/matches/:id/verify` — comp_admin verifies
- `POST /api/matches/:id/publish` — publishes and updates standings
- `GET /api/discipline/competitions/:id/suspended-players` — get suspended player IDs
- `POST /api/auth/dev-token` — dev-only endpoint for getting a signed JWT

### Notification service
Console-logged for now. Broadcasts via Socket.IO. Real push delivery deferred. See `apps/api/src/services/notification.service.js`.

## Android app

Package: `com.qaphael.ssmp`. Stack: Kotlin, Compose, Hilt, Room, WorkManager, Retrofit + Moshi.

Offline write-queue: roster edits and lineup submissions queue to Room `pending_writes` table when offline. WorkManager drains the queue on reconnect. See `apps/android/app/src/main/java/com/qaphael/ssmp/sync/`.

Screens: Dashboard, Roster, Lineup, Fixtures, Notifications. Each has its own ViewModel injected via Hilt.

## Gotchas

- `pnpm install` may fail on Windows with `esbuild` build scripts. Run `pnpm approve-builds` if needed, or ignore — it doesn't block functionality.
- The admin app was generated by Google AI Studio. Component logic is untouched; only imports were fixed to use `@ssmp/shared-types`.
- The API needs a `.env` file with `DATABASE_URL` for real DB operations. Tests bypass this with mocks.
- `pnpm-lock.yaml` is committed — don't delete it to "fix" install issues.
- The public app uses Tailwind v4 with `@tailwindcss/postcss` plugin. The `globals.css` uses `@import "tailwindcss"` and `@theme` blocks with `--color-*` prefixed variables.
- Socket.IO runs on the same port as the API (3001). The admin app fetches a dev JWT from `POST /api/auth/dev-token` before connecting.
- The mock DB (`apps/api/tests/mock-db.js`) must be updated when adding new SQL query patterns — it uses string matching on SQL to route queries.
- DB migrations are numbered sequentially: `001_initial.sql` (base tables), `002_fixtures_matches.sql` (fixtures, matches, officials, pitches, standings), `003_cards_suspensions.sql` (cards, suspensions). Run them in order.
