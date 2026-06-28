-- SSMP Database Schema
-- Teams and Players modules

-- Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url VARCHAR(500),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seasons
CREATE TABLE IF NOT EXISTS seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (end_date > start_date)
);

-- Competitions
CREATE TABLE IF NOT EXISTS competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES seasons(id),
  name VARCHAR(255) NOT NULL,
  sport VARCHAR(50) NOT NULL,
  division VARCHAR(100),
  status VARCHAR(50) DEFAULT 'draft',
  rules JSONB DEFAULT '{}',
  registration_window JSONB,
  enable_groups BOOLEAN DEFAULT FALSE,
  enable_knockouts BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Groups (optional, for group-stage pools)
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES competitions(id),
  name VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES competitions(id),
  group_id UUID REFERENCES groups(id),
  name VARCHAR(255) NOT NULL,
  school_name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url VARCHAR(500),
  primary_color VARCHAR(7),
  secondary_color VARCHAR(7),
  registration_status VARCHAR(50) DEFAULT 'pending',
  roster_approval_status VARCHAR(50) DEFAULT 'draft',
  coach_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  jersey_number INTEGER CHECK (jersey_number >= 0 AND jersey_number <= 99),
  position VARCHAR(50),
  date_of_birth DATE NOT NULL,
  nationality VARCHAR(100),
  height DECIMAL(5,2),
  weight DECIMAL(5,2),
  photo_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'active',
  injury_details JSONB,
  suspension_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_teams_competition ON teams(competition_id);
CREATE INDEX IF NOT EXISTS idx_teams_coach ON teams(coach_id);
CREATE INDEX IF NOT EXISTS idx_teams_registration_status ON teams(registration_status);
CREATE INDEX IF NOT EXISTS idx_players_team ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_players_status ON players(status);
CREATE INDEX IF NOT EXISTS idx_seasons_organization ON seasons(organization_id);
CREATE INDEX IF NOT EXISTS idx_competitions_season ON competitions(season_id);
