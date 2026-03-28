# 🚀 ThinkStream Local Development Setup

**Project**: ThinkStream - Centralized AI Tracker  
**Environment**: Local Development with Docker Compose  
**Status**: Phase 1 Localhost Setup

---

## PREREQUISITES

### Required Software
- **Docker** (v20.10+) - Download: https://www.docker.com/products/docker-desktop
- **Docker Compose** (v2.0+) - Usually included with Docker Desktop
- **Git** (optional, already in repo)

### System Requirements
- **RAM**: Minimum 4GB available (8GB recommended)
- **Disk Space**: 5GB free
- **Ports Available**: 3000, 5432, 6379, 8000

---

## QUICK START (3 Commands)

### 1. Build and Start All Services

```bash
cd /path/to/AI\ TRACKER
docker-compose up --build
```

This will:
- ✅ Create PostgreSQL database
- ✅ Start Redis cache
- ✅ Build and run FastAPI backend
- ✅ Build and run Next.js frontend
- ⏳ Takes 2-3 minutes on first run

### 2. Access Applications

Once you see `listening on http://localhost:3000`:

**Frontend (Next.js)**
- URL: http://localhost:3000
- Status: ✅ Ready when you see console message

**Backend API (FastAPI)**
- URL: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Redoc: http://localhost:8000/redoc
- Status: ✅ Ready when you see "Uvicorn running on"

**Database (PostgreSQL)**
- Host: localhost
- Port: 5432
- User: thinkstream
- Password: thinkstream_dev_password
- Database: thinkstream

**Cache (Redis)**
- Host: localhost
- Port: 6379

### 3. Stop Services

```bash
docker-compose down
```

---

## DIRECTORY STRUCTURE

```
AI TRACKER/
├── docker-compose.yml          ← Master configuration (start here!)
├── backend/
│   ├── Dockerfile             ← FastAPI container
│   ├── requirements.txt        ← Python dependencies
│   ├── main.py               ← FastAPI application
│   ├── models.py             ← SQLAlchemy ORM models
│   ├── schemas.py            ← Pydantic request/response schemas
│   ├── config.py             ← Configuration settings
│   └── init_db.sql           ← Database initialization
├── frontend/
│   ├── Dockerfile            ← Next.js container
│   ├── package.json          ← Node.js dependencies
│   ├── next.config.js        ← Next.js configuration
│   ├── app/
│   │   ├── layout.tsx        ← Root layout
│   │   └── page.tsx          ← Homepage
│   └── lib/
│       └── api.ts            ← API client
├── PHASE_1_SOURCES.md         ← Data sources (reference)
├── PHASE_1_DATABASE_SCHEMA.md ← Schema design (reference)
└── CLAUDE.md                  ← Full implementation guide
```

---

## FRONTEND FEATURES (Phase 1)

### Homepage Interface
**URL**: http://localhost:3000

- **Header**: Logo, branding, source management button
- **Stats Dashboard**: Shows total articles, sources, categories, research papers
- **Search Bar**: Real-time search across all articles
- **Category Filter**: Browse by research, models, companies, people, social, events, tools
- **Article Feed**: 
  - Responsive grid/list layout
  - Article title, source, publication date, author
  - Category badge and source quality rating
  - Thumbs up/down feedback buttons (for personalization Phase 3)
  - "Read More" link to original source
  - Pagination navigation (10 articles per page)

### Source Manager
**Access**: Click "Sources" button in header → Opens modal

**Features**:
- **View All Sources**: Complete list with ratings (1-5 stars)
- **Add New Source**:
  - Enter source name (required)
  - Select type: Research, GitHub, Social, News, Company
  - Enter URL (required)
  - Set quality rating (1-5)
- **Edit Source**: Click edit icon to modify name, type, URL, rating
- **Delete Source**: Remove unwanted sources (with confirmation)
- **Status Display**: Shows active/inactive state for each source

### Component Architecture
See [FRONTEND_COMPONENT_STRUCTURE.md](FRONTEND_COMPONENT_STRUCTURE.md) for:
- Component hierarchy and usage
- Data types and interfaces
- API integration patterns
- Styling and responsive design
- Accessibility features

---

## AVAILABLE ENDPOINTS

### Health Checks
```bash
# API Health
curl http://localhost:8000/api/health

# Database Health
curl http://localhost:8000/api/health/db
```

### Feed
```bash
# Get feed (first page, 50 items)
curl http://localhost:8000/api/feed

# Get specific category
curl "http://localhost:8000/api/feed?category=research"

# Search articles
curl "http://localhost:8000/api/feed/search?q=GPT"
```

### Sources
```bash
# List all sources
curl http://localhost:8000/api/sources

# Get specific source
curl http://localhost:8000/api/sources/1

# List only active sources with rating >= 4
curl "http://localhost:8000/api/sources?active_only=true&rating_min=4"
```

### Feedback
```bash
# Submit thumbs up (feedback=1)
curl -X PUT http://localhost:8000/api/feedback/1 \
  -H "Content-Type: application/json" \
  -d '{"feedback": 1, "reason": "relevant"}'

# Get feedback history
curl http://localhost:8000/api/feedback/history

# Only thumbs up (feedback_type=1)
curl "http://localhost:8000/api/feedback/history?feedback_type=1"
```

### Analytics
```bash
# Feed statistics
curl http://localhost:8000/api/analytics/stats

# Top sources by engagement
curl http://localhost:8000/api/analytics/top-sources
```

---

## COMMON TASKS

### View API Documentation

Interactive Swagger UI:
- http://localhost:8000/docs

OpenAPI Redoc:
- http://localhost:8000/redoc

### Check Logs

**Backend logs** (real-time):
```bash
docker-compose logs backend -f
```

**Frontend logs** (real-time):
```bash
docker-compose logs frontend -f
```

**Database logs** (real-time):
```bash
docker-compose logs postgres -f
```

**All logs**:
```bash
docker-compose logs -f
```

### Connect to PostgreSQL

Using psql (if installed):
```bash
psql -h localhost -U thinkstream -d thinkstream
```

Password: `thinkstream_dev_password`

Query examples:
```sql
-- List all sources
SELECT id, name, type, rating, active FROM sources;

-- Count articles by category
SELECT category, COUNT(*) FROM articles GROUP BY category;

-- Get user feedback
SELECT article_id, feedback, created_at FROM user_feedback;
```

### Connect to Redis

Using redis-cli (if installed):
```bash
redis-cli -h localhost -p 6379
```

Commands:
```
PING                  # Test connection
KEYS *                # List all keys
GET <key>             # Get value
DEL <key>             # Delete key
FLUSHALL              # Clear all data
```

### Rebuild Services

If you change code and need a rebuild:
```bash
docker-compose up --build
```

### Fresh Start (Complete Reset)

```bash
# Stop services
docker-compose down

# Remove volumes (WARNING: Deletes database!)
docker-compose down -v

# Start fresh
docker-compose up --build
```

---

## TROUBLESHOOTING

### Port Already in Use

If you get `bind: address already in use`:

**Find what's using the port:**
```bash
# Check port 8000
lsof -i :8000

# Check port 3000
lsof -i :3000

# Check port 5432
lsof -i :5432
```

**Solution**: Either stop the service or change port in docker-compose.yml

### Database Connection Error

Error: `could not connect to server`

**Solution**: Wait 30 seconds for PostgreSQL to start

```bash
# Check if database is ready
docker-compose logs postgres

# Wait for: "database system is ready to accept connections"
```

### Out of Memory

Error: `OOMKilled` or `Exit code 137`

**Solution**: Increase Docker memory limit in Docker Desktop settings

### Services Not Starting

**Check service status:**
```bash
docker-compose ps
```

**Inspect specific service:**
```bash
docker-compose logs <service_name>
```

---

## DEVELOPMENT WORKFLOW

### 1. Make Backend Changes

Edit files in `backend/` directory:
- Hot reload enabled (changes applied automatically)
- API docs update at http://localhost:8000/docs

### 2. Make Frontend Changes

Edit files in `frontend/` directory:
- Hot reload enabled (changes applied automatically)
- Browser auto-refreshes at http://localhost:3000

### 3. Test Changes

**Frontend**: Just refresh browser

**Backend**: 
```bash
curl http://localhost:8000/docs
```

### 4. Add Backend Dependencies

Edit `backend/requirements.txt`:
```bash
pip install <package>  # Install locally first
pip freeze | grep <package> > temp.txt  # Get version
# Add to requirements.txt
docker-compose up --build backend
```

### 5. Add Frontend Dependencies

Edit `frontend/package.json`:
```bash
npm install <package>
docker-compose up --build frontend
```

---

## PRODUCTION vs LOCALHOST

| Aspect | Localhost | Production (Phase 4) |
|--------|-----------|---------------------|
| **Database** | Single container | AWS RDS Multi-AZ |
| **Cache** | Single container | AWS ElastiCache cluster |
| **Backend** | 1 instance | 2-10 auto-scaled instances |
| **Frontend** | Dev server | CloudFront CDN + S3 |
| **Monitoring** | None | CloudWatch dashboards |
| **Failover** | Manual restart | Automatic |
| **Backup** | None | Automated daily |

---

## SAMPLE DATA

The database initializes with:
- **10 sample sources** (blogs, arXiv, GitHub, Twitter, Reddit)
- **4 sample articles** (from different categories)
- **2 sample feedbacks** (thumbs up)

**Access immediately after startup**:
```bash
curl http://localhost:8000/api/feed
curl http://localhost:8000/api/sources
curl http://localhost:8000/api/analytics/stats
```

---

## NEXT STEPS

### After Verification (localhost working):

1. ✅ **Verify all endpoints work**
   - Visit http://localhost:3000 (frontend)
   - Check http://localhost:8000/docs (API)
   - Test queries from "COMMON TASKS" above

2. ✅ **Add more sample data**
   - Extend `backend/init_db.sql` with more sources/articles
   - Restart services: `docker-compose down && docker-compose up`

3. ✅ **Build Phase 2 code**
   - Create data collectors (Celery workers)
   - Add real Next.js UI components
   - Implement ranking algorithm

4. ✅ **Deploy to AWS**
   - Use Phase 4 deployment guide
   - Configure RDS, ElastiCache, EC2, CloudFront

---

## USEFUL LINKS

- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Next.js Docs**: https://nextjs.org/docs
- **Docker Compose Docs**: https://docs.docker.com/compose
- **PostgreSQL Docs**: https://www.postgresql.org/docs

---

## GETTING HELP

**Check logs first**:
```bash
docker-compose logs <service_name>
```

**Reset everything**:
```bash
docker-compose down -v && docker-compose up --build
```

**Verify ports are free**:
```bash
netstat -an | grep LISTEN  # macOS/Linux
netstat -ano | findstr LISTENING  # Windows
```

---

**Status**: ✅ Ready for local testing  
**Created**: March 28, 2026  
**Updated**: Phase 1 Week 1

Start with: `docker-compose up --build` 🚀
