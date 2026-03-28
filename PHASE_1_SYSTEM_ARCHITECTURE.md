# ThinkStream - System Architecture

**Project**: ThinkStream - Centralized AI Tracker  
**Phase**: 1 Planning - Architecture Design  
**Stack**: Next.js 14 + FastAPI + PostgreSQL + AWS  

---

## HIGH-LEVEL DATA FLOW ARCHITECTURE

```
┌──────────────────────────────────────────────────────────────────┐
│                     THINKSTREAM DATA FLOW                         │
└──────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  DATA COLLECTION LAYER (Celery + Background Jobs)              │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  arXiv API   │  │  GitHub API  │  │  Twitter/X   │         │
│  │  Collector   │  │  Collector   │  │  API v2      │  ...    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                 │                 │                    │
│         └─────────────────┴─────────────────┘                    │
│                      │                                            │
│             (Redis Task Queue via Celery)                        │
│                      │                                            │
│         ┌────────────▼───────────────┐                          │
│         │  Data Transformation &     │                          │
│         │  Normalization Pipeline    │                          │
│         │  ├─ URL deduplication      │                          │
│         │  ├─ Title normalization    │                          │
│         │  ├─ Date/timezone fix      │                          │
│         │  └─ UTF-8 encoding         │                          │
│         └────────────┬────────────────┘                          │
│                      │                                            │
│    ┌─────────────────▼─────────────────────┐                   │
│    │   Deduplicate & Merge Logic           │                   │
│    │   Check: URL hash + Title match       │                   │
│    │   Result: Single article per content  │                   │
│    └─────────────────┬─────────────────────┘                   │
│                      │                                            │
│     (Insert to PostgreSQL via bulk operations)                   │
│                                                                  │
└────────────────────────┬─────────────────────────────────────────┘
                         │
        ┌────────────────▼────────────────────┐
        │   PostgreSQL 15+ (AWS RDS)          │
        │   ├─ sources table                  │
        │   ├─ articles table                 │
        │   ├─ user_feedback table            │
        │   ├─ user_preferences table         │
        │   └─ indexes for fast queries       │
        │                                     │
        │   ┌─────────────────────── ┐        │
        │   │ Automatic Backups      │        │
        │   │ Multi-AZ Replication   │        │
        │   │ Point-in-time Recovery │        │
        │   └────────────────────────┘        │
        └────────┬─────────────────────────────┘
                 │
        ┌────────▼────────────────────┐
        │  Redis Cache Layer          │
        │  (AWS ElastiCache)          │
        │                               │
        │  ├─ Feed cache (5 min TTL)  │
        │  ├─ Rankings (1 hour TTL)   │
        │  ├─ Source ratings (24h)    │
        │  └─ Session data            │
        │                               │
        └────────┬─────────────────────┘
                 │
         ┌───────▼────────────────┐
         │   FastAPI Backend      │
         │   (Python 3.11+)       │
         │  (AWS EC2/ECS)         │
         │                         │
         │  ┌────────────────┐   │
         │  │ API Endpoints  │   │
         │  ├─ GET /feed    │   │
         │  ├─ GET /sources │   │
         │  ├─ PUT /feedback│   │
         │  ├─ GET /search  │   │
         │  └─ ...          │   │
         │  └────────────────┘   │
         │                         │
         │  ┌────────────────┐   │
         │  │ Ranking Engine │   │
         │  ├─ Source score  │   │
         │  ├─ Feedback ×40% │   │
         │  ├─ Recency ×20%  │   │
         │  └─ Personalize   │   │
         │  └────────────────┘   │
         │                         │
         │  ┌────────────────┐   │
         │  │ Auth (Phase 5) │   │
         │  │ Validation     │   │
         │  │ Error Handling │   │
         │  └────────────────┘   │
         │                         │
         └────────┬────────────────┘
                  │
        ┌─────────▼──────────────────────┐
        │  CDN: CloudFront               │
        │  (Global content distribution) │
        │  ├─ Cache static assets        │
        │  ├─ API responses (30s cache)  │
        │  ├─ Global edge locations      │
        │  └─ DDoS protection            │
        └─────────┬──────────────────────┘
                  │
        ┌─────────▼──────────────────────┐
        │  NEXT.JS FRONTEND              │
        │  (AWS CloudFront + S3)         │
        │  (Deployed on Vercel or EC2)   │
        │                                 │
        │  Mobile-First UI               │
        │  ├─ Homepage/Feed              │
        │  ├─ Source Manager             │
        │  ├─ Filters & Search           │
        │  ├─ Analytics Dashboard        │
        │  └─ Settings                   │
        │                                 │
        │  PWA Features                  │
        │  ├─ Service Worker             │
        │  ├─ Installable                │
        │  ├─ Offline support            │
        │  └─ App-like experience        │
        │                                 │
        │  Performance                   │
        │  ├─ Code splitting             │
        │  ├─ Image optimization         │
        │  ├─ Lazy loading               │
        │  └─ <2s load on 4G            │
        │                                 │
        │  Accessibility                 │
        │  ├─ WCAG 2.1 AA               │
        │  ├─ Screen reader support      │
        │  ├─ Keyboard navigation        │
        │  └─ Touch-friendly (44px min)  │
        │                                 │
        └─────────────────────────────────┘
                  ▲   ▲   ▲
                  │   │   │
              ╔═══╧═══╧═══╧═══╗
              ║  USER BROWSER  ║
              ║  (Desktop/     ║
              ║   Mobile)      ║
              ╚════════════════╝
```

---

## COMPONENT BREAKDOWN

### 1. DATA COLLECTORS (FastAPI Backend → Background Jobs)

```
┌─────────────────────────────────────────────────────────┐
│ Celery Beat (Scheduler)                                 │
│                                                         │
│ Schedule:                                               │
│ ├─ Every 12 hours: ArXiv papers                         │
│ ├─ Every 6 hours: GitHub trending                      │
│ ├─ Every 4 hours: Twitter/X feeds                      │
│ ├─ Every 6 hours: Reddit posts                         │
│ ├─ Every 8 hours: LinkedIn profiles (scraper)          │
│ └─ Every 24 hours: RSS feeds                           │
│                                                         │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│ Celery Worker Process #1-N                              │
│                                                         │
│ Each worker:                                            │
│ ├─ Fetches from single source API                      │
│ ├─ Handles rate limiting & retries                     │
│ ├─ Transforms to unified schema                        │
│ ├─ Detects duplicates                                  │
│ ├─ Stores to PostgreSQL                                │
│ └─ Updates last_fetched_at timestamp                   │
│                                                         │
│ Error Handling:                                         │
│ ├─ Retry with exponential backoff                      │
│ ├─ Log errors to CW (CloudWatch)                       │
│ ├─ Increment fetch_error_count                         │
│ └─ Alert if >3 consecutive failures                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 2. FASTAPI BACKEND SERVICES

```
┌──────────────────────────────────────────────────────────┐
│ FastAPI Application (main.py)                            │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ Request Pipeline:                                        │
│ Client → Router → Middleware → Service → DB/Cache       │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ ROUTERS:                                                 │
│                                                          │
│ 1. Feed Router (/api/feed)                              │
│    ├─ GET / → Get articles (latest or personalized)    │
│    ├─ GET /search → Full-text search                   │
│    ├─ GET /trending → Trending topics (24h)            │
│    └─ GET /{id} → Single article detail                │
│                                                          │
│ 2. Sources Router (/api/sources)                        │
│    ├─ GET / → List all sources with filters            │
│    ├─ POST / → Add new source (admin)                  │
│    ├─ PATCH /{id} → Update source rating/status        │
│    └─ DELETE /{id} → Remove source                     │
│                                                          │
│ 3. Feedback Router (/api/feedback)                      │
│    ├─ PUT /{article_id} → Thumbs up/down               │
│    ├─ GET / → User's feedback history                  │
│    └─ DELETE /{article_id} → Remove feedback           │
│                                                          │
│ 4. Categories Router (/api/categories)                  │
│    ├─ GET / → All categories                           │
│    └─ GET /{category} → Articles in category           │
│                                                          │
│ 5. Preferences Router (/api/preferences)                │
│    ├─ GET / → User's preferences (future: per-user)    │
│    ├─ PUT /{key} → Update preference weight            │
│    └─ DELETE /{key} → Remove preference                │
│                                                          │
│ 6. Analytics Router (/api/analytics)                    │
│    ├─ GET /stats → Feed statistics                     │
│    ├─ GET /top_sources → Most liked sources            │
│    └─ GET /category_breakdown → Category distribution  │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ MIDDLEWARE:                                              │
│                                                          │
│ ├─ CORS: Allow frontend requests                        │
│ ├─ Rate Limiting: 100 req/sec per IP                    │
│ ├─ Logging: Structured logs to CloudWatch              │
│ ├─ Error Handling: Convert exceptions to HTTP responses │
│ └─ Request ID: Trace requests across logs              │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ SERVICES (Business Logic):                              │
│                                                          │
│ ├─ FeedService                                          │
│ │  ├─ get_latest_feed(limit, category, search)         │
│ │  └─ get_personalized_feed() [Phase 3]                │
│ │                                                       │
│ ├─ SourceService                                        │
│ │  ├─ list_sources(filters)                            │
│ │  ├─ update_source_rating(source_id)                  │
│ │  └─ toggle_active(source_id)                         │
│ │                                                       │
│ ├─ FeedbackService                                      │
│ │  ├─ add_feedback(article_id, thumbs_up/down)         │
│ │  ├─ get_feedback_summary()                           │
│ │  └─ update_rankings() [Phase 3]                      │
│ │                                                       │
│ ├─ RankingService [Phase 3]                            │
│ │  ├─ calculate_article_score()                        │
│ │  ├─ apply_source_rating()                            │
│ │  ├─ apply_feedback_boost()                           │
│ │  └─ apply_recency_decay()                            │
│ │                                                       │
│ └─ CacheService                                         │
│    ├─ get_from_cache(key)                              │
│    ├─ set_in_cache(key, value, ttl)                    │
│    └─ invalidate_cache(pattern)                        │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ DATABASE LAYER (SQLAlchemy ORM):                        │
│                                                          │
│ ├─ Session Management: Connection pooling (20 conns)   │
│ ├─ Query Builders: Type-safe ORM queries               │
│ ├─ Transaction Management: ACID compliance              │
│ └─ Migrations: Alembic for schema versioning           │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 3. CACHING STRATEGY

```
┌─────────────────────────────────────────────────────────┐
│ Redis Cache (AWS ElastiCache)                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Cache Keys & TTL:                                       │
│                                                         │
│ 1. Feed Cache (5 min)                                  │
│    Key: feed:{category}:{page}:{sort}                  │
│    Value: List of 50 articles (JSON)                   │
│    Hit Ratio: 95%+                                      │
│                                                         │
│ 2. Article Detail (30 min)                             │
│    Key: article:{id}                                   │
│    Value: Full article + metadata                      │
│    Hit Ratio: 60%+                                      │
│                                                         │
│ 3. Source Ratings (24 hours)                           │
│    Key: source_ratings:all                             │
│    Value: Array of all source ratings                  │
│    Hit Ratio: 99%                                       │
│                                                         │
│ 4. Rankings (1 hour)                                   │
│    Key: rankings:{category}                            │
│    Value: Sorted articles with scores                  │
│    Hit Ratio: 80%+                                      │
│                                                         │
│ 5. Category Breakdown (daily)                          │
│    Key: stats:categories                               │
│    Value: Count per category                           │
│    Hit Ratio: 99%                                       │
│                                                         │
│ Cache Invalidation:                                     │
│ ├─ On new article: Invalidate feed_* and rankings_*    │
│ ├─ On source update: Invalidate source_ratings:all     │
│ ├─ On feedback: Invalidate rankings_*                  │
│ └─ TTL expiry: Automatic                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 4. NEXT.JS FRONTEND ARCHITECTURE

```
┌──────────────────────────────────────────────────────────┐
│ Next.js 14 Application                                   │
│ (Mobile-First, Progressive Web App)                      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ Directory Structure:                                     │
│                                                          │
│ src/                                                     │
│ ├─ app/                          (App Router)           │
│ │  ├─ layout.tsx                 (Root layout)          │
│ │  ├─ page.tsx                   (Homepage/Feed)        │
│ │  ├─ sources/                   (Source manager)       │
│ │  ├─ filters/                   (Filter panel)         │
│ │  ├─ analytics/                 (Analytics dashboard)  │
│ │  └─ api/                       (Backend routes)       │
│ │                                                       │
│ ├─ components/                                          │
│ │  ├─ Layout/                                          │
│ │  │  ├─ Header.tsx                                    │
│ │  │  ├─ Sidebar.tsx                                   │
│ │  │  └─ Footer.tsx                                    │
│ │  │                                                   │
│ │  ├─ Feed/                                            │
│ │  │  ├─ ArticleCard.tsx         (Article display)     │
│ │  │  ├─ FeedContainer.tsx        (Infinite scroll)    │
│ │  │  ├─ FeedbackButtons.tsx      (Thumbs up/down)     │
│ │  │  └─ FilterBar.tsx            (Quick filters)      │
│ │  │                                                   │
│ │  ├─ Sources/                                         │
│ │  │  ├─ SourceList.tsx           (All sources)        │
│ │  │  ├─ SourceMetrics.tsx        (Rating, status)     │
│ │  │  ├─ AddSourceForm.tsx        (Add new source)     │
│ │  │  └─ SourceChip.tsx           (Source display)     │
│ │  │                                                   │
│ │  ├─ Common/                                          │
│ │  │  ├─ Button.tsx               (shadcn/ui)          │
│ │  │  ├─ Card.tsx                 (shadcn/ui)          │
│ │  │  ├─ Badge.tsx                (Category labels)    │
│ │  │  ├─ Modal.tsx                (Dialog)             │
│ │  │  └─ Spinner.tsx              (Loading state)      │
│ │  │                                                   │
│ │  └─ Icons/                                           │
│ │     ├─ ThumbsUp.tsx                                  │
│ │     ├─ ThumbsDown.tsx                                │
│ │     └─ [more icons...]                               │
│ │                                                       │
│ ├─ hooks/                                               │
│ │  ├─ useFeed.ts                  (Feed fetch)          │
│ │  ├─ useFeedback.ts              (Feedback logic)      │
│ │  ├─ useFilters.ts               (Filter state)        │
│ │  ├─ useSearch.ts                (Search)              │
│ │  └─ useCache.ts                 (Offline support)     │
│ │                                                       │
│ ├─ lib/                                                 │
│ │  ├─ api.ts                      (API client/axios)    │
│ │  ├─ cache.ts                    (Local storage)       │
│ │  ├─ utils.ts                    (Helpers)             │
│ │  └─ constants.ts                (Configs)             │
│ │                                                       │
│ ├─ store/                                               │
│ │  ├─ feedStore.ts                (Zustand)             │
│ │  ├─ filterStore.ts                                   │
│ │  ├─ preferencesStore.ts                              │
│ │  └─ uiStore.ts                                       │
│ │                                                       │
│ ├─ styles/                                              │
│ │  ├─ globals.css                 (Tailwind)            │
│ │  └─ [component styles]                               │
│ │                                                       │
│ └─ types/                                               │
│    ├─ index.ts                    (TypeScript types)    │
│    └─ api.ts                      (API response types)   │
│                                                          │
│ Key Features:                                            │
│ ├─ Image Optimization: next/image with WebP             │
│ ├─ Font Optimization: next/font (system fonts)          │
│ ├─ Code Splitting: Automatic route chunking            │
│ ├─ Lazy Loading: React.lazy() for components           │
│ └─ PWA: next-pwa package for offline support           │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## DEPLOYMENT ARCHITECTURE

```
┌──────────────────────────────────────────────────────────┐
│ AWS INFRASTRUCTURE                                        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ Region: us-east-1 (Virginia, Low latency)              │
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ VPC (Virtual Private Cloud)                        │ │
│ │                                                    │ │
│ │ ┌──────────┐         ┌──────────┐                 │ │
│ │ │ Public   │         │ Private  │                 │ │
│ │ │ Subnet A │         │ Subnet A │                 │ │
│ │ └──────────┘         └──────────┘                 │ │
│ │ (Availability Zone 1)                             │ │
│ │                                                    │ │
│ │ ┌──────────┐         ┌──────────┐                 │ │
│ │ │ Public   │         │ Private  │                 │ │
│ │ │ Subnet B │         │ Subnet B │                 │ │
│ │ └──────────┘         └──────────┘                 │ │
│ │ (Availability Zone 2)                             │ │
│ │                                                    │ │
│ │ ┌──────────────────────────────────────────────┐  │ │
│ │ │ NAT Gateway (for private subnet egress)      │  │ │
│ │ └──────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ Internet Gateway → Route 53 DNS →                       │
│ CloudFront CDN (Global)                                 │
│           ↓                                              │
│ ┌──────────────────────────────────────────────────┐ │
│ │ Application Load Balancer (ALB)                  │ │
│ │ ├─ Health checks every 30 seconds               │ │
│ │ ├─ Auto-scale: 2-10 instances                   │ │
│ │ └─ HTTPS termination                            │ │
│ └──────────────┬───────────────────────────────────┘ │
│                │                                       │
│    ┌───────────┴──────────────┐                       │
│    │                          │                       │
│    ▼                          ▼                       │
│ ┌────────────────┐     ┌────────────────┐            │
│ │ ECS Cluster    │     │ ECS Cluster    │            │
│ │ (Fargate)      │     │ (Fargate)      │            │
│ │   NextJS       │     │   FastAPI      │            │
│ │ · 2-4 tasks    │     │ · 2-4 tasks    │            │
│ │ · Auto-scaling │     │ · Auto-scaling │            │
│ │ · Auto-restart │     │ · Auto-restart │            │
│ └────────────────┘     └────────────────┘            │
│                                                          │
│ RDS (Relational Database Service)                      │
│ ├─ PostgreSQL 15 (db.t3.medium)                        │
│ ├─ Multi-AZ deployment (automatic failover)            │
│ ├─ Automated backups (30-day retention)                │
│ ├─ Read replica in second AZ                          │
│ └─ 100 GB storage (auto-expanding)                     │
│                                                          │
│ ElastiCache (Redis)                                     │
│ ├─ Redis 7 (cache.t3.micro × 2 nodes)                │
│ ├─ Multi-AZ automatic failover                        │
│ ├─ Automatic backup (daily)                           │
│ └─ 100 MB memory (auto-expanding)                     │
│                                                          │
│ S3 Buckets                                              │
│ ├─ Static assets (Next.js build)                       │
│ ├─ Backup storage (30-day lifecycle)                   │
│ └─ Logs (CloudWatch via Firehose)                     │
│                                                          │
│ CloudWatch                                              │
│ ├─ Application logs from ECS                           │
│ ├─ Dashboards: CPU, Memory, API latency                │
│ ├─ Alarms: High error rate, low health                 │
│ └─ Lambda: Automated remediation                       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## REQUEST FLOW EXAMPLE

### User Views Feed

```
1. User opens browser → HTTPS request to thinkstream.com
   ↓
2. Route 53 DNS → Resolves to CloudFront CDN edge
   ↓
3. CloudFront → Checks cache for index.html
   ├─ Cache HIT: Serves from edge location (10ms)
   └─ Cache MISS: Requests from origin ALB (100ms)
   ↓
4. ALB → Routes to ECS task (Fargate)
   ↓
5. Next.js App → Renders HTML (SSG/SSR hybrid)
   ├─ Uses Zustand state
   ├─ Pre-fetches data via API route
   └─ Serves HTML to browser
   ↓
6. Browser executes JavaScript
   ├─ Hydrates React components
   ├─ Initializes service worker (PWA)
   └─ Makes API call for articles
   ↓
7. API Call → /api/feed?category=research&limit=50
   ↓
8. FastAPI Backend → Checks Redis cache
   ├─ Cache HIT: Returns cached feed (5ms)
   └─ Cache MISS:
      ├─ Queries PostgreSQL
      ├─ Applies ranking algorithm (if personalization)
      ├─ Stores in Redis (5 min TTL)
      └─ Returns JSON response
   ↓
9. Response → Browser receives 50 articles
   ↓
10. User sees feed → Responsive, loaded in <2s on 4G

When user provides feedback:

11. User clicks thumbs-up → PUT /api/feedback/{article_id}
    ↓
12. FastAPI → Stores in PostgreSQL
    ↓
13. Celery Job → Recalculates user rankings (Phase 3)
    ↓
14. Redis → Invalidates cached rankings
    ↓
15. Next request → Gets updated feed with new ranking
```

---

## MONITORING & ALERTING

```
CloudWatch Metrics:
├─ Application Level
│  ├─ API response time (target: <100ms)
│  ├─ Error rate (target: <0.1%)
│  ├─ Cache hit ratio (target: >80%)
│  └─ Feed load time (target: <2s mobile)
│
├─ Infrastructure Level
│  ├─ ECS CPU utilization (target: <60%)
│  ├─ ECS memory utilization (target: <70%)
│  ├─ RDS CPU (target: <40%)
│  └─ RDS connections (target: <50 of 100)
│
└─ Business Level
   ├─ Active data sources (target: >40)
   ├─ Articles collected (target: >1000/day)
   ├─ User feedback rate (target: >5%)
   └─ API availability (target: >99.5%)

Alarms & Actions:
├─ High error rate (>1%) → Slack + PagerDuty
├─ High latency (>500ms) → Auto-scale EC2
├─ Database CPU >70% → Trigger read replica
├─ Memory shortage → Auto-expand Redis
└─ Data collection failure → Retry + Alert team
```

---

## NEXT STEPS

1. ✅ **Sources** - Complete
2. ✅ **Database Schema** - Complete
3. ✅ **System Architecture** - This document
4. ⏳ **API Specification** - Next
5. ⏳ **UI/UX Wireframes** - Week 2

**Status**: Ready for API endpoint specification  
**Owner**: Phase 1 Week 1
