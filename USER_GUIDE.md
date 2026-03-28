# ThinkStream User Guide - Phase 1 Localhost

Welcome to ThinkStream! This guide shows you how to use the application during Phase 1 development.

---

## Getting Started

### 1. Start the Application
```bash
cd "c:\Users\jaide\OneDrive\AI TRACKER"
docker-compose up --build
```

Wait 2-3 minutes for all services to start. You'll see:
```
postgres_1 | PostgreSQL is ready
redis_1 | Ready to accept connections
backend_1 | Uvicorn running on http://0.0.0.0:8000
frontend_1 | ▲ Next.js running on http://localhost:3000
```

### 2. Open the Application
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs

---

## Main Features

### 📰 **Homepage Feed**

**What you see**:
- Statistics cards at the top (total articles, sources, categories)
- Search bar for finding articles
- Category filter buttons
- List of articles with details

**How to use**:

1. **View Articles**
   - Scroll through the feed
   - See article title, source name (with ⭐ rating), publication date
   - Read preview text
   - Check category badge

2. **Find Articles**
   - Type in the search box to search by title/content
   - Press Enter or click "Search"
   - Clear search with the X button

3. **Filter by Category**
   - Click "All" to see all articles
   - Click category name (Research, Models, Companies, etc.) to filter
   - Only articles from that category will display

4. **Rate Articles**
   - Click 👍 **"Helpful"** if the article is useful
   - Click 👎 **"Not Helpful"** if not relevant
   - These votes will improve personalization (Phase 3)

5. **Navigate to Original**
   - Click **"Read More →"** to open the original article

6. **Pagination**
   - Click **"← Previous"** to go to previous page
   - Click **"Next →"** to load more articles

---

### 🔗 **Manage Sources**

**Access**: Click the ⚙️ **"Sources"** button in the top-right corner

**What you can do**:

#### View All Sources
- See list of all active sources
- Quality rating (⭐⭐⭐⭐⭐)
- Source type badge (Research, GitHub, Social, etc.)
- Active/Inactive status

#### Add a New Source
1. Click **"+ Add New Source"**
2. Fill in the form:
   - **Source Name**: e.g., "OpenAI Blog"
   - **Type**: Select from dropdown
   - **URL**: Full website URL
   - **Quality Rating**: Drag slider 1-5 (optional, defaults to 3)
3. Click **"Add Source"**
4. New source appears in the list

#### Edit a Source
1. Find the source in the list
2. Click the ✏️ **edit icon**
3. Modify fields as needed
4. Click **"Update Source"**

#### Remove a Source
1. Find the source in the list
2. Click the 🗑️ **trash icon**
3. Confirm deletion when prompted

---

## Sample Data Included

### 10 Pre-loaded Sources
- **OpenAI** (Research)
- **DeepMind** (Research)
- **Anthropic** (Research)
- **arXiv** (Academic Papers)
- **GitHub Trending** (Development)
- **Hacker News** (News)
- **AI Twitter** (Social)
- **Reddit r/MachineLearning** (Community)
- **MIT News** (Academic)
- **Keras Blog** (Tools)

### 4 Sample Articles
- Latest research paper
- GitHub trending project
- AI news item
- Industry update

**Note**: Articles are from May 2024 for demo purposes. Phase 2 will add real-time collectors.

---

## Common Tasks

### Task: Find AI Safety Research
1. Click the **Category filter**
2. Select **"Research"**
3. Scroll through filtered articles
4. Look for "safety" or "alignment" in titles

### Task: Check Latest Models & Tools
1. Select **"Models"** category
2. Sort by most recent
3. Click "Read More" on interesting articles

### Task: Add Your Favorite Tech Blog
1. Click **"Sources"** button
2. Click **"+ Add New Source"**
3. Enter blog details:
   - Name: "TechBlog Name"
   - Type: "News"
   - URL: https://www.techblog.com/
   - Rating: 5 (if high quality)
4. Click "Add Source"

### Task: Provide Feedback on Articles
1. View any article in the feed
2. Click 👍 for helpful, 👎 for not helpful
3. Your feedback will help Phase 3 personalization

---

## API Testing (Advanced)

### Quick Tests Using curl

**Get all articles**:
```bash
curl "http://localhost:8000/api/feed" | jq .
```

**Search articles**:
```bash
curl "http://localhost:8000/api/feed/search?q=transformer" | jq .
```

**Get categories**:
```bash
curl "http://localhost:8000/api/categories" | jq .
```

**Get statistics**:
```bash
curl "http://localhost:8000/api/analytics/stats" | jq .
```

**View all sources**:
```bash
curl "http://localhost:8000/api/sources" | jq .
```

**Add feedback**:
```bash
curl -X PUT "http://localhost:8000/api/feedback/1" \
  -H "Content-Type: application/json" \
  -d '{"feedback": 1}'
```

**For detailed API documentation**:
- Visit: http://localhost:8000/docs (Swagger UI)
- Or: http://localhost:8000/redoc (ReDoc)

---

## Troubleshooting

### Frontend not loading at http://localhost:3000
**Problem**: Page shows error or doesn't connect

**Solution**:
```bash
# Check if services are running
docker-compose ps

# Check frontend logs
docker-compose logs frontend

# Restart frontend
docker-compose restart frontend
```

### Backend error: "Connection refused"
**Problem**: Frontend shows "Backend server is not running"

**Solution**:
```bash
# Check backend status
docker-compose logs backend

# Ensure backend health
curl http://localhost:8000/api/health

# Restart backend
docker-compose restart backend
```

### Database error: "Cannot connect to database"
**Problem**: Articles don't load, database error in logs

**Solution**:
```bash
# Check database setup
docker-compose logs postgres

# Verify data was initialized
docker-compose exec postgres psql -U thinkstream -d thinkstream -c "SELECT COUNT(*) FROM article;"
```

### Port already in use
**Problem**: Error "port 3000 is already allocated"

**Solution**:
```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process or change port
# Edit docker-compose.yml and change "3000:3000" to "3001:3000"
docker-compose down
docker-compose up --build
```

### Search not working
**Problem**: Search returns no results

**Solution**:
- Ensure database is populated: `curl http://localhost:8000/api/feed`
- Check search term matches article content
- Try with simpler keywords first

---

## Development Tips

### Hot Reload
- **Frontend**: Changes to `.tsx` files auto-reload (1-2 seconds)
- **Backend**: Changes to `.py` files auto-reload (2-3 seconds)
- **Database**: Schema changes require service restart

### Accessing Logs
```bash
# View all logs
docker-compose logs -f

# Specific service logs
docker-compose logs -f frontend   # Next.js logs
docker-compose logs -f backend    # FastAPI logs
docker-compose logs -f postgres   # Database logs
docker-compose logs -f redis      # Cache logs
```

### Database Direct Access
```bash
# Access PostgreSQL CLI
docker-compose exec postgres psql -U thinkstream -d thinkstream

# Common queries:
# SELECT * FROM source;
# SELECT * FROM article LIMIT 5;
# SELECT COUNT(*) FROM article;
```

### Redis CLI Access
```bash
# Access Redis CLI
docker-compose exec redis redis-cli

# View keys
# KEYS *
# GET key_name
```

### Clean Reset
```bash
# Stop all services and remove data
docker-compose down -v

# Start fresh
docker-compose up --build
# This will reinitialize database with sample data
```

---

## Next Steps

### For Phase 1 Week 2
- ✅ Complete design system specification
- ✅ Create high-fidelity wireframes for all screens
- ✅ Plan AWS architecture and deployment

### For Phase 2
- Real data collection from 50+ sources
- Celery background workers
- Data normalization pipeline
- Performance optimization
- Real-time updates

### For Phase 3
- Personalization algorithm
- User preference tracking
- Content ranking based on feedback
- Analytics dashboard

### For Phase 4
- Production deployment to AWS
- Security hardening
- Performance tuning
- Monitoring and alerting

---

## Useful Links

- **Application Frontend**: http://localhost:3000
- **API Documentation**: http://localhost:8000/docs
- **ReDoc Documentation**: http://localhost:8000/redoc
- **Docker Compose Reference**: https://docs.docker.com/compose/
- **Next.js Documentation**: https://nextjs.org/docs
- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/

---

## Getting Help

### Check Logs
```bash
docker-compose logs [service_name]
```

### Restart Service
```bash
docker-compose restart [service_name]
# or
docker-compose down && docker-compose up --build
```

### Stop Everything
```bash
docker-compose down
```

### View Running Services
```bash
docker-compose ps
```

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         ThinkStream Application         │
├─────────────────────────────────────────┤
│  Frontend (Next.js) - Port 3000         │
│  ├─ Homepage/Feed                       │
│  ├─ Source Manager                      │
│  └─ Stats Dashboard                     │
├─────────────────────────────────────────┤
│  API Gateway (FastAPI) - Port 8000      │
│  ├─ /api/feed                           │
│  ├─ /api/sources                        │
│  ├─ /api/feedback                       │
│  ├─ /api/analytics                      │
│  └─ /api/categories                     │
├─────────────────────────────────────────┤
│  Database (PostgreSQL) - Port 5432      │
│  ├─ Sources (51+ tracked)               │
│  ├─ Articles (sample data, real in Ph 2 │
│  ├─ User Feedback (thumbs up/down)      │
│  ├─ User Preferences (Phase 3)          │
│  └─ Ratings & Analytics                 │
├─────────────────────────────────────────┤
│  Cache Layer (Redis) - Port 6379        │
│  ├─ Feed cache                          │
│  ├─ Rankings cache                      │
│  └─ Session store (Phase 5+)            │
└─────────────────────────────────────────┘
```

---

## Support

For issues or questions:
1. Check logs: `docker-compose logs`
2. Review this guide
3. Check API docs: http://localhost:8000/docs
4. See LOCALHOST_SETUP.md for technical details

---

**Ready to use ThinkStream? Start with `docker-compose up --build`!** 🚀

