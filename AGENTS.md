# AGENTS.md

## Repo overview

pnpm monorepo for a school sports competition management platform. Four apps + one shared package:

| Package | Path | Stack |
|---|---|---|
| `@ssmp/shared-types` | `packages/shared-types/` | Zod schemas, TypeScript, OpenAPI generation |
| `@ssmp/api` | `apps/api/` | Node.js/Express (CJS), PostgreSQL, Jest, Socket.IO |
| `@ssmp/admin` | `apps/admin/` | React 19, Vite, Tailwind 4 (ESM) |
| `@ssmp/public` | `apps/public/` | Next.js, Tailwind 4 |
| `ssmp-android` | `apps/android/` | Kotlin, Jetpack Compose, Hilt, Room, WorkManager |

Shared types are the single source of truth. All other packages import from `@ssmp/shared-types`.

## Setup

```bash
pnpm install
pnpm --filter @ssmp/shared-types build    # MUST build first — api + admin depend on it
```

For the API with real PostgreSQL:
```bash
# apps/api/.env must contain:
# DATABASE_URL=postgresql://postgres:<password>@localhost:5432/ssmp
# JWT_SECRET=<some-secret>

# Run migrations in order (001–011):
for f in apps/api/src/db/migrations/*.sql; do psql -U postgres -d ssmp -f "$f"; done
# Seed test data:
psql -U postgres -d ssmp -f apps/api/src/db/seed.sql
```

Seed users (password: `password123`):
- `admin@ssmp.local` (system_admin)
- `comp@ssmp.local` (comp_admin)
- `coach1@ssmp.local`, `coach2@ssmp.local` (coach)
- `official@ssmp.local` (official)
- `registrar@ssmp.local`, `refcoord@ssmp.local`, `media@ssmp.local`

## Dev servers

```bash
pnpm dev:api                          # API on :3001 (with Socket.IO)
pnpm --filter @ssmp/admin dev         # Admin on :3000 (Vite)
pnpm --filter @ssmp/public dev        # Public on :3002
```

Android: open `apps/android/` in Android Studio, sync Gradle, build.

## Admin app auth flow

The admin app has a full auth gate. When `VITE_API_URL` is set:
- Shows login screen on load (no token → login)
- Supports register, forgot password, reset password
- All API calls use real JWT from `src/shared/api/auth.ts`
- 401 responses auto-logout and redirect to login
- Header shows real user name/initials, logout button

When `VITE_API_URL` is empty (demo mode):
- Skips auth entirely, uses `mockDb` with localStorage
- Shows amber "Demo Mode" banner
- Role simulator dropdown in header (dev-only)
- Socket.IO uses dev-token endpoint

## Testing

```bash
pnpm --filter @ssmp/api test          # 12 suites, ~109 tests
pnpm --filter @ssmp/api test:watch    # watch mode
```

Tests use a mock DB (`apps/api/tests/mock-db.js`) — no PostgreSQL needed. **Critical:** mock-db uses string matching on SQL to route queries. When adding new SQL patterns in services, you MUST update mock-db.js to match the new SQL shape, or tests will silently return empty results.

## Type checking

```bash
pnpm --filter @ssmp/shared-types build    # tsc (strict mode)
pnpm --filter @ssmp/admin lint            # tsc --noEmit (admin uses strict: false)
```

## OpenAPI generation

```bash
pnpm --filter @ssmp/shared-types build    # rebuild types first
pnpm --filter @ssmp/api generate:openapi  # regenerate apps/api/swagger/openapi.yaml
```

Script is CJS (`scripts/generate-openapi.cjs`) — imports from compiled `dist/`. Always rebuild shared-types first.

## Key conventions

- **Backend is CJS** (`require`/`module.exports`). Admin is ESM (`import`/`export`). Android is Kotlin.
- **Shared types use `z.string()` for dates**, not `z.date()`. The API handles Date conversion. Admin mockDb uses ISO strings.
- **Zod is pinned to 3.23.8** — `@asteasolutions/zod-to-openapi@7.3.4` requires Zod 3.x.
- **Admin tsconfig has `strict: false`** — AI-generated admin code uses string dates and loose typing.
- **API modules follow vertical-slice pattern**: `apps/api/src/modules/<entity>/{entity}.routes.js, .controller.js, .service.js`.
- **Services** in `apps/api/src/services/` (socket, discipline, notification).
- **RBAC uses permission keys** (e.g. `team:create`), not raw role arrays. See `apps/api/src/middleware/permissions.js`.
- **Shared types exports**: main entry `@ssmp/shared-types`, OpenAPI generator `@ssmp/shared-types/openapi`.

## API architecture

### Auth system

- `POST /api/auth/login` — email + password → JWT + user object
- `POST /api/auth/register` — restricted to coach/official/media_officer roles (admin accounts created via user management)
- `POST /api/auth/forgot-password` — generates reset token (logged to console in dev)
- `POST /api/auth/reset-password` — validates token, updates password
- `GET /api/auth/me` — returns current user from JWT
- `POST /api/auth/change-password` — authenticated, requires old password
- `PUT /api/auth/profile` — authenticated, update first/last name
- `GET/PUT/DELETE /api/users/*` — system_admin only, user CRUD
- `POST /api/auth/dev-token` — **dev-only**, returns JWT for any role (guarded by `NODE_ENV === 'development'`)

JWT payload: `{ id, email, role }`, 24h expiry. Auth middleware extracts to `req.user`.

### Public (unauthenticated) routes

Mounted at `/api/public/*` — no auth middleware:

| Route | Entity |
|---|---|
| `/api/public/competitions` | Competitions |
| `/api/public/teams` | Teams |
| `/api/public/players` | Players |
| `/api/public/organizations` | Organizations |
| `/api/public/seasons` | Seasons |
| `/api/public/matches` | Matches (list, get, events) |
| `/api/public/media` | Approved media |
| `/api/public/standings` | Standings by competition |

**Public route gotcha:** Most public routes reuse the same controller methods as authenticated routes. This works for `list`/`getById` that don't touch `req.user`. But `team.controller.list` accesses `req.user.id` for coach filtering — so `team-public.routes.js` calls `teamService.list(req.query, null, null)` directly instead of going through the controller. When adding new public routes, verify the controller method doesn't access `req.user` before reusing it.

### Match lifecycle

`scheduled → officials_assigned → lineups_submitted → lineups_locked → kickoff → half_time → second_half → (extra_time → penalties) → full_time → report_submitted → verified → published`

Terminal: `cancelled`, `abandoned`, `walkover`. Score correction: `POST /api/matches/:id/correct-score` (system_admin only, published matches only, recomputes standings).

### Discipline engine

Auto-suspension on yellow card threshold. Immediate red card suspension. Suspensions auto-serve after `full_time`. See `apps/api/src/services/discipline.service.js`.

### Real-time (Socket.IO)

Same port as API. JWT auth on handshake. Events: `match_status_change`, `match_event`, `score_update`, `notification`. Rooms: `match:<id>`. See `apps/api/src/services/socket.service.js`.

### Rate limiting

- General: 200 req/15min on all routes
- Auth: 20 req/15min on `/api/auth/*`
- Express `trust proxy` is set to 1 (required behind Nginx)

## Docker deployment

```bash
docker compose up -d --build    # builds API + admin images
```

Production runs on VPS at `212.47.72.186`:
- API: `https://api.ssmp.ocaya.space` (Docker port 3005 → container 3000)
- Admin: `https://admin.ssmp.ocaya.space` (Docker port 3006 → container 80)
- PostgreSQL: shared `boda-postgres` container on `boda_default` network
- Nginx reverse proxy with SSL (Let's Encrypt)

Environment variables for production:
```
DATABASE_URL=postgresql://ssmp:ssmp_2026!@boda-postgres:5432/ssmp
JWT_SECRET=ssmp-prod-jwt-secret-2026
CORS_ORIGIN=https://admin.ssmp.ocaya.space,https://ssmp.ocaya.space
SOCKET_CORS_ORIGIN=https://admin.ssmp.ocaya.space,https://ssmp.ocaya.space
```

## Gotchas

- **`pnpm install` may fail on Windows** with `esbuild` build scripts. Run `pnpm approve-builds` if needed.
- **Shared types must be built first** before API or admin can use updated schemas.
- **Migrations are numbered sequentially** `001`–`011`. Run in order. Increment when adding new ones.
- **Mock DB must be updated** when adding new SQL query patterns — it uses string matching on SQL to route queries.
- **`pnpm-lock.yaml` is committed** — don't delete it.
- **Admin uses `strict: false`** — don't tighten without fixing all mockDb date assignments.
- **Public routes vs controllers** — don't blindly reuse controller methods for public routes; check if they access `req.user`.
- **Registration is role-restricted** — only coach/official/media_officer can self-register. Admin accounts created via `/api/users`.
- **Socket.IO CORS** uses same allowlist as HTTP CORS (`SOCKET_CORS_ORIGIN` env var).
- **Dev-token endpoint** only available when `NODE_ENV === 'development'`. Never deploy to production without `JWT_SECRET` set.
- **Windows line endings** — LF/CRLF warnings are cosmetic, don't affect functionality.
