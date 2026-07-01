-- Seed data for E2E testing

-- Users (password for all: 'password123', bcrypt hash)
-- Hash generated with: bcryptjs.hashSync('password123', 10)
INSERT INTO users (id, email, password_hash, first_name, last_name, role) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'admin@ssmp.local',    '$2b$10$6cBRUiXCXyvseH1MpUOIfOC6itp7ofa4JPrCojTOfLf4y2CMef5Z.', 'System', 'Admin',    'system_admin'),
  ('a0000000-0000-0000-0000-000000000002', 'comp@ssmp.local',      '$2b$10$6cBRUiXCXyvseH1MpUOIfOC6itp7ofa4JPrCojTOfLf4y2CMef5Z.', 'Comp',   'Admin',    'comp_admin'),
  ('a0000000-0000-0000-0000-000000000003', 'registrar@ssmp.local', '$2b$10$6cBRUiXCXyvseH1MpUOIfOC6itp7ofa4JPrCojTOfLf4y2CMef5Z.', 'Jane',   'Registrar','registrar'),
  ('a0000000-0000-0000-0000-000000000004', 'refcoord@ssmp.local',  '$2b$10$6cBRUiXCXyvseH1MpUOIfOC6itp7ofa4JPrCojTOfLf4y2CMef5Z.', 'Mike',   'Coords',   'ref_coordinator'),
  ('a0000000-0000-0000-0000-000000000005', 'media@ssmp.local',     '$2b$10$6cBRUiXCXyvseH1MpUOIfOC6itp7ofa4JPrCojTOfLf4y2CMef5Z.', 'Lisa',   'Media',    'media_officer'),
  ('a0000000-0000-0000-0000-000000000006', 'official@ssmp.local',  '$2b$10$6cBRUiXCXyvseH1MpUOIfOC6itp7ofa4JPrCojTOfLf4y2CMef5Z.', 'Ref',    'Official', 'official'),
  ('a0000000-0000-0000-0000-000000000007', 'coach1@ssmp.local',    '$2b$10$6cBRUiXCXyvseH1MpUOIfOC6itp7ofa4JPrCojTOfLf4y2CMef5Z.', 'Coach',  'One',      'coach'),
  ('a0000000-0000-0000-0000-000000000008', 'coach2@ssmp.local',    '$2b$10$6cBRUiXCXyvseH1MpUOIfOC6itp7ofa4JPrCojTOfLf4y2CMef5Z.', 'Coach',  'Two',      'coach')
ON CONFLICT (id) DO NOTHING;

-- Organization
INSERT INTO organizations (id, name, description) VALUES
  ('11111111-1111-1111-1111-111111111111', 'District Sports Authority', 'Main school sports organization')
ON CONFLICT (id) DO NOTHING;

-- Season
INSERT INTO seasons (id, organization_id, name, start_date, end_date) VALUES
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Spring 2026', '2026-01-01', '2026-12-31')
ON CONFLICT (id) DO NOTHING;

-- Competition
INSERT INTO competitions (id, season_id, name, sport, division, status, rules) VALUES
  ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'U17 Football League', 'football', 'Division A', 'in_progress',
   '{"pointsForWin":3,"pointsForDraw":1,"pointsForLoss":0,"matchDurationMinutes":90,"halfTimeDurationMinutes":15,"allowedSubstitutions":5}')
ON CONFLICT (id) DO NOTHING;

-- Pitches
INSERT INTO pitches (id, organization_id, name, surface_type) VALUES
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Main Stadium', 'grass'),
  ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Training Ground', 'artificial')
ON CONFLICT (id) DO NOTHING;

-- Teams
INSERT INTO teams (id, competition_id, name, school_name, registration_status, roster_approval_status, coach_id) VALUES
  ('66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', 'Lions', 'Central High', 'approved', 'approved', 'a0000000-0000-0000-0000-000000000007'),
  ('77777777-7777-7777-7777-777777777777', '33333333-3333-3333-3333-333333333333', 'Eagles', 'North Academy', 'approved', 'approved', 'a0000000-0000-0000-0000-000000000007'),
  ('88888888-8888-8888-8888-888888888888', '33333333-3333-3333-3333-333333333333', 'Tigers', 'South School', 'approved', 'approved', 'a0000000-0000-0000-0000-000000000008'),
  ('99999999-9999-9999-9999-999999999999', '33333333-3333-3333-3333-333333333333', 'Wolves', 'East College', 'approved', 'approved', 'a0000000-0000-0000-0000-000000000008')
ON CONFLICT (id) DO NOTHING;

-- Officials
INSERT INTO officials (id, name, email, phone, certifications) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'John Referee', 'john@referee.org', '+1-555-0101', '["FIFA Badge","District Chief"]'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Sarah Umpire', 'sarah@referee.org', '+1-555-0102', '["District Referee"]')
ON CONFLICT (id) DO NOTHING;

-- Fixtures (round-robin: 4 teams = 6 matches)
INSERT INTO fixtures (id, competition_id, matchday, home_team_id, away_team_id, scheduled_at, pitch_id, status) VALUES
  ('f1111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 1, '66666666-6666-6666-6666-666666666666', '77777777-7777-7777-7777-777777777777', '2026-03-01T14:00:00Z', '44444444-4444-4444-4444-444444444444', 'scheduled'),
  ('f2222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 1, '88888888-8888-8888-8888-888888888888', '99999999-9999-9999-9999-999999999999', '2026-03-01T16:00:00Z', '55555555-5555-5555-5555-555555555555', 'scheduled'),
  ('f3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 2, '66666666-6666-6666-6666-666666666666', '88888888-8888-8888-8888-888888888888', '2026-03-08T14:00:00Z', '44444444-4444-4444-4444-444444444444', 'scheduled'),
  ('f4444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 2, '77777777-7777-7777-7777-777777777777', '99999999-9999-9999-9999-999999999999', '2026-03-08T16:00:00Z', '55555555-5555-5555-5555-555555555555', 'scheduled'),
  ('f5555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 3, '66666666-6666-6666-6666-666666666666', '99999999-9999-9999-9999-999999999999', '2026-03-15T14:00:00Z', '44444444-4444-4444-4444-444444444444', 'scheduled'),
  ('f6666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', 3, '77777777-7777-7777-7777-777777777777', '88888888-8888-8888-8888-888888888888', '2026-03-15T16:00:00Z', '55555555-5555-5555-5555-555555555555', 'scheduled')
ON CONFLICT (id) DO NOTHING;

-- Players
INSERT INTO players (id, team_id, first_name, last_name, jersey_number, position, date_of_birth, status) VALUES
  ('a1111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'Alex', 'Morgan', 10, 'midfielder', '2009-05-01', 'active'),
  ('a2222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 'Sam', 'Kerr', 9, 'forward', '2009-07-15', 'active'),
  ('a3333333-3333-3333-3333-333333333333', '77777777-7777-7777-7777-777777777777', 'Jordan', 'Pulisic', 7, 'forward', '2009-03-20', 'active'),
  ('a4444444-4444-4444-4444-444444444444', '77777777-7777-7777-7777-777777777777', 'Casey', 'Barton', 4, 'defender', '2009-11-10', 'active'),
  ('a5555555-5555-5555-5555-555555555555', '88888888-8888-8888-8888-888888888888', 'Riley', 'Smith', 11, 'midfielder', '2009-08-25', 'active'),
  ('a6666666-6666-6666-6666-666666666666', '99999999-9999-9999-9999-999999999999', 'Taylor', 'Adams', 1, 'goalkeeper', '2009-01-30', 'active')
ON CONFLICT (id) DO NOTHING;

-- Matches
INSERT INTO matches (id, fixture_id, competition_id, home_team_id, away_team_id, scheduled_at, pitch_id, official_id, status) VALUES
  ('b1111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', '77777777-7777-7777-7777-777777777777', '2026-03-01T14:00:00Z', '44444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'scheduled'),
  ('b2222222-2222-2222-2222-222222222222', 'f2222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '88888888-8888-8888-8888-888888888888', '99999999-9999-9999-9999-999999999999', '2026-03-01T16:00:00Z', '55555555-5555-5555-5555-555555555555', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'scheduled')
ON CONFLICT (id) DO NOTHING;
