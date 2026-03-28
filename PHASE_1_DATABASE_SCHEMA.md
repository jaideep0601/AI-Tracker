# ThinkStream - PostgreSQL Database Schema

**Project**: ThinkStream - Centralized AI Tracker  
**Phase**: 1 Planning - Database Architecture  
**Database**: PostgreSQL 15+  
**ORM**: SQLAlchemy 2.x  
**Hosting**: AWS RDS (Multi-AZ, automated backups)

---

## ENTITY-RELATIONSHIP DIAGRAM (ERD)

```
┌─────────────────┐
│    sources      │
├─────────────────┤
│ id (PK)         │
│ name            │
│ type            │ ──────┐
│ url             │       │
│ rating          │       │
│ active          │       │
│ created_at      │       │
│ updated_at      │       │
└─────────────────┘       │
        │                 │
        │ 1:M             │
        ├─────────────────────────┐
        │                         │
        ▼                         ▼
┌─────────────────┐   ┌──────────────────┐
│    articles     │   │ source_ratings   │
├─────────────────┤   ├──────────────────┤
│ id (PK)         │   │ id (PK)          │
│ source_id (FK)  │   │ source_id (FK)   │
│ external_id     │   │ rating           │
│ title           │   │ notes            │
│ content         │   │ created_at       │
│ url             │   │ updated_at       │
│ category        │   └──────────────────┘
│ published_at    │
│ fetched_at      │
│ created_at      │
└─────────────────┘
        │
        │ 1:M
        │
        ▼
┌──────────────────┐
│ user_feedback    │
├──────────────────┤
│ id (PK)          │
│ article_id (FK)  │
│ feedback         │ (1=thumbs_up, -1=thumbs_down)
│ created_at       │
└──────────────────┘

┌─────────────────────┐
│ user_preferences    │
├─────────────────────┤
│ id (PK)             │
│ category            │
│ source_id           │
│ preference_weight   │
│ created_at          │
│ updated_at          │
└─────────────────────┘

┌────────────────────────┐
│ article_categories     │ (Many-to-many)
├────────────────────────┤
│ article_id (FK)        │
│ category               │
│ PRIMARY KEY (article_id, category)
└────────────────────────┘
```

---

## DETAILED TABLE SCHEMAS

### 1. `sources` Table
**Purpose**: Track all data sources (LinkedIn profiles, X accounts, GitHub repos, etc.)

```sql
CREATE TABLE sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL,
        -- Enum: 'linkedin', 'twitter', 'github', 'arxiv', 'rss', 'reddit'
    url VARCHAR(2048) NOT NULL,
    description TEXT,
    rating INTEGER DEFAULT 3 CHECK (rating >= 1 AND rating <= 5),
    active BOOLEAN DEFAULT true,
    last_fetched_at TIMESTAMP,
    fetch_error_count INTEGER DEFAULT 0,
    environment_metadata JSONB,
        -- Stores: api_endpoint, auth_type, rate_limit, headers, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_type CHECK (type IN ('linkedin', 'twitter', 'github', 'arxiv', 'rss', 'reddit', 'blog'))
);

CREATE INDEX idx_sources_active ON sources(active);
CREATE INDEX idx_sources_type ON sources(type);
CREATE INDEX idx_sources_rating ON sources(rating);
CREATE INDEX idx_sources_last_fetched ON sources(last_fetched_at);
```

**Data Types**:
- `id`: Auto-incrementing primary key
- `name`: Unique source name (e.g., "@karpathy", "facebook/pytorch")
- `type`: Source type for categorization
- `rating`: 1-5 star quality rating
- `active`: Whether to include in data collection
- `environment_metadata`: JSONB for flexible source-specific config

---

### 2. `articles` Table
**Purpose**: Store individual content items (papers, tweets, repos, blog posts)

```sql
CREATE TABLE articles (
    id BIGSERIAL PRIMARY KEY,
    source_id INTEGER NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    external_id VARCHAR(255),
        -- Original ID from source (tweet_id, paper_id, repo_id, etc.)
    title VARCHAR(1024) NOT NULL,
    content TEXT,
    url VARCHAR(2048),
    url_hash CHAR(64),
        -- SHA256 hash of URL for deduplication
    category VARCHAR(100),
        -- Primary category: 'research', 'development', 'people', 
        -- 'companies', 'social', 'models', 'events'
    author VARCHAR(255),
    published_at TIMESTAMP,
    fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    language VARCHAR(10) DEFAULT 'en',
    metadata JSONB,
        -- Source-specific data: views, likes, engagement, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(source_id, external_id),
    CONSTRAINT valid_category CHECK (category IN (
        'research', 'development', 'people', 'companies', 'social', 'models', 'events'
    ))
);

CREATE INDEX idx_articles_source ON articles(source_id);
CREATE INDEX idx_articles_url_hash ON articles(url_hash);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_published ON articles(published_at DESC);
CREATE INDEX idx_articles_fetched ON articles(fetched_at DESC);
CREATE INDEX idx_articles_created ON articles(created_at DESC);

-- Full-text search index for content
CREATE INDEX idx_articles_title_search ON articles USING GIN(to_tsvector('english', title));
CREATE INDEX idx_articles_content_search ON articles USING GIN(to_tsvector('english', content));
```

**Data Types**:
- `id`: Bigserial for large dataset
- `external_id`: Original ID from source platform
- `url_hash`: SHA256 for deduplication
- `metadata`: JSONB for engagement metrics (likes, retweets, etc.)
- Full-text search indexes for title/content queries

---

### 3. `source_ratings` Table
**Purpose**: Store curated quality ratings for sources

```sql
CREATE TABLE source_ratings (
    id SERIAL PRIMARY KEY,
    source_id INTEGER NOT NULL UNIQUE REFERENCES sources(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    rating_justification TEXT,
    quality_metrics JSONB,
        -- Calculated metrics: avg_engagement, update_frequency, accuracy_score
    last_reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_source_ratings_rating ON source_ratings(rating);
CREATE INDEX idx_source_ratings_reviewed ON source_ratings(last_reviewed_at);
```

**Data Types**:
- `quality_metrics`: Tracks calculated scores for source quality

---

### 4. `user_feedback` Table
**Purpose**: Store thumbs up/down feedback for content personalization

```sql
CREATE TABLE user_feedback (
    id BIGSERIAL PRIMARY KEY,
    article_id BIGINT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    feedback INTEGER NOT NULL,
        -- 1 = thumbs_up, -1 = thumbs_down, 0 = neutral
    feedback_reason VARCHAR(255),
        -- Optional: 'relevant', 'duplicate', 'spam', 'not_interested', etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(article_id),
    CONSTRAINT valid_feedback CHECK (feedback IN (-1, 0, 1))
);

CREATE INDEX idx_user_feedback_article ON user_feedback(article_id);
CREATE INDEX idx_user_feedback_feedback ON user_feedback(feedback);
CREATE INDEX idx_user_feedback_created ON user_feedback(created_at DESC);
```

**Data Types**:
- `feedback`: -1 (thumbs down), 0 (neutral/removed), 1 (thumbs up)
- Unique constraint prevents duplicate feedback per article

---

### 5. `article_categories` Table
**Purpose**: Many-to-many mapping for articles with multiple categories

```sql
CREATE TABLE article_categories (
    article_id BIGINT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    confidence DECIMAL(3,2) DEFAULT 1.0,
        -- 0.0 to 1.0 confidence score
    
    PRIMARY KEY (article_id, category),
    CONSTRAINT valid_category CHECK (category IN (
        'research', 'development', 'people', 'companies', 'social', 'models', 'events'
    ))
);

CREATE INDEX idx_article_categories_category ON article_categories(category);
```

---

### 6. `user_preferences` Table
**Purpose**: Store user's category and source preferences for personalization

```sql
CREATE TABLE user_preferences (
    id SERIAL PRIMARY KEY,
    preference_key VARCHAR(255) NOT NULL UNIQUE,
        -- 'category_research', 'source_openai', 'author_karpathy', etc.
    preference_type VARCHAR(50),
        -- 'category', 'source', 'author', 'topic'
    preference_value VARCHAR(255),
    weight DECIMAL(4,3) DEFAULT 1.0,
        -- Multiplier for ranking (0.0 to 5.0)
    preference_reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_preferences_type ON user_preferences(preference_type);
CREATE INDEX idx_user_preferences_key ON user_preferences(preference_key);
```

---

## INDEXING STRATEGY

### Query Performance Optimization

```
High-Frequency Queries:
1. Get recent articles (last 24 hours)
   - Index: (created_at DESC, category)
   - Expected: <100ms

2. Get articles by category + filter by source
   - Index: (category, source_id, created_at DESC)
   - Expected: <100ms

3. Search articles by title/content
   - Index: GIN full-text search
   - Expected: <200ms

4. Get personalized feed
   - Index: (source_id, category, created_at DESC)
   - Expected: <100ms with Redis cache

5. Deduplication check
   - Index: (url_hash, source_id)
   - Expected: <10ms

Low-Frequency Queries:
1. Analytics queries (joins on user_feedback)
   - Cached in Redis
   - Run hourly batch jobs
```

---

## DATA RETENTION POLICY

### Archive Strategy

```
- Active Data (0-90 days): Live in database, fast queries
- Warm Data (90-365 days): Archived, occasional queries
- Cold Data (>365 days): S3 glacier storage

Automatic Cleanup:
- Delete duplicate articles (keep first occurrence)
- Archive low-engagement content (feedback=-1, low views)
- Purge error logs (>30 days)
```

---

## MIGRATION STRATEGY (Alembic)

### Initial Migration File: `alembic/versions/001_initial_schema.py`

```python
"""Initial schema with sources, articles, feedback tables."""

from alembic import op
import sqlalchemy as sa

def upgrade() -> None:
    # Create sources table
    op.create_table(
        'sources',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(255), nullable=False, unique=True),
        sa.Column('type', sa.String(50), nullable=False),
        sa.Column('url', sa.String(2048), nullable=False),
        sa.Column('rating', sa.Integer(), nullable=False, server_default='3'),
        sa.Column('active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        {other columns...}
    )
    
    # Create articles table
    op.create_table(
        'articles',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column('source_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(1024), nullable=False),
        {other columns...},
        sa.ForeignKeyConstraint(['source_id'], ['sources.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        {constraints...}
    )
    
    # Create indexes
    op.create_index('idx_articles_source', 'articles', ['source_id'])
    # {other indexes...}

def downgrade() -> None:
    op.drop_table('articles')
    op.drop_table('sources')
    # {other operations...}
```

---

## MONITORING & PERFORMANCE

### Key Metrics

```
- Write Operations: <10ms per article insert
- Read Operations: <100ms for feed query
- Cache Hit Ratio: >80% for feed queries
- Database CPU: <40% average
- Storage: ~100MB per 10k articles (before compression)
```

### Backup Strategy

```
- Automated daily snapshots (AWS RDS)
- 30-day retention
- Cross-region replication
- Point-in-time recovery enabled
- Test restores monthly
```

---

## SECURITY CONSIDERATIONS

### Data Protection

```
- SSL/TLS for all connections
- Row-level security for Phase 5+ multi-user
- Secrets management for API keys (AWS Secrets Manager)
- No sensitive data in logs
- Input validation on all fields
```

### SQL Injection Prevention

```
- SQLAlchemy parametrized queries (automatic)
- Pydantic validation on input
- No raw SQL queries used
```

---

## PERFORMANCE BASELINE

### Expected Performance (Single Server)

```
Read Capacity:
- 1,000 concurrent users
- 100 req/sec baseline
- Feed query: <100ms (95th percentile)
- Search query: <200ms (95th percentile)

Write Capacity:
- 100 writes/sec (articles)
- 1,000 writes/sec (feedback with batching)

Storage:
- 50GB initial capacity
- ~100MB per 10k articles
- ~1MB per 1k feedback entries
```

### Scaling Plan (Phase 5+)

```
Read Replicas: 2-3 for read scaling
Connection Pooling: pgBouncer (500 connections)
Caching: Redis for feed (95% hit ratio)
CDN: CloudFront for static content
Search: Elasticsearch if full-text search becomes bottleneck
```

---

## NEXT STEPS

1. ✅ **Sources** - Complete source curation list
2. ✅ **Database Schema** - This document
3. ⏳ **System Architecture** - Data flow diagram
4. ⏳ **API Specification** - OpenAPI document
5. ⏳ **UI Wireframes** - 4 main screens

**Status**: Ready for API specification design  
**Owner**: Phase 1 Week 1 Planning
