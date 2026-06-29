-- Fixtures, Matches, Match Events, Officials, Standings

-- Officials
CREATE TABLE IF NOT EXISTS officials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  certifications JSONB DEFAULT '[]',
  availability JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pitches
CREATE TABLE IF NOT EXISTS pitches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  capacity INTEGER,
  surface_type VARCHAR(50),
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fixtures
CREATE TABLE IF NOT EXISTS fixtures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES competitions(id),
  matchday INTEGER NOT NULL CHECK (matchday >= 1),
  home_team_id UUID NOT NULL REFERENCES teams(id),
  away_team_id UUID NOT NULL REFERENCES teams(id),
  scheduled_at TIMESTAMPTZ,
  pitch_id UUID REFERENCES pitches(id),
  status VARCHAR(50) DEFAULT 'scheduled',
  home_score INTEGER CHECK (home_score >= 0),
  away_score INTEGER CHECK (away_score >= 0),
  official_id UUID REFERENCES officials(id),
  postponed_reason TEXT,
  walkover_team_id UUID REFERENCES teams(id),
  walkover_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (home_team_id != away_team_id)
);

-- Matches
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id UUID REFERENCES fixtures(id),
  competition_id UUID NOT NULL REFERENCES competitions(id),
  home_team_id UUID NOT NULL REFERENCES teams(id),
  away_team_id UUID NOT NULL REFERENCES teams(id),
  home_score INTEGER DEFAULT 0 CHECK (home_score >= 0),
  away_score INTEGER DEFAULT 0 CHECK (away_score >= 0),
  status VARCHAR(50) DEFAULT 'scheduled',
  pitch_id UUID REFERENCES pitches(id),
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  half_time_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  extra_time_enabled BOOLEAN DEFAULT FALSE,
  penalties_enabled BOOLEAN DEFAULT FALSE,
  home_penalties INTEGER,
  away_penalties INTEGER,
  official_id UUID REFERENCES officials(id),
  report_submitted_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES users(id),
  published_at TIMESTAMPTZ,
  walkover_team_id UUID REFERENCES teams(id),
  walkover_reason TEXT,
  postponed_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (home_team_id != away_team_id)
);

-- Match Events
CREATE TABLE IF NOT EXISTS match_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id),
  type VARCHAR(50) NOT NULL,
  minute INTEGER NOT NULL CHECK (minute >= 0 AND minute <= 120),
  player_id UUID REFERENCES players(id),
  team_id UUID REFERENCES teams(id),
  description TEXT,
  recorded_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Standings
CREATE TABLE IF NOT EXISTS standings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES competitions(id),
  team_id UUID NOT NULL REFERENCES teams(id),
  group_id UUID REFERENCES groups(id),
  played INTEGER DEFAULT 0 CHECK (played >= 0),
  won INTEGER DEFAULT 0 CHECK (won >= 0),
  drawn INTEGER DEFAULT 0 CHECK (drawn >= 0),
  lost INTEGER DEFAULT 0 CHECK (lost >= 0),
  goals_for INTEGER DEFAULT 0 CHECK (goals_for >= 0),
  goals_against INTEGER DEFAULT 0 CHECK (goals_against >= 0),
  goal_difference INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0 CHECK (points >= 0),
  position INTEGER CHECK (position >= 1),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (competition_id, team_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_fixtures_competition ON fixtures(competition_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_matchday ON fixtures(matchday);
CREATE INDEX IF NOT EXISTS idx_fixtures_status ON fixtures(status);
CREATE INDEX IF NOT EXISTS idx_matches_competition ON matches(competition_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_scheduled ON matches(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_match_events_match ON match_events(match_id);
CREATE INDEX IF NOT EXISTS idx_standings_competition ON standings(competition_id);
CREATE INDEX IF NOT EXISTS idx_standings_team ON standings(team_id);
