-- Cards and Suspensions (Discipline Engine)

-- Cards
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id),
  player_id UUID NOT NULL REFERENCES players(id),
  team_id UUID NOT NULL REFERENCES teams(id),
  type VARCHAR(10) NOT NULL CHECK (type IN ('yellow', 'red')),
  minute INTEGER NOT NULL CHECK (minute >= 0 AND minute <= 120),
  reason TEXT,
  competition_id UUID NOT NULL REFERENCES competitions(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suspensions
CREATE TABLE IF NOT EXISTS suspensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id),
  competition_id UUID NOT NULL REFERENCES competitions(id),
  reason TEXT NOT NULL,
  matches_count INTEGER NOT NULL CHECK (matches_count >= 1),
  matches_served INTEGER NOT NULL DEFAULT 0 CHECK (matches_served >= 0),
  card_id UUID REFERENCES cards(id),
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  is_served BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for discipline queries
CREATE INDEX IF NOT EXISTS idx_cards_player_competition ON cards(player_id, competition_id);
CREATE INDEX IF NOT EXISTS idx_cards_match ON cards(match_id);
CREATE INDEX IF NOT EXISTS idx_cards_type ON cards(type);
CREATE INDEX IF NOT EXISTS idx_suspensions_player_competition ON suspensions(player_id, competition_id);
CREATE INDEX IF NOT EXISTS idx_suspensions_active ON suspensions(is_served) WHERE is_served = FALSE;
