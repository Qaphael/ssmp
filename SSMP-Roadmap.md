# SSMP — Roadmap & To-Do

Companion to `SSMP-PRD.md` and `SSMP-Project-Structure.md`. This sequences the actual build across all 4 codebases (API, Admin, Public, Android) and the AI tools involved (Claude/Claude Code, v0, Google AI Studio), in the order that avoids throwaway work.

**Rule of thumb for the whole project:** never let a client app (v0, AI Studio, Android) get more than one stage ahead of the backend contract it depends on. If the contract is still moving, AI-generated client code is disposable — that's fine, that's what it's for. The expensive mistake is building real client logic against a contract you're about to change.

---

## Start right now (this week)

- [ ] Create the `ssmp/` monorepo on GitHub: `apps/api`, `packages/shared-types`, `docs/` (drop the PRD and Project Structure docs in there)
- [ ] Write Zod schemas in `packages/shared-types` for the entities changing the most: Organization, Season, Competition, Team, Player. Port the rest over from current SFL PRO models as you migrate them, not all at once.
- [ ] Add a generation script (`zod-to-openapi` or similar) that produces `apps/api/swagger/openapi.yaml` from `packages/shared-types` — this file becomes the one contract every client reads from.
- [ ] Don't touch v0 or AI Studio yet. Nothing is stable enough for them to build against.

---

## Stage 1 — Foundation (backend only)

**Goal:** a small set of real, stable endpoints matching the new hierarchy — enough to demo Organization → Season → Competition → Team → Player end to end. No UI deliverable in this stage; resist getting pulled into frontend work here.

- [ ] Stand up empty `modules/` folders per entity (per the Project Structure doc)
- [ ] Add `organizations` and `seasons` as new top-level modules
- [ ] Migrate `teams` and `players` into the new structure; add registration-window logic and roster-approval status
- [ ] Rename captain → coach at the DB column, JWT claim, and API-response level in one pass (short-lived compatibility shim if any old client still expects the old field)
- [ ] Wire RBAC middleware for all 8 roles
- [ ] Get auth + Organization/Season/Competition/Team/Player CRUD passing integration tests
- [ ] Regenerate `openapi.yaml`, sanity-check it against the actual routes

---

## Stage 2 — Phase 1 MVP, client by client

Order matters here — lowest-risk, most-stable-contract clients go first.

**1. Public Site (v0)** — read-only, only needs stable GET endpoints
- [ ] Push the monorepo to GitHub, connect v0 to it scoped to `apps/public`
- [ ] Build: home/fixtures, competition detail, team profile, player profile, standings
- [ ] Confirm it resolves `packages/shared-types` as a normal workspace dependency

**2. Admin Portal (React/Vite)** — needs the approval-workflow endpoints from Stage 1
- [ ] Competition Wizard screen
- [ ] Registration approval queue
- [ ] Roster approval queue
- [ ] Fixture generation + conflict view
- [ ] If built in AI Studio: export its repo, merge into `apps/admin`, swap its guessed types for real `shared-types` imports

**3. Backend, second pass** — add fixture generation, match lifecycle with verification step, basic push notifications. Needed before match-control or Android work makes sense.

**4. Android Team App** — last, because offline sync punishes a moving contract
- [ ] Prompt AI Studio for the Dashboard, Roster, Lineup, Fixtures screens against the current `openapi.yaml`
- [ ] Export ZIP, bring into the `ssmp-android` repo
- [ ] Wire the real Retrofit client (ideally generated from `openapi.yaml`), Room offline queue, Hilt DI — don't rely on AI Studio's agent for this part

**5. Match-control console** (inside Admin Portal, used by Officials + Competition Admin) — once the match-lifecycle backend work above is done

---

## Stage 3 — Phase 2 feature layer

Only start this once Phase 1 has round-tripped through all 4 codebases at least once.

- [ ] Discipline engine (auto-suspension on card thresholds)
- [ ] Injury tracking module
- [ ] Transfer request workflow
- [ ] Audit trail
- [ ] Role-specific dashboards
- [ ] Walkover / postponement handling
- [ ] Notification center (push + email)

---

## Stage 4 — Phase 3 polish

- [ ] Media gallery, match reports, highlights, news (Media Officer tools)
- [ ] Public Site: favorites, calendar export, live commentary
- [ ] Analytics dashboards
- [ ] Revisit the 4 adopted defaults in the PRD (Officials' interface, CSV import format, suspension thresholds, walkover scores) against real usage — change them if reality disagrees
- [ ] Multi-organization support, only if actually needed beyond one league
