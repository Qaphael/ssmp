-- Partial unique index: enforces jersey number uniqueness per team,
-- but allows NULL jersey numbers (multiple players without a number).
CREATE UNIQUE INDEX idx_players_team_jersey_unique
  ON players (team_id, jersey_number)
  WHERE jersey_number IS NOT NULL;
