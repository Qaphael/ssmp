-- News Articles

CREATE TABLE IF NOT EXISTS news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  excerpt VARCHAR(500),
  author_id UUID NOT NULL REFERENCES users(id),
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  competition_id UUID REFERENCES competitions(id),
  team_id UUID REFERENCES teams(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_competition ON news_articles(competition_id);
CREATE INDEX IF NOT EXISTS idx_news_team ON news_articles(team_id);
CREATE INDEX IF NOT EXISTS idx_news_published ON news_articles(is_published);
