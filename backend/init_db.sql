-- Initialize ThinkStream Database
-- This script creates the initial schema and seed source data.

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- If the schema does not exist yet, create required tables here
-- so source seeding works on fresh Docker container startup.

CREATE TABLE IF NOT EXISTS sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL,
    url VARCHAR(2048) NOT NULL,
    description TEXT,
    rating INTEGER DEFAULT 3,
    active BOOLEAN DEFAULT true,
    last_fetched_at TIMESTAMP NULL,
    fetch_error_count INTEGER DEFAULT 0,
    environment_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    source_id INTEGER NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    external_id VARCHAR(255),
    title VARCHAR(1024) NOT NULL,
    content TEXT,
    url VARCHAR(2048),
    url_hash VARCHAR(64),
    category VARCHAR(100),
    author VARCHAR(255),
    published_at TIMESTAMP,
    fetched_at TIMESTAMP DEFAULT now(),
    language VARCHAR(10) DEFAULT 'en',
    article_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_feedback (
    id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    feedback INTEGER NOT NULL,
    feedback_reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    UNIQUE (article_id)
);

-- Remove old demo/sample articles if this script is run manually on an existing DB.
DELETE FROM articles
WHERE url LIKE 'https://example.com/%'
   OR external_id LIKE 'sample-%';

-- Seed real sources that the current ingestion code can fetch.
-- Supported types:
-- rss/blog: RSS or Atom feed discovery
-- arxiv: arXiv public API
-- github: GitHub repository releases Atom feed
-- reddit: public subreddit JSON feed

INSERT INTO sources (name, type, url, rating, active, created_at, updated_at) VALUES
('OpenAI News', 'rss', 'https://openai.com/news/rss.xml', 5, true, NOW(), NOW()),
('Google DeepMind Blog', 'blog', 'https://deepmind.google/blog', 5, true, NOW(), NOW()),
('Anthropic News', 'blog', 'https://www.anthropic.com/news', 5, true, NOW(), NOW()),
('arXiv AI', 'arxiv', 'https://arxiv.org/list/cs.AI/recent', 5, true, NOW(), NOW()),
('arXiv Machine Learning', 'arxiv', 'https://arxiv.org/list/cs.LG/recent', 5, true, NOW(), NOW()),
('Papers with Code', 'rss', 'https://paperswithcode.com/rss', 5, true, NOW(), NOW()),
('Hugging Face Blog', 'rss', 'https://huggingface.co/blog/feed.xml', 5, true, NOW(), NOW()),
('Transformers Releases', 'github', 'https://github.com/huggingface/transformers', 5, true, NOW(), NOW()),
('LangChain Releases', 'github', 'https://github.com/langchain-ai/langchain', 4, true, NOW(), NOW()),
('r/MachineLearning', 'reddit', 'https://reddit.com/r/MachineLearning', 4, true, NOW(), NOW()),
('r/LocalLLaMA', 'reddit', 'https://reddit.com/r/LocalLLaMA', 4, true, NOW(), NOW())
ON CONFLICT (name) DO UPDATE SET
    type = EXCLUDED.type,
    url = EXCLUDED.url,
    rating = EXCLUDED.rating,
    active = EXCLUDED.active,
    updated_at = NOW();

-- Keep previously unsupported/bad seed sources disabled if they already exist.
UPDATE sources
SET active = false,
    updated_at = NOW()
WHERE name IN (
    'OpenAI Blog',
    'DeepMind Blog',
    'Anthropic',
    'GitHub Trending',
    '@karpathy',
    '@ylecun',
    'arXiv CS'
);