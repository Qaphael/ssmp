-- Lineups: one row per player in a match lineup
CREATE TABLE IF NOT EXISTS lineups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id),
  player_id UUID NOT NULL REFERENCES players(id),
  is_starting BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (match_id, player_id)
);

CREATE INDEX idx_lineups_match_id ON lineups(match_id);
CREATE INDEX idx_lineups_team_id ON lineups(team_id);
