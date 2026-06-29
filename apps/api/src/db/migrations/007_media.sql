-- Media Gallery

CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by UUID NOT NULL REFERENCES users(id),
  type VARCHAR(20) NOT NULL CHECK (type IN ('logo', 'photo', 'video', 'document')),
  url TEXT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  file_size INTEGER DEFAULT 0,
  mime_type VARCHAR(100) DEFAULT '',
  caption TEXT,
  competition_id UUID REFERENCES competitions(id),
  match_id UUID REFERENCES matches(id),
  team_id UUID REFERENCES teams(id),
  player_id UUID REFERENCES players(id),
  is_approved BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_competition ON media(competition_id);
CREATE INDEX IF NOT EXISTS idx_media_match ON media(match_id);
CREATE INDEX IF NOT EXISTS idx_media_team ON media(team_id);
CREATE INDEX IF NOT EXISTS idx_media_type ON media(type);
CREATE INDEX IF NOT EXISTS idx_media_approved ON media(is_approved);
