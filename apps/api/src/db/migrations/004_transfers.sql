-- Transfer Requests

CREATE TABLE IF NOT EXISTS transfer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id),
  from_team_id UUID NOT NULL REFERENCES teams(id),
  to_team_id UUID NOT NULL REFERENCES teams(id),
  competition_id UUID NOT NULL REFERENCES competitions(id),
  reason TEXT NOT NULL CHECK (length(reason) >= 1 AND length(reason) <= 500),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_by UUID NOT NULL,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (from_team_id != to_team_id)
);

CREATE INDEX IF NOT EXISTS idx_transfer_requests_player ON transfer_requests(player_id);
CREATE INDEX IF NOT EXISTS idx_transfer_requests_status ON transfer_requests(status);
CREATE INDEX IF NOT EXISTS idx_transfer_requests_competition ON transfer_requests(competition_id);
CREATE INDEX IF NOT EXISTS idx_transfer_requests_from_team ON transfer_requests(from_team_id);
CREATE INDEX IF NOT EXISTS idx_transfer_requests_to_team ON transfer_requests(to_team_id);
