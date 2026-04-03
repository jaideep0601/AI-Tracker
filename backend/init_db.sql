-- Initialize ThinkStream Database
-- This script creates the initial schema and seed data

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- If the schema does not exist yet (pre-initialization), create required tables here
-- so that the seed data insertion works on fresh Docker container startup.

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

CREATE TABLE IF NOT EXISTS bookmarks (
    id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT now(),
    UNIQUE (article_id)
);

-- Insert sample sources
INSERT INTO sources (name, type, url, rating, active, created_at, updated_at) VALUES
('OpenAI Blog', 'blog', 'https://openai.com/blog', 5, true, NOW(), NOW()),
('DeepMind Blog', 'blog', 'https://deepmind.com/blog', 5, true, NOW(), NOW()),
('Anthropic', 'blog', 'https://www.anthropic.com/news', 5, true, NOW(), NOW()),
('arXiv CS', 'arxiv', 'https://arxiv.org/list/cs/recent', 5, true, NOW(), NOW()),
('Papers with Code', 'rss', 'https://paperswithcode.com', 5, true, NOW(), NOW()),
('GitHub Trending', 'github', 'https://github.com/trending', 4, true, NOW(), NOW()),
('@karpathy', 'twitter', 'https://twitter.com/karpathy', 5, true, NOW(), NOW()),
('@ylecun', 'twitter', 'https://twitter.com/ylecun', 5, true, NOW(), NOW()),
('r/MachineLearning', 'reddit', 'https://reddit.com/r/MachineLearning', 4, true, NOW(), NOW()),
('Hugging Face Blog', 'blog', 'https://huggingface.co/blog', 4, true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- Insert sample articles (for local testing)
-- ============================================================================

INSERT INTO articles (source_id, external_id, title, content, url, url_hash, category, author, published_at, fetched_at, created_at, updated_at) 
SELECT 
    s.id,
    'sample-1',
    'Understanding Transformer Architectures',
    'This article explores the fundamentals of transformer architectures and their applications in modern AI systems...',
    'https://example.com/article-1',
    '123abc',
    'research',
    'OpenAI Team',
    NOW() - INTERVAL '2 days',
    NOW(),
    NOW(),
    NOW()
FROM sources s WHERE s.name = 'OpenAI Blog'
ON CONFLICT DO NOTHING;

INSERT INTO articles (source_id, external_id, title, content, url, url_hash, category, author, published_at, fetched_at, created_at, updated_at) 
SELECT 
    s.id,
    'sample-2',
    'AlphaFold 2 Breakthrough',
    'DeepMind announces major improvements to AlphaFold protein structure prediction...',
    'https://example.com/article-2',
    '456def',
    'research',
    'DeepMind Team',
    NOW() - INTERVAL '1 day',
    NOW(),
    NOW(),
    NOW()
FROM sources s WHERE s.name = 'DeepMind Blog'
ON CONFLICT DO NOTHING;

INSERT INTO articles (source_id, external_id, title, content, url, url_hash, category, author, published_at, fetched_at, created_at, updated_at) 
SELECT 
    s.id,
    'sample-3',
    'Claude 2.0 Released',
    'Anthropic releases Claude 2.0 with improved capabilities...',
    'https://example.com/article-3',
    '789ghi',
    'models',
    'Anthropic Team',
    NOW(),
    NOW(),
    NOW(),
    NOW()
FROM sources s WHERE s.name = 'Anthropic'
ON CONFLICT DO NOTHING;

INSERT INTO articles (source_id, external_id, title, content, url, url_hash, category, author, published_at, fetched_at, created_at, updated_at) 
SELECT 
    s.id,
    'sample-4',
    'Neural Network Pruning Techniques',
    'A comprehensive review of modern neural network pruning approaches...',
    'https://example.com/article-4',
    '101jkl',
    'development',
    'Research Team',
    NOW() - INTERVAL '3 days',
    NOW(),
    NOW(),
    NOW()
FROM sources s WHERE s.name = 'arXiv CS'
ON CONFLICT DO NOTHING;

-- Add some sample feedback
INSERT INTO user_feedback (article_id, feedback, feedback_reason, created_at, updated_at)
SELECT a.id, 1, 'relevant', NOW(), NOW()
FROM articles a WHERE a.title = 'Understanding Transformer Architectures'
ON CONFLICT DO NOTHING;

INSERT INTO user_feedback (article_id, feedback, feedback_reason, created_at, updated_at)
SELECT a.id, 1, 'relevant', NOW(), NOW()
FROM articles a WHERE a.title = 'Claude 2.0 Released'
ON CONFLICT DO NOTHING;
