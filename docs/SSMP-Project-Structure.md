# SSMP — Project Structure

Companion to `SSMP-PRD.md`. This is the actual repo/folder layout for building the three apps + backend described there.

## Repo strategy

A monorepo for the three web-facing codebases (API, Admin, Public), sharing one contracts layer so a data-shape change only happens once instead of drifting across three copies — plus a separate repo for the Android app, since its tooling and release process (Play Store) are independent of the web deploys.

```
ssmp/                          (monorepo)
├── apps/
│   ├── api/                   # Node.js/Express backend
│   ├── admin/                 # React admin web portal
│   └── public/                # Next.js public website
├── packages/
│   └── shared-types/          # Zod schemas + TS types, shared by api/admin/public
├── docs/
│   ├── SSMP-PRD.md
│   └── SSMP-Project-Structure.md
├── package.json
└── pnpm-workspace.yaml

ssmp-android/                  (separate repo)
└── app/...
```

This is a recommendation, not a requirement — fully separate repos for everything also works if independent deployment pipelines matter more than shared types.

---

## Shared contract layer (`packages/shared-types`)

One package defines: what an Organization/Season/Competition/Team/Player/Match looks like, what's required on each write operation, and what real-time events exist and what they carry — as Zod schemas with inferred TypeScript types.

Every client — Admin, Public, and (via the OpenAPI spec generated from this layer) the Android app — reads from this one contract instead of each maintaining its own understanding of the data shapes. When the contract changes, every TS consumer breaks at compile time instead of silently drifting.

---

## apps/api — Backend (Node.js/Express)

Organized as **one module per entity**, not one giant folder per technical layer. Each entity in the hierarchy gets its own self-contained module, restructured from the current SFL PRO routes — your `createServices(db, io)` factory pattern carries over:

```
apps/api/
├── src/
│   ├── server.js                  # entrypoint — listens, starts socket.io
│   ├── app.js                     # express app, middleware mounted AFTER services init
│   ├── config/
│   │   ├── env.js
│   │   └── db.js                  # pg Pool (connection pooling)
│   ├── db/
│   │   ├── migrations/
│   │   └── seeds/
│   ├── sockets/
│   │   ├── index.js
│   │   └── matchRoom.js
│   ├── middleware/
│   │   ├── auth.js                 # JWT verify
│   │   ├── rbac.js                 # role/permission checks
│   │   ├── validate.js             # wraps shared Zod schemas
│   │   └── errorHandler.js
│   ├── modules/
│   │   ├── organizations/
│   │   ├── seasons/
│   │   ├── competitions/           # includes Competition Wizard endpoints
│   │   ├── sports/
│   │   ├── divisions/
│   │   ├── groups/
│   │   ├── teams/
│   │   ├── players/
│   │   ├── matches/                # match lifecycle state machine
│   │   ├── officials/
│   │   ├── registrations/          # registration windows + school approval
│   │   ├── rosters/                # roster submission + approval
│   │   ├── transfers/
│   │   ├── discipline/             # card thresholds, auto-suspension
│   │   ├── injuries/
│   │   ├── notifications/
│   │   ├── audit/
│   │   └── users/
│   │       # each module: *.routes.js, *.controller.js, *.service.js, *.schema.js
│   └── utils/
├── tests/
│   ├── unit/
│   ├── integration/                # Supertest
│   └── property/                   # fast-check
├── swagger/
│   └── openapi.yaml                # source of truth — Android client generated from this
├── package.json
└── .env.example
```

Cross-cutting concerns (auth, RBAC, error handling, real-time broadcast, audit logging) live in `middleware/`, outside the entity modules. Schema changes go through versioned migrations only.

---

## apps/admin — Admin Web Portal (React + Vite)

Organized as **one folder per workflow**, not one per role — several roles share screens (Officials and the Competition Administrator both use the match-control console):

```
apps/admin/
├── src/
│   ├── main.tsx
│   ├── app/
│   │   ├── routes.tsx
│   │   └── layout/                  # shell, sidebar, role-aware nav
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── competitions/             # wizard + list + settings
│   │   ├── seasons/
│   │   ├── registrations/            # school/team approval queue
│   │   ├── rosters/                  # roster approval queue
│   │   ├── fixtures/
│   │   ├── officials/
│   │   ├── matchControl/             # live console — Official + Comp Admin
│   │   ├── standings/
│   │   ├── media/
│   │   ├── auditLogs/
│   │   └── settings/
│   ├── shared/
│   │   ├── api/                      # fetch wrapper, unwraps .data automatically
│   │   ├── components/
│   │   ├── hooks/
│   │   └── sockets/                  # socket.io client
│   └── styles/
├── index.html
└── package.json
```

Navigation adapts to the logged-in role, but that's UX convenience only — every permission check is re-enforced by the backend regardless of what the interface shows or hides.

---

## apps/public — Public Website (Next.js)

Next.js specifically so fixtures, results, and profiles are server-rendered and indexable by Google — that's the whole reason this is a website rather than an app:

```
apps/public/
├── app/                              # App Router
│   ├── page.tsx                       # home — today's fixtures, live scores
│   ├── competitions/[id]/
│   ├── teams/[id]/
│   ├── players/[id]/
│   ├── standings/
│   ├── brackets/
│   └── news/
├── components/
├── lib/
│   ├── apiClient.ts
│   └── sockets.ts
├── public/                            # static assets, PWA manifest
└── package.json
```

---

## ssmp-android — Team App (separate repo)

Kotlin, Jetpack Compose, MVVM, Retrofit — with a `sync/` layer for the offline-queue behavior the PRD calls for (coaches editing rosters/lineups pitch-side with poor connectivity):

```
ssmp-android/
├── app/src/main/java/com/qaphael/ssmp/
│   ├── SSMPApp.kt
│   ├── di/                            # Hilt modules
│   ├── data/
│   │   ├── remote/
│   │   │   ├── api/                    # Retrofit interfaces — generated from openapi.yaml
│   │   │   └── dto/
│   │   ├── local/                      # Room — offline cache + write queue
│   │   └── repository/
│   ├── domain/
│   │   ├── model/
│   │   └── usecase/
│   ├── ui/
│   │   ├── dashboard/
│   │   ├── roster/
│   │   ├── lineup/
│   │   ├── fixtures/
│   │   ├── transfers/
│   │   ├── notifications/
│   │   └── common/                     # theme, shared composables
│   └── sync/                           # WorkManager jobs draining the offline queue
└── build.gradle.kts
```

---

## Structural principles that apply everywhere

- One module per entity or workflow at the top level — never one giant catch-all folder per technical layer (e.g. no single "controllers/" folder holding logic for every entity at once).
- The shared contract layer is the single source of truth for data shapes. No client maintains its own independent copy of "what a Player looks like."
- Every permission check is enforced server-side. Anything client-side is UX convenience, never the actual security boundary.
- Database changes happen through migrations, never direct edits.
- The API specification documents both REST endpoints and real-time events in one place, so any client — present or future — can be built or validated against it without guesswork.
- Tests are organized by the same module boundaries as the code they test.

---

## Migration path from the current codebase

The existing backend doesn't need a rewrite from zero — it needs to be re-sliced:

1. Stand up empty entity-module folders, then move existing route handlers into them one entity at a time — start with Team and Player, since those carry the biggest workflow changes (registration windows, approval).
2. Introduce Organization and Season as new top-level modules, then repoint existing Competition/Match relationships at them via migration.
3. Rename "captain" → "coach" at the data, auth-token, and API-response level in a single pass, with a short-lived compatibility shim if any existing client still expects the old field name.
4. Only after the data model and permission-enforcement layer are settled, split the current single front-end into the separate Admin and Public applications — don't do the structural rewrite and the workflow rewrite at the same time.
