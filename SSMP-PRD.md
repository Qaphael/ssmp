# School Sports Competition Management Platform (SSMP)
## Product Requirements Document (PRD)

**Status:** Draft v1.0
**Date:** June 2026
**Owner:** Qaphael Design / Opiyo Ocaya
**Supersedes:** SFL PRO (School Football League Management System) — single-sport, single-app v1

---

## 1. Vision

SSMP is a multi-sport competition management platform that takes a school sports league through its full lifecycle — from organization setup and team registration, through fixtures and live match control, to standings, knockouts, and season archival.

It is built once as a backend API and consumed by **three separate applications**, each designed for the way its users actually work:

| App | Who it's for | Form factor |
|---|---|---|
| **Admin Web Portal** | System Admin, Competition Admin, Registrar, Referee Coordinator, Media Officer | Desktop-first web app |
| **Team App** | Coach (primary), Assistant Coach (future) | Android app |
| **Public Site** | Parents, students, spectators, the general public | Public website, no login |

This document replaces the old "School League Management System" framing. The product is now a **competition management platform** — football is just the first sport it runs.

---

## 2. Why the Rebuild

The original system (SFL PRO) is functionally strong — RBAC, real-time scoring via Socket.IO, multi-sport data model, PostgreSQL backend, Zod-validated APIs, decent test coverage. That backend foundation does **not** need to be thrown away.

What it's missing is **workflow**, not features:

- Admin does everything — no separation of duties
- Teams are typed in by Admin instead of self-registering
- No approval gates anywhere (rosters, transfers, logos go live instantly)
- No registration windows (players could theoretically be added during the final)
- Match lifecycle is `start → goal → end`, with no verification step before standings update
- Cards don't trigger automatic suspensions
- No notifications, no audit trail, no dashboards
- Everything revolves around **Teams**; it should revolve around **Competitions**

This PRD describes the platform *with those gaps closed*, and with **Captain renamed to Coach** throughout, since the role was always team-management, not on-pitch captaincy.

---

## 3. Goals

1. Support running multiple sports, multiple competitions, and multiple seasons concurrently without data ever being deleted.
2. Move from "Admin does everything" to role-separated, approval-gated workflows.
3. Make match lifecycle and standings trustworthy (verified before publish, not just whoever clicked "End Match").
4. Automate the things humans forget — suspensions, suspension-serving, walkovers, notifications.
5. Ship three independent client apps against one stable, versioned API.
6. Keep the system school-appropriate, not over-engineered — every "professional league" feature below is optional/toggleable per competition, not mandatory.

**Out of scope for now:** payments/fees, multi-organization tenancy (one organization for v1, designed so it *could* extend later), SMS notifications (push + email only for v1).

---

## 4. Entity Hierarchy

This is the single biggest structural change. Everything nests under **Competition**, not Team.

```
Organization
   └── Season                  (e.g. "2027 Season")
         └── Competition       (e.g. "Football Boys U-18")
               └── Sport       (football, basketball, volleyball, athletics, swimming...)
                     └── Division        (optional — e.g. Senior / Junior)
                           └── Group      (group-stage pools)
                                 └── Team
                                       └── Player
                                 └── Match
```

One season can contain many competitions running side by side:

```
2027 Season
 ├── Football Boys
 ├── Football Girls
 ├── Basketball Boys
 ├── Basketball Girls
 ├── Volleyball
 └── Athletics
```

Each competition has its own groups, fixtures, officials, rules, and standings — fully isolated from the others, even though they share the same season and many of the same teams.

Seasons are **never deleted**, only archived. Historical data is permanent.

---

## 5. Roles

| Role | Primary App | Core Focus |
|---|---|---|
| System Administrator | Admin Web Portal | Users, system settings, permissions |
| Competition Administrator | Admin Web Portal | Competitions, fixtures, officials, standings, verification |
| Registrar | Admin Web Portal | School/team approval, roster approval, registration windows |
| Referee Coordinator | Admin Web Portal | Official assignment, availability, match reports |
| Media Officer | Admin Web Portal | Logos, galleries, match reports, highlights, news |
| Official | Admin Web Portal (mobile-responsive match-control view) | Running assigned matches, recording events, submitting reports |
| Coach *(formerly "Captain")* | Team App (Android) | Team profile, roster, lineups, suspensions, notifications |
| Public | Public Website | Read-only viewing |

> **Note on Officials:** the original draft put Coach/Captain on the Android app but never assigned Officials anywhere. Officials need a real-time, low-friction interface on match day — typically pitch-side on a phone. Recommendation: give them a mobile-responsive match-control screen inside the Admin Web Portal rather than a fourth native app, and revisit a dedicated Official app only if usage data shows the web view isn't fast/reliable enough on poor connections.

### 5.1 Role responsibilities (exhaustive)

**System Administrator**
- Manage user accounts and role assignments across the platform
- Configure global system settings (sports list, notification templates, file-storage limits)
- View system-wide audit logs
- No competition-day involvement

**Competition Administrator**
- Create and configure competitions via the Competition Wizard (sport, season, dates, points system, rules)
- Generate groups and fixtures; review and resolve scheduling conflicts
- Assign pitches/venues and time slots
- Verify submitted match reports before standings update
- Trigger knockout bracket generation
- Manage competition-level dashboard and analytics
- Archive seasons / open new ones

**Registrar**
- Review and approve/reject school (team) registration applications
- Open and close registration windows per competition
- Review and approve/reject coach-submitted player rosters
- Review and approve/reject transfer requests
- Manage eligibility documents (birth certificates, consent forms, medical forms)

**Referee Coordinator**
- Maintain the pool of officials and their availability
- Assign officials to fixtures; manage swaps and conflicts
- Track official attendance (present / absent / late) per match
- Review match reports for completeness before forwarding to Competition Admin for verification

**Media Officer**
- Upload/manage team logos pending approval
- Upload match photos, videos, highlights, MVP selections, written match reports
- Manage public-facing news and announcements

**Official**
- View only matches they are assigned to (server-enforced)
- Run live match control: kickoff, score events, cards, substitutions, half/full time
- Submit the post-match report (cannot be edited once submitted — only Competition Admin verification can amend it, logged in the audit trail)
- Receive assignment and schedule-change notifications

**Coach** *(renamed from Captain)*
- Manage team profile: name, description, branding colors
- Upload team logo (goes to Media Officer / Registrar approval queue, not live instantly)
- Manage player roster within the registration window:
  - Add players individually or via bulk CSV import
  - Edit player details, upload player photos
  - Submit roster for Registrar approval
- View suspended/injured players and who's eligible for the next match
- Submit starting lineup before kickoff (locked once submitted or once the window closes)
- Submit/respond to transfer requests
- Record/update player injury status with expected return date and medical notes
- Receive notifications: fixture changes, roster approval status, suspension alerts, kickoff reminders
- View team schedule, results, and statistics

**Public**
- Browse fixtures, live scores, standings, brackets, team and player profiles, statistics, news, media gallery — read-only, no login
- Filter/search by sport, competition, team; favorite a team; export fixtures to calendar; share a fixture

---

## 6. Core Workflows

### 6.1 Competition setup (wizard, not ten separate pages)
```
Create Competition → Select Sport → Select Season → Set Registration Window
   → Set Competition Rules (points, cards, duration, substitutions)
   → Generate Groups? → Generate Fixtures? → Done
```

### 6.2 Team registration & approval
```
School applies → Pending → Registrar reviews → Approved/Rejected
   → Coach account created → Coach completes team profile → Logo submitted for approval
```

### 6.3 Roster registration & approval
```
Coach adds players (manual or CSV bulk import) → Submitted
   → Registrar reviews → Approved → Player eligible
   (Registration window closes → no further roster edits without a transfer request)
```

### 6.4 Fixture generation
```
Generate Fixtures → Conflict Detection (pitch/team clashes)
   → Competition Admin Review → Assign Pitch/Time → Assign Officials → Publish
```

### 6.5 Match lifecycle
Replaces the old `start → goal → end`:
```
Scheduled → Officials Assigned → Lineups Submitted → Lineups Locked
   → Kickoff → Half Time → Second Half → (Extra Time → Penalties, if applicable)
   → Full Time → Official Report Submitted → Competition Admin Verification
   → Published → Standings & Statistics Updated
```
Other statuses available at any point before completion: **Postponed, Cancelled, Abandoned, Walkover**.

### 6.6 Discipline engine (automatic)
```
Yellow Card → Yellow Card (same competition) → Automatic Suspension
   → Cannot be submitted in next lineup → Suspension served → Available again
```
Red cards trigger an immediate one-match suspension by the same mechanism. Thresholds are configurable per competition (set in the Competition Wizard rules step).

### 6.7 Injury tracking
```
Coach marks player Injured → Expected Return Date + Medical Notes
   → (optional) Cleared by date or manual update → History retained on player profile
```

### 6.8 Transfers
```
Coach submits Transfer Request → Registrar reviews → Approved → Player moves teams
```
Players are never deleted and re-created — history follows the player record.

### 6.9 Walkovers & postponements
- A team failing to field a side by kickoff → Competition Admin can record a **Walkover** (configurable default score, e.g. 3–0)
- Weather/venue issues → match marked **Postponed**, triggers notifications to both coaches, officials, and the public fixture list automatically

### 6.10 Notifications (push + email)
Triggered automatically on: fixture published, fixture changed, official assigned, roster approval/rejection, transfer approval, suspension applied, kickoff reminder (e.g. T-60 min), match postponed/cancelled.

### 6.11 Audit trail
Every state-changing action (fixture edit, roster approval, score correction, verification) logs: who, what changed, old value, new value, timestamp, and (where applicable) device/IP. Nothing is ever hard-deleted from competition history.

### 6.12 Dashboards (role-specific landing pages)
- **Competition Admin:** today's matches, live matches, pending approvals, officials available, registration status, competition progress
- **Coach:** next match, roster status, suspended players, notifications, recent results
- **Official:** today's assignments, pending reports, live match

---

## 7. Application Feature Breakdown

### 7.1 Admin Web Portal
Users · Competitions · Seasons · Sports · Divisions/Groups · Registration approvals · Roster approvals · Fixtures & scheduling · Officials & assignments · Pitches/venues · Match verification · Discipline overview · Standings · Knockout brackets · Media uploads · Notification templates · Audit logs · Analytics dashboards · System settings

### 7.2 Team App (Android) — Coach
Dashboard · Team profile & branding · Roster (add/edit/bulk import/photos) · Suspensions & injuries · Lineup submission · Fixtures & results · Transfer requests · Documents (eligibility, medical, consent) · Notifications · Statistics

Offline support is worth prioritizing here: coaches often work pitch-side with poor connectivity — roster edits and lineup submissions should queue locally and sync when back online.

### 7.3 Public Website
Fixtures & live scores · Standings · Groups & knockout brackets · Team & player profiles · Top scorers/cards leaderboard · Statistics · Media gallery & news · Live commentary · Search & filter by sport/competition/team · Favorite team · Calendar export · Share fixture

---

## 8. Non-Functional Requirements

- **Real-time:** match events and standings propagate via Socket.IO in under ~1s to all connected clients in a match room
- **Offline tolerance:** Team App queues writes (roster edits, lineups) when offline and syncs on reconnect; Public Site relies on PWA caching for resilience on poor networks
- **Security:** all RBAC enforced server-side (never trust the client); JWT auth for Admin Portal and Team App; file uploads validated for type/size; audit logging on all write operations
- **Data integrity:** nothing is hard-deleted — seasons, players, and matches are archived, not removed
- **Scalability:** single-organization for v1, but the `Organization` entity exists at the top of the hierarchy so multi-org/multi-league support is a config change later, not a redesign
- **Accessibility:** Public Site should be usable on low-end Android browsers common among parents in the target region

---

## 9. Phased Roadmap

**Phase 0 — Already built (current SFL PRO backend)**
Node.js/Express API, PostgreSQL, Socket.IO real-time scoring, Zod validation, RBAC, multi-sport data model, Swagger-documented API.

**Phase 1 — MVP of the rebuild**
- Restructure data model around Organization → Season → Competition hierarchy
- Rename Captain → Coach across API, DB, and all client surfaces
- Competition Wizard
- Team/school registration + Registrar approval
- Roster submission + approval, with registration window enforcement
- Fixture generation with conflict detection
- Match lifecycle with verification step before standings update
- Basic notifications (push)

**Phase 2**
- Discipline engine automation (card thresholds → auto-suspension)
- Injury tracking module
- Transfer request workflow
- Audit trail
- Role-specific dashboards
- Walkover/postponement handling

**Phase 3**
- Media gallery, match reports, highlights, news
- Public Site advanced features (favorites, calendar export, live commentary)
- Analytics dashboards
- Multi-organization support (if ever needed beyond one league)

---

## 10. Decisions (Defaults Adopted)

These were left open in the first draft. Defaults below are now adopted — revisit only if real usage shows a need to change them.

1. **Officials' interface** — default: the mobile-responsive match-control view inside the Admin Web Portal, scoped to only the matches an Official is assigned to. No separate native app for Officials in v1.
2. **Bulk roster import format** — default CSV template columns: `first_name, last_name, jersey_number, position, date_of_birth, nationality, height, weight`. Photos are not part of the CSV — after bulk import, each player record shows as "photo pending" and the coach uploads photos individually afterward.
3. **Suspension thresholds** — default: configurable per competition, not global. Each sport gets a sensible pre-filled suggestion in the Competition Wizard (e.g. 2 yellow cards = 1-match suspension for football), but the Competition Administrator can override it per competition, since school-level rules vary even within the same sport.
4. **Walkover default score** — default: configurable per competition, pre-filled with a sport-appropriate suggestion (e.g. 3–0 for football) that the Competition Administrator can override at competition-setup time.

---

## 11. Related Documents (not yet written, can follow this PRD)

This PRD is the master reference. The earlier discussion proposed seven supporting documents that go *deeper* than this PRD covers — useful if/when you want to formalize further:

- Business Workflow Document (full state diagrams per workflow)
- System Architecture Document (deployment, auth, storage, integrations)
- Role & Permission Matrix (granular, action-by-action)
- Database Design Document (ER diagram, constraints, indexing)
- API Specification & Standards (versioning, error format, WebSocket events)
- UI/UX Design System (component library, branding, accessibility)
- Development Roadmap (detailed milestones, testing, deployment plan)

Happy to produce any of these next — just say which one.
