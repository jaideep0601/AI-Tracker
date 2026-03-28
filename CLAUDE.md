# CLAUDE.md - AI Tracker Development Guidelines

**Document Version**: 1.0  
**Created**: March 28, 2026  
**Project**: AI Tracker - Centralized AI Developments Aggregation Platform  
**Target Audience**: Claude (AI Assistant) for structured project development

---

## 1. Project Overview & Core Mission

### Vision
Build a **modern, mobile-first web platform** that serves as a single centralized hub for tracking AI developments from multiple global sources, enabling users to stay informed efficiently without information overload.

### Primary Objectives
1. **Aggregate** AI information from 7+ content categories
2. **Curate** high-quality sources through user-driven ratings
3. **Personalize** content based on user feedback (thumbs up/down)
4. **Display** modern, intuitive interface optimized for mobile access
5. **Scale** from single-user MVP to multi-user platform in Phase 5+

### Success Metrics
- ✅ Unified feed showing content from all 7 categories
- ✅ <2 second load time on mobile networks
- ✅ 99.5% uptime in production
- ✅ User spends <10 minutes daily to stay updated on AI
- ✅ High mobile usability (WCAG 2.1 AA compliant)
- ✅ Accurate source quality rating system

---

## 2. Project Scope & Constraints

### Phase 1-4 Scope (MVP - Single User)
✅ **In Scope**:
- Centralized aggregation from 7 content categories
- Source curation and 1-5 star rating system
- Comprehensive multi-dimensional filtering
- Thumbs up/down feedback system
- Basic personalization/ranking
- Modern mobile-first UI
- No authentication required
- Single-user personal use

❌ **Out of Scope**:
- User authentication
- Multi-user support
- Advanced ML recommendations
- Native mobile apps
- Community features

### Phase 5+ Scope (Multi-User Enhancement)
🔮 **Future**:
- User authentication and accounts
- Multi-user personalization
- Advanced ML recommendations
- Email notifications
- Content bookmarking/saving

---

## 2.5 Detailed Concepts from IDEAS_V2 (Inlined)

### 2.5.1 Expanded Project Vision
- Centralized, modern, mobile-first platform for tracking AI developments
- Single dashboard of cross-source insights (papers, models, repos, people, companies, conferences, social)
- Reduce time-to-insight and avoid reinvention of research discovery

### 2.5.2 Target User Flows
1. Daily briefing: open platform, see highest relevant AI developments for the day
2. Source curation: add and rate new sources like LinkedIn profiles, X accounts, subreddit communities
3. Filtering & discovery: drill down into categories, topics, and content quality
4. Feedback loop: thumbs up/down updates personalization and source ranking

### 2.5.3 Additional Core Requirements
- Source discovery quality rating system (manual + algorithmic)
- Filtering system with category/source/quality/topic/multidimensional combinations
- Source management dashboard (active sources, rating list, add/remove)
- Feedback system integration for content relevancy improvement
- Data refresh cadence configurable (hourly, daily, 2-day) for each type

### 2.5.4 Essential Data Tracking Categories
- Research & Academia (arXiv, papers)
- Development & Projects (GitHub, code libraries)
- People & Organizations (top researchers, teams)
- Companies & Products announcements
- Social & Discussions (X, LinkedIn, Reddit)
- Models & Tools (LLM releases, library updates)
- Events & Conferences (talks, workshops)

### 2.5.5 Performance & UX Requirements
- Mobile-first and full responsiveness (320px-2560px)
- Sub-2-second load on 4G
- <100ms API responses (95th percentile)
- WCAG 2.1 AA compliance
- Touch-friendly interactions, easy filter presets

### 2.5.6 Skill & Phase Mapping (confirming 4.1-4.9 in CLAUDE)
- We already have explicit skill requirements for all roles in CLAUDE sections 4.1-4.9 (frontend, backend, database, data integration, design, recommendation, devops, QA, security)

---

## 3. Development Methodology

### Core Principle: **PLAN FIRST, IMPLEMENT SECOND**

Every phase follows this workflow:

```
PLAN → REVIEW & ASK → IMPLEMENT → TEST → VERIFY
```

### Phase Breakdown

#### Phase 1: Planning & Architecture (1-2 weeks)
**Goal**: Define everything before writing code

**Deliverables**:
- [ ] Finalized requirements document (detailed in this CLAUDE.md section 1-2 and 2.5)
- [ ] System architecture design
- [ ] Database schema
- [ ] API specifications
- [ ] UI/UX wireframes and mockups
- [ ] Tech stack decisions
- [ ] Project name selection
- [ ] Source curation strategy

### Detail: Requirements Covered in CLAUDE.md (from IDEAS_V2)
- Detailed project vision and problem statement
- Core concept as centralized AI tracking platform
- Target use cases: on-the-go, daily dashboard, deep dive, trend spotting
- Differentiators: centralized, personalized, timeline-driven, feedback-driven, mobile-first, modern
- UI/UX design philosophy: mobile-first, contemporary aesthetics, intuitive navigation, performance, accessibility, responsive
- Content categories: research, dev/projects, people/org, companies/products, social/discussions, models/tools, events/conferences
- Feedback system & recommendation engine details
- Source discovery and rating system for LinkedIn/X/Reddit
- Filtering system with extensive category/source/topic/quality/selective options
- Data refresh strategy and integration plan
- Detailed phase-based development roadmap


**Checkpoint**: User reviews and approves all planning documents

#### Phase 2: MVP Development (3-4 weeks)
**Goal**: Build core features with mobile-first approach

**Deliverables**:
- [ ] Backend API with all endpoints
- [ ] Frontend UI with all core screens
- [ ] Data collection & processing pipeline
- [ ] Source rating system
- [ ] Filtering system (all dimensions)
- [ ] Preference storage
- [ ] Unit & integration tests

**Checkpoint**: User reviews design, functionality, and mobile experience

#### Phase 3: Feedback & Personalization (1-2 weeks)
**Goal**: Implement preference engine and recommendations

**Deliverables**:
- [ ] Thumbs up/down UI implementation
- [ ] Ranking algorithm based on feedback
- [ ] Analytics dashboard for preferences
- [ ] Performance optimization
- [ ] Comprehensive testing

**Checkpoint**: User tests personalization and provides feedback

#### Phase 4: Production Deployment (1 week)
**Goal**: Harden, optimize, and launch

**Deliverables**:
- [ ] Security audit and fixes
- [ ] Performance optimization (especially mobile)
- [ ] Monitoring and alerting setup
- [ ] Deployment pipeline
- [ ] User documentation
- [ ] Emergency procedures

**Checkpoint**: User approves production readiness

---

## 4. Extensive Skills & Expertise Map

### Required Skill Domains

#### 4.1 Frontend Development - Mobile-First Specialist

**Required Expertise**:
- **Modern UI Framework**: React, Vue, or Next.js (latest versions)
- **Responsive Design**: Mobile-first approach, 320px-2560px screens
- **Performance Optimization**: Lazy loading, code splitting, asset optimization for mobile networks
- **State Management**: Redux, Vuex, Zustand, or Context API
- **CSS & Design**: TailwindCSS, Material-UI, or custom CSS Grid/Flexbox
- **Progressive Web App (PWA)**: Service workers, offline functionality, app-like experience
- **Mobile UX Patterns**: Gesture handling, touch optimization, mobile navigation patterns
- **Accessibility**: WCAG 2.1 AA compliance, screen readers, keyboard navigation
- **Testing**: Jest, React Testing Library, Cypress for E2E testing

**Sub-Skills Required**:
- **Mobile Performance Optimization**: Understanding 4G/5G constraints, connection types
- **Cross-Browser Testing**: Safari, Chrome, Firefox, mobile browsers
- **Responsive Component Design**: Flexible layouts, fluid typography
- **Touch & Gesture Events**: Swipe, pinch, long-press handling
- **Mobile Navigation**: Bottom tabs, drawer menus, hamburger optimization
- **Image Optimization**: WebP, picture element, responsive images
- **Font Optimization**: System fonts, variable fonts, font-face optimization

**Experience Level Expected**: 3+ years with mobile web development

---

#### 4.2 Backend Development - Data Pipeline Specialist

**Required Expertise**:
- **REST API Design**: Clean endpoints, proper HTTP methods, error handling
- **Data Aggregation**: Collecting from multiple APIs and sources
- **Data Normalization**: Converting disparate data formats to unified schema
- **Caching Strategy**: Redis, in-memory caching, cache invalidation
- **Rate Limiting**: Handling API quotas, backoff strategies, queue management
- **Database Design**: Schema design, indexing, query optimization
- **Error Handling & Logging**: Structured logging, error tracking, monitoring
- **Security**: Secure coding practices, input validation, sanitization
- **Testing**: Unit tests, integration tests, test coverage >80%

**Sub-Skills Required**:
- **Web Scraping (if needed)**: Selenium, Puppeteer, Cheerio for HTML parsing
- **API Integration**: OAuth, API keys, rate limit handling for Twitter/X, LinkedIn, GitHub
- **Data Transformation**: ETL processes, mapping, deduplication
- **Background Jobs**: Scheduled data collection, queue systems (Bull, RabbitMQ)
- **Database Transactions**: ACID compliance, transaction handling
- **Connection Pooling**: Managing database connections efficiently
- **Performance Monitoring**: Query profiling, bottleneck identification

**Tech Stack Options**:
- **Node.js/Express**: JavaScript ecosystem, good for rapid development
- **Python/FastAPI**: Data processing strength, excellent for ML integration later
- **Python/Django**: Batteries-included framework, ORM, admin panel

**Experience Level Expected**: 3+ years backend development

---

#### 4.3 Database Architecture & Optimization

**Required Expertise**:
- **Relational Database Design**: PostgreSQL schema design, normalization
- **NoSQL Options**: MongoDB for flexible schema (if chosen)
- **Indexing Strategies**: B-tree indexes, composite indexes, query plans
- **Query Optimization**: EXPLAIN ANALYZE, slow query identification
- **Data Modeling**: Entity-relationship design, normalized schemas
- **Scaling Strategies**: Sharding, replication, read replicas
- **Backup & Recovery**: Automated backups, point-in-time recovery
- **Monitoring**: Query performance tracking, connection monitoring

**Sub-Skills Required**:
- **Full-Text Search**: PostgreSQL full-text search or Elasticsearch
- **Data Retention Policies**: Archival strategies, cleanup jobs
- **Time-Series Data**: Handling timestamps, time-based queries efficiently
- **Document Storage**: If storing original source documents
- **Replication Setup**: Master-slave or multi-master replication

**Decision Required**: PostgreSQL vs. MongoDB? (to be decided in Phase 1)

---

#### 4.4 Data Collection & Integration Specialist

**Required Expertise**:
- **API Integration**: RESTful APIs, authentication (OAuth, API keys, Basic auth)
- **Data Source Mapping**: Matching fields across different data formats
- **Error Recovery**: Handling failed requests, retries, exponential backoff
- **Rate Limiting**: Respecting API quotas, queue management
- **Data Validation**: Schema validation, required fields checking
- **Deduplication**: Identifying duplicate content across sources
- **Scheduling**: Cron jobs, scheduled tasks for regular data collection
- **Monitoring**: Alert on failed data collection, missing data

**Sources to Integrate** (Phase 1 Decision):
1. **Research & Academia**: arXiv API, Google Scholar (if available), academic databases
2. **GitHub**: GitHub REST API v3/GraphQL
3. **Social Media**: Twitter/X API v2, LinkedIn (via scraping/API), Reddit API
4. **Content Feeds**: RSS feeds from tech blogs, news sites
5. **Companies**: Official APIs and RSS feeds from major AI companies

**Sub-Skills Required**:
- **XML/JSON Parsing**: Handling different content types
- **Date/Time Handling**: Timezone handling, date formatting
- **Character Encoding**: UTF-8, special characters, emoji handling
- **API Documentation Analysis**: Understanding unclear API docs
- **Webhook Handling**: Real-time updates if supported by sources

**Experience Level Expected**: 2+ years with data integration

---

#### 4.5 UI/UX Design - Modern Design Specialist

**Required Expertise**:
- **Mobile-First Design Philosophy**: Designing for small screens first
- **Design Systems**: Creating component libraries (Figma, Storybook)
- **Wireframing**: Low-fidelity design mockups, user flows
- **Visual Design**: Color theory, typography, modern aesthetics
- **Interaction Design**: Micro-interactions, animations, feedback
- **Accessibility Design**: Contrast ratios, readable fonts, touch targets
- **Information Architecture**: Content hierarchy, navigation flow
- **Prototyping**: Interactive prototypes in Figma, Adobe XD, Framer

**Sub-Skills Required**:
- **Design Tokens**: Consistent spacing, colors, typography system
- **Responsive Breakpoints**: Design for 320px, 480px, 768px, 1024px, 1920px
- **Animation Principles**: Easing functions, performance-optimized animations
- **Icon Design**: Consistent icon set, SVG optimization
- **Color System**: Light/dark mode compatibility, color semantics
- **Typography Hierarchy**: Font sizes, weights, line heights for readability
- **Micro-interactions**: Loading states, success/error feedback, hovering
- **Modern Trends**: Glassmorphism, neumorphism, flat design considerations

**Deliverables**:
- Complete design system/component library
- Wireframes for all major screens
- High-fidelity mockups (desktop, tablet, mobile)
- Design specifications for developers
- Interactive prototypes

---

#### 4.6 Recommendation Engine & Analytics

**Required Expertise**:
- **Ranking Algorithms**: Simple scoring, weighted ranking, TF-IDF
- **User Preference Modeling**: Implicit feedback (thumbs up/down)
- **Content Similarity**: Similarity scoring between items
- **Analytics**: User behavior tracking, engagement metrics
- **A/B Testing**: Testing different ranking approaches
- **Performance**: Efficient ranking at scale

**Sub-Skills Required** (MVP - Simple):
- **Statistical Scoring**: Mean, weighted average, Bayesian rating
- **SQL Optimization**: Efficient preference queries
- **Caching Results**: Pre-compute common rankings

**Advanced Skills** (Phase 3+):
- **Collaborative Filtering**: User similarity, content similarity
- **Matrix Factorization**: Low-rank decomposition
- **Deep Learning**: Embedding-based recommendations
- **Embeddings**: Word2Vec, content embeddings

**MVP Approach**: Start with simple thumbs up/down based ranking, upgrade in Phase 3+

---

#### 4.7 DevOps & Infrastructure

**Required Expertise**:
- **Cloud Platforms**: AWS, GCP, or Azure configuration
- **Containerization**: Docker, Docker Compose
- **Orchestration**: Kubernetes basics (if scaling needed)
- **CI/CD Pipelines**: GitHub Actions, GitLab CI, Jenkins
- **Infrastructure as Code**: Terraform, CloudFormation
- **Monitoring & Alerting**: Datadog, New Relic, CloudWatch
- **Logging**: Centralized logging, log aggregation
- **Security**: SSL/TLS, secrets management, security groups

**Sub-Skills Required**:
- **Database Deployment**: Managed database services (RDS, Cloud SQL, Atlas)
- **Static Asset CDN**: CloudFront, Cloudflare for global distribution
- **API Gateway**: Request routing, rate limiting at infrastructure level
- **Load Balancing**: Auto-scaling groups, load balancer configuration
- **Backup Strategy**: Automated backups, disaster recovery
- **Performance Tuning**: Cache hit ratios, database optimization
- **Security Hardening**: WAF rules, DDoS protection

**Cloud Provider Decision**: AWS vs. GCP vs. Azure? (to be decided in Phase 1)

---

#### 4.8 Quality Assurance & Testing

**Required Expertise**:
- **Test Planning**: Test strategy, test case design
- **Unit Testing**: Jest, Pytest, Mocha for individual functions
- **Integration Testing**: Testing multiple components together
- **End-to-End Testing**: Cypress, Playwright, Selenium for full user flows
- **Mobile Testing**: Responsive design testing, mobile device testing
- **Performance Testing**: Load testing, stress testing, mobile network simulation
- **Accessibility Testing**: Automated accessibility checks, manual testing
- **Security Testing**: OWASP top 10 vulnerabilities, penetration testing basics

**Sub-Skills Required**:
- **Test Automation**: CI/CD integration, test report generation
- **Performance Benchmarking**: Response time baselines, regression detection
- **Device Testing**: Real device testing vs. simulators
- **Accessibility Tools**: Axe, Lighthouse, WAVE
- **Load Testing Tools**: Apache JMeter, k6, Locust
- **Mobile Network Simulation**: Chrome DevTools throttling, network conditions

---

#### 4.9 Security & Compliance

**Required Expertise**:
- **Secure Coding**: Input validation, output encoding, SQL injection prevention
- **Authentication & Authorization**: Even if not in MVP, understand for Phase 5+
- **Data Protection**: Encryption at rest, encryption in transit
- **OWASP Top 10**: Understanding and preventing common vulnerabilities
- **Dependency Management**: Keeping libraries updated, vulnerability scanning
- **Secrets Management**: API keys, credentials, environment variables
- **Compliance**: GDPR considerations (if applicable), data privacy

**Sub-Skills Required**:
- **Penetration Testing**: Basic security scanning
- **SSL/TLS Configuration**: Certificate management, HTTPS setup
- **Rate Limiting & DDoS Protection**: Preventing abuse
- **Input Validation**: Sanitization strategies
- **Logging & Monitoring**: Security event tracking

---

### 5. Phase-Specific Skill Requirements

#### Phase 1 Planning (1-2 weeks)
**Key Roles**:
1. ✅ **Architecture Specialist** - System design, tech stack decisions
2. ✅ **Requirements Analyst** - Detailed requirements documented in this CLAUDE.md
3. ✅ **UX/UI Designer** - Wireframes and design philosophy
4. ✅ **Database Architect** - Schema design review

**Expected Contributions**: Planning documents, specifications, architecture diagrams

---

#### Phase 2 MVP Development (3-4 weeks)
**Key Roles**:
1. ✅ **Frontend Developer (Mobile Expert)** - UI implementation, responsive design
2. ✅ **Backend Developer** - API, data pipeline, core logic
3. ✅ **Data Engineer** - Source integration, data collection setup
4. ✅ **Database Administrator** - Database setup, optimization
5. ✅ **UX/UI Designer** - Design implementation support, design reviews
6. ☐ **QA/Tester** - Manual testing, test case creation

**Effort Distribution**:
- Frontend: 35-40%
- Backend: 30-35%
- Data Integration: 20-25%
- Database: 10%

---

#### Phase 3 Feedback System (1-2 weeks)
**Key Roles**:
1. ✅ **Backend Engineer** - Preference storage, ranking logic
2. ✅ **Data Scientist/ML Engineer** - Recommendation algorithm
3. ✅ **Frontend Developer** - Feedback UI, analytics display
4. ✅ **QA/Tester** - Testing all preference flows

**Effort Distribution**:
- Backend: 40%
- ML/Algorithm: 30%
- Frontend: 20%
- QA: 10%

---

#### Phase 4 Production (1 week)
**Key Roles**:
1. ✅ **DevOps Engineer** - Deployment, monitoring setup
2. ✅ **Security Specialist** - Security audit, hardening
3. ✅ **QA Lead** - Final comprehensive testing
4. ✅ **Backend Developer** - Performance optimization
5. ✅ **System Administrator** - Monitoring, alerts setup

**Effort Distribution**:
- DevOps/Deployment: 30%
- Security: 25%
- Testing: 25%
- Performance Optimization: 20%

---

## 6. Technology Stack Recommendations

### Frontend (Decision Needed in Phase 1)
**Option A: React (Recommended for large ecosystem)**
- Library: React 18+
- State Management: Redux Toolkit or Zustand
- Styling: TailwindCSS
- UI Components: Material-UI or shadcn/ui
- Mobile: PWA with workbox
- Testing: Jest + React Testing Library

**Option B: Next.js (Full Framework)**
- Framework: Next.js 14+ (App Router)
- Styling: TailwindCSS
- UI Components: shadcn/ui
- API Routes: Built-in
- Mobile: PWA support
- Testing: Jest + Cypress

**Option C: Vue 3 (More developer friendly)**
- Framework: Vue 3 with Composition API
- State: Pinia
- Styling: TailwindCSS
- UI Components: PrimeVue or HeadlessUI
- Mobile: Quasar framework alternative
- Testing: Vitest + Cypress

**Recommendation**: Next.js for full-stack simplicity, React for ecosystem flexibility

### Backend (Decision Needed in Phase 1)
**Option A: Node.js/Express (JavaScript ecosystem)**
- Runtime: Node.js 20+
- Framework: Express.js or Fastify
- Database ORM: Prisma or Sequelize
- Validation: Zod or Yup
- Testing: Jest + Supertest
- Deployment: Vercel, Railway, or Docker

**Option B: Python/FastAPI (Data strength)**
- Framework: FastAPI (async, fast)
- Database ORM: SQLAlchemy
- Validation: Pydantic
- Task Scheduling: Celery + Redis
- Testing: Pytest
- Deployment: Heroku, DigitalOcean, Docker

**Option C: Python/Django (Batteries-included)**
- Framework: Django 5+
- ORM: Django ORM
- Admin Panel: Built-in Django admin
- Task Queue: Celery
- Testing: Django test framework + Pytest
- Deployment: Any WSGI-compatible host

**Recommendation**: FastAPI for performance and modern async, Node.js for full-stack simplicity

### Database (Decision Needed in Phase 1)
**Option A: PostgreSQL (Recommended for relational data)**
- Version: PostgreSQL 15+
- Hosting: AWS RDS, Google Cloud SQL, or Heroku Postgres
- ORM: Prisma or SQLAlchemy
- Full-Text Search: Built-in PostgreSQL FTS
- JSON Support: JSONB for flexible fields
- Advantages: ACID, powerful, extensive features

**Option B: MongoDB (Flexible schema)**
- Version: MongoDB 6+
- Hosting: MongoDB Atlas
- ORM: Mongoose or PyMongo
- Advantages: Flexible schema, good for varying source formats
- Disadvantages: Less ideal for complex relationships

**Recommendation**: PostgreSQL for structured content, MongoDB if schema highly variable

### Cloud Platform (Decision Needed in Phase 1)
**Option A: AWS (Most feature-rich)**
- Computing: EC2, ECS, Lambda
- Database: RDS (PostgreSQL), DynamoDB
- CDN: CloudFront
- Monitoring: CloudWatch
- CI/CD: CodePipeline, CodeDeploy

**Option B: Google Cloud Platform (Data-friendly)**
- Computing: Compute Engine, Cloud Run
- Database: Cloud SQL, Firestore
- CDN: Cloud CDN
- Monitoring: Cloud Monitoring
- BigQuery for analytics

**Option C: DigitalOcean (Simpler, cost-effective)**
- App Platform (managed)
- Droplets (VPS)
- Managed Databases
- Spaces (Object Storage)
- Good for startups/indie projects

**Recommendation**: AWS for maturity, GCP for ML potential future, DO for simplicity

---

## 7. Development Workflow & Checkpoints

### Planning-First Methodology

**For Each Phase**:
1. **Create Detailed Plan**
   - Break down into specific tasks
   - Estimate effort and timeline
   - Identify blockers and dependencies
   - Create detailed specification

2. **Review & Approval Checkpoint**
   ```
   [PLAN READY] → [USER REVIEW] → [ASK QUESTIONS] → [REVISE] → [APPROVED] → [IMPLEMENT]
   ```

3. **Staged Implementation**
   - Implement in logical chunks (not everything at once)
   - Test each chunk
   - Get feedback before proceeding

4. **Verification & Feedback**
   - Demonstrate completed work
   - User provides feedback
   - Iterate if needed

---

### Interactive Checkpoints

#### Phase 1 Checkpoints ✓
**1a. Requirements Finalization**
```
USER INPUT NEEDED:
- [ ] Approved project name: ________________
- [ ] Tech stack: Frontend: [ ] React [ ] Vue [ ] Next.js | Backend: [ ] Node [ ] Python
- [ ] Database: [ ] PostgreSQL [ ] MongoDB
- [ ] Cloud Platform: [ ] AWS [ ] GCP [ ] DigitalOcean
- [ ] Initial 30-50 sources to curate: ________________
```

**1b. Design Review**
```
DELIVERABLES FOR APPROVAL:
- [ ] System architecture diagram
- [ ] Database schema (normalized design)
- [ ] API endpoint list (complete specification)
- [ ] UI/UX wireframes (mobile-first)
- [ ] Design system specification
- [ ] Data flow diagrams
```

**1c. Planning Sign-Off**
```
FINAL APPROVAL REQUIRED:
- [ ] Team understands all requirements
- [ ] Tech stack is decided
- [ ] Timeline is realistic (8-10 weeks)
- [ ] All open questions answered
```

---

#### Phase 2 Checkpoints ✓
**2a. Backend Setup Complete**
```
VERIFICATION:
- [ ] Dev environment set up and documented
- [ ] Database schema implemented
- [ ] All API endpoints created (tested with Postman)
- [ ] Data collection pipeline running (test data)
- [ ] Logging and monitoring working
- [ ] Test coverage > 70%
```

**2b. Frontend Implementation**
```
VERIFICATION:
- [ ] All major screens implemented
- [ ] Mobile responsive on all breakpoints
- [ ] Navigation working smoothly
- [ ] Performance < 2s load time on 4G
- [ ] Accessibility audit passed (WCAG AA)
- [ ] Touch interactions optimized
```

**2c. Data Integration Live**
```
VERIFICATION:
- [ ] Real data collected from sources
- [ ] Data properly normalized and stored
- [ ] Deduplication working
- [ ] Source rating system functional
- [ ] Performance metrics acceptable
```

**2d. MVP Review & Demo**
```
USER SIGN-OFF:
- [ ] Reviewed complete MVP
- [ ] Tested on desktop and mobile
- [ ] Functionality meets requirements
- [ ] UI/UX feels modern and intuitive
- [ ] Ready to proceed to Phase 3?
```

---

#### Phase 3 Checkpoints ✓
**3a. Feedback System Live**
```
VERIFICATION:
- [ ] Thumbs up/down UI implemented
- [ ] Preferences stored correctly
- [ ] Ranking algorithm working
- [ ] Content reordering based on preferences
- [ ] Analytics dashboard functional
```

**3b. Personalization Testing**
```
VERIFICATION:
- [ ] Preferences affect content ranking
- [ ] Multiple users' preferences isolated (for future)
- [ ] Performance impact minimal
- [ ] Edge cases handled
```

**3c. Phase 3 Review**
```
USER SIGN-OFF:
- [ ] Tested personalization thoroughly
- [ ] Recommendations improving over time
- [ ] Ready for production deployment?
```

---

#### Phase 4 Checkpoints ✓
**4a. Production Readiness**
```
VERIFICATION:
- [ ] Security audit completed and issues fixed
- [ ] Performance optimized (< 2s mobile, < 100ms API)
- [ ] Monitoring and alerts configured
- [ ] Backup and recovery tested
- [ ] CI/CD pipeline working
- [ ] Documentation complete
```

**4b. Pre-Launch Testing**
```
VERIFICATION:
- [ ] Cross-browser testing complete
- [ ] Mobile device testing complete
- [ ] Load testing under expected traffic
- [ ] Failure scenarios tested
- [ ] Rollback procedure documented
```

**4c. Launch Approval**
```
USER FINAL APPROVAL:
- [ ] All systems ready
- [ ] Monitoring dashboards active
- [ ] Emergency contacts identified
- [ ] Cleared to launch
```

---

## 8. Code Quality & Standards

### Quality Metrics
```
Target Standards:
- Test Coverage: ≥ 80%
- Code Duplication: < 10%
- Critical Issues: 0
- Accessibility Violations: 0
- Performance Budget: <2s mobile, <100ms API
- Uptime: ≥ 99.5%
```

### Code Review Process
1. All PRs require review before merge
2. Linting: ESLint (frontend), Pylint (Python)
3. Type Checking: TypeScript recommended or JSDoc
4. Testing: All new features require tests
5. Documentation: Code comments for complex logic

### Testing Standards
- **Unit Tests**: Every function/component
- **Integration Tests**: API endpoints, data flows
- **E2E Tests**: Critical user journeys
- **Mobile Testing**: Real device + simulation
- **Accessibility Testing**: Automated + manual

---

## 9. Communication & Collaboration Guidelines

### Communication Style
- **Direct & Clear**: Avoid unnecessary jargon
- **Structured**: Organized with clear sections and checkpoints
- **Proactive**: Ask clarifying questions early
- **Documented**: Key decisions recorded

### Update Frequency
- **Daily**: Brief status on current work
- **Weekly**: Summary of progress, blockers, upcoming work
- **At Checkpoints**: Detailed review and feedback request

### Question Protocol
**When uncertain, ask for clarification**:
- What does the user want?
- Is this in scope?
- What's the priority?
- Any constraints I should know?

### Feedback Incorporation
- Always ask for user feedback before proceeding
- Revise based on feedback
- Document decisions made

---

## 10. Document References & Structure

### Core Documents
- This document (CLAUDE.md) contains integrated requirements and structure based on earlier idea capture
- [ideas.md](ideas.md) - Original points and brainstorming
- [PROJECT_ROADMAP.md](PROJECT_ROADMAP.md) - Phase timeline and overview

### How to Use This CLAUDE.md
1. **Before Each Phase**: Review phase-specific sections
2. **At Checkpoints**: Reference the checkpoint section
3. **For Skill Requirements**: Check Section 4 (Skills Map)
4. **For Process**: Follow Section 7 (Workflow)
5. **When Uncertain**: Reference this document, ask user for clarification

---

## 11. Phase 1.1 - Requirements Finalization Plan

### Immediate Actions
**This Week - Phase 1.1 Execution**

1. **Tech Stack Decisions** (with user input)
   - Frontend framework (React/Vue/Next.js)?
   - Backend runtime (Node/Python)?
   - Database (PostgreSQL/MongoDB)?
   - Cloud provider (AWS/GCP/DO)?

2. **Project Naming** (user selection)
   - Review naming options section for 10 naming suggestions
   - User selects preferred name
   - Document final decision

3. **Source Curation** (user input)
   - Which LinkedIn profiles to include?
   - Which X.com accounts to track?
   - Which Reddit communities to monitor?
   - Which GitHub organizations/users?
   - Which ArXiv categories?

4. **Design System** (designer + user review)
   - Create wireframes for main screens
   - Define component library
   - Establish design tokens
   - Create design specifications

5. **Database Schema** (architect + user review)
   - Entity-relationship diagram
   - Normalized data schema
   - Indexing strategy
   - Data retention policies

6. **API Specification** (backend + user review)
   - Complete endpoint list
   - Request/response formats
   - Error handling
   - Rate limiting strategy

### User Input Required (Before We Proceed)
```
DECISION CHECKLIST - Phase 1.1:
- [ ] 1. Tech stack selected
- [ ] 2. Project name finalized
- [ ] 3. Initial sources approved
- [ ] 4. Design direction approved
- [ ] 5. Database approach agreed
- [ ] 6. API structure understood
```

---

## 12. Success Criteria & Definition of Done

### Phase 1: Requirements Complete When
- ✅ All planning documents completed
- ✅ User has reviewed and approved all specifications
- ✅ Tech stack decided
- ✅ Project name selected
- ✅ No major open questions

### Phase 2: MVP Complete When
- ✅ All features from IDEAS_V2 Section 4.1-4.5 implemented
- ✅ Mobile experience optimized and tested
- ✅ > 80% test coverage
- ✅ Performance targets met
- ✅ User approves functionality

### Phase 3: Personalization Complete When
- ✅ Feedback system fully functional
- ✅ Ranking algorithm working
- ✅ Preferences improving content ordering
- ✅ Analytics dashboard showing insights
- ✅ User validates personalization

### Phase 4: Production Ready When
- ✅ Security audit passed
- ✅ Performance optimized
- ✅ Monitoring active
- ✅ Backup/recovery tested
- ✅ User gives launch approval

---

## 13. Known Constraints & Considerations

### Technical Constraints
- Mobile-first design (320px minimum width)
- <2 second load time target on 4G networks
- Rate limits from data source APIs
- Cross-platform browser compatibility
- WCAG 2.1 AA accessibility compliance

### Business Constraints
- Single-user MVP (no auth initially)
- 8-10 week timeline to production
- Scale to multi-user in Phase 5+
- Budget/cost considerations (cloud infrastructure)

### Data Constraints
- Respecting API rate limits
- Legal/ethical web scraping considerations
- Data retention and storage limits
- Deduplication across sources

---

## 14. Getting Started - Next Steps

### Immediate (Today)
1. ✅ **Review this CLAUDE.md document**
2. ✅ **Review this CLAUDE.md for complete requirements (IDEAS V2 content is inlined)**
3. 🔄 **User provides Phase 1.1 input** (see Section 11)

### Week 1
4. Create detailed design system and wireframes
5. Finalize tech stack selections
6. Create database schema
7. Document API specifications

### Week 2
8. Create implementation roadmap for Phase 2
9. Set up development environment templates
10. Prepare Phase 2 detailed plan

### Ready for Phase 2
11. Begin backend setup
12. Start frontend development
13. Implement data collection pipeline

---

## 15. Questions for User Input

**Before we proceed to in-depth planning, please provide:**

### Tech Stack Questions:
1. **Frontend Preference**:
   - React (flexible, large ecosystem)
   - Vue 3 (more intuitive)
   - Next.js (full-stack, simpler)

2. **Backend Preference**:
   - Node.js + Express (JavaScript, faster iteration)
   - Python + FastAPI (better for data, async performance)
   - Python + Django (batteries-included)

3. **Database Preference**:
   - PostgreSQL (structured, powerful, recommended)
   - MongoDB (flexible schema)

4. **Cloud Platform Preference**:
   - AWS (most features)
   - Google Cloud (data/ML friendly)
   - DigitalOcean (simpler, cost-effective)

### Project Preferences:
5. **Project Name**: Which of the 10 suggestions in IDEAS_V2, or a new one?

6. **Initial Sources**: Should we use the pre-curated list in IDEAS_V2, or customize?

7. **PWA Approach**: Should MVP include Progressive Web App features (installable, offline)?

8. **Design Framework**: Existing component library or custom design?

9. **Timeline**: 8-10 weeks realistic for your schedule?

10. **Any other preferences or constraints**?

---

## 16. Tech Stack Confirmation & Dependencies

### CONFIRMED SELECTIONS (User locked in)
✅ **Frontend**: Next.js 14+ (App Router, built-in API, PWA ready)
✅ **Backend**: FastAPI (Python 3.11+, async, auto-docs)
✅ **Database**: PostgreSQL 15+ (AWS RDS managed)
✅ **Cloud**: AWS (EC2/ECS compute, CloudFront CDN, Lambda serverless)
✅ **CI/CD**: GitHub Actions + AWS CodeDeploy

### Core Dependencies Setup

**Frontend Stack**:
```
next@14.x, react@18.x, react-dom@18.x
tailwindcss, shadcn/ui, @radix-ui components
zustand (state), axios (HTTP client)
react-query (data fetching), workbox (PWA)
jest, @testing-library/react, cypress (testing)
```

**Backend Stack**:
```
fastapi, uvicorn (ASGI server)
sqlalchemy@2.x (ORM), psycopg2 (PostgreSQL driver)
pydantic (validation), python-dotenv (env config)
redis, aioredis (caching/sessions)
celery, redis (background jobs - data collection)
pytest, pytest-asyncio (testing)
```

**Database Stack**:
```
postgresql@15, pg_stat_statements (monitoring)
redis@7 (caching layer)
AWS RDS (managed PostgreSQL)
AWS ElastiCache (managed Redis)
```

**DevOps Stack**:
```
Docker, docker-compose
AWS EC2/ECS for containerized app
AWS RDS for managed PostgreSQL
AWS CloudFront for CDN
GitHub Actions for CI/CD
AWS Secrets Manager for credentials
CloudWatch for monitoring/logging
```

---

## 17. Phase 1: Planning & Architecture (Weeks 1-2)

### Week 1: Requirements & Design Architecture

**Owner**: Architecture Lead + Requirements Analyst + UX Designer

**Tasks**:
1. **Data Model Finalization** (8 hours)
   - Create spreadsheet with 40-50 initial sources
   - Map source fields to unified data schema
   - Identify critical data points for each content type
   - Plan deduplication strategy

2. **Database Schema Design** (6 hours)
   - Create Entity-Relationship Diagram (ERD)
   - Normalize schema for sources, articles, ratings, user feedback
   - Plan indexes for common queries (timestamp, category, source_quality)
   - Document data retention policies

3. **System Architecture** (6 hours)
   - Draw data flow diagram (Sources → Collectors → Normalizer → DB → API → Frontend)
   - Define API gateway strategy (rate limiting, auth for Phase 5+)
   - Plan caching strategy (Redis for feed, rankings, source ratings)
   - Document scaling approach for Phase 5+ multi-user

4. **API Specification OpenAPI** (8 hours)
   - Document all endpoints (Feed, Sources, Ratings, Preferences, Search, Filters)
   - Define request/response schemas
   - Specify error codes and handling
   - Document rate limits and pagination

**Deliverables**:
- [ ] Initial sources list (40-50 curated sources, spreadsheet)
- [ ] ERD diagram (Figma or draw.io)
- [ ] System architecture diagram
- [ ] OpenAPI 3.0 specification (JSON/YAML)
- [ ] Data model spreadsheet

**Checkpoint**: Design review with user

---

### Week 2: Design System & Setup Planning

**Owner**: UX/UI Designer + Frontend Lead + DevOps Lead

**Tasks**:
1. **Wireframes** (10 hours)
   - Homepage/Feed (infinite scroll, filters, source info)
   - Source Manager (add/remove, ratings, manage)
   - Filter Panel (category, source, quality, custom)
   - Settings/Analytics (user preferences, feedback stats)

2. **Design System** (8 hours)
   - Typography scale (12px, 14px, 16px, 18px, 20px, 24px, 32px, 48px)
   - Color palette (primary, secondary, success, warning, error, neutral)
   - Component specs (buttons, cards, badges, modals)
   - Spacing system (4px grid, 8px base unit)

3. **Production Deployment Plan** (6 hours)
   - AWS account setup (EC2, RDS, CloudFront, Route 53)
   - Environment config (dev, staging, production)
   - Secrets management (API keys, database credentials)
   - Monitoring dashboard plan (CloudWatch, logs)

4. **Development Environment Setup** (4 hours)
   - Create Docker containers (Next.js dev, FastAPI dev, PostgreSQL)
   - Environment variables template (.env.example)
   - Local dev documentation
   - Git workflow and branching strategy

**Deliverables**:
- [ ] Wireframes (4 main screens)
- [ ] Design system specs (colors, typography, components)
- [ ] AWS architecture diagram
- [ ] Deployment checklist
- [ ] Docker compose setup files
- [ ] Development environment guide

**Checkpoint**: Design approval + architecture sign-off

---

### Phase 1 Success Criteria
- ✅ All planning documents completed
- ✅ User has reviewed all designs
- ✅ Tech stack confirmed
- ✅ Project name finalized
- ✅ Initial sources approved
- ✅ No architectural blockers

---

## 18. Phase 2: MVP Development (Weeks 3-6)

### Week 3: Backend Foundation

**Owner**: Backend Developer + Database Admin

**Tasks**:
1. **FastAPI Project Setup** (4 hours)
   - Initialize FastAPI project, project structure
   - Create main.py with CORS, exception handling
   - Set up logging and error tracking
   - Create Dockerfile for FastAPI

2. **Database Layer** (6 hours)
   - PostgreSQL schema implementation (all tables)
   - Create SQLAlchemy models for all entities
   - Set up migration system (Alembic)
   - Create database utils and connection pooling

3. **API Endpoints - Sources** (8 hours)
   - GET /api/sources (list all with filtering)
   - POST /api/sources (add new source)
   - PATCH /api/sources/{id} (update rating, active status)
   - DELETE /api/sources/{id} (remove source)

4. **Data Collection Pipeline - Skeleton** (4 hours)
   - Create data collector base class
   - Set up Celery + Redis for background jobs
   - Create task scheduling (Celery beat)
   - Implement error logging and retry logic

**Deliverables**:
- [ ] FastAPI server running locally
- [ ] Database schema implemented
- [ ] Basic endpoints working (Postman tested)
- [ ] Docker container running
- [ ] Celery job system running

**Testing**: Unit tests for models and API routes (70%+ coverage)

---

### Week 4: Frontend Foundation & API Continuation

**Owner**: Frontend Developer (parallel with backend Week 3)

**Tasks**:
1. **Next.js Project Setup** (4 hours)
   - Initialize Next.js 14 with App Router
   - Configure TailwindCSS and shadcn/ui
   - Set up Zustand state management
   - Create directory structure and utils

2. **Component Library** (8 hours)
   - Create base components: Button, Card, Badge, Modal, Input
   - Create layout components: Header, Sidebar, Footer
   - Create feed-specific components: ArticleCard, SourceChip, FilterPanel
   - Responsive mobile-first design for all

3. **Homepage/Feed Screen** (6 hours)
   - Build feed layout (infinite scroll)
   - Source cards with thumbs up/down placeholder
   - Basic filter UI (category dropdown)
   - Mobile responsive (test on 375px, 768px, 1920px)

4. **Backend - Additional Endpoints** (6 hours, Backend continuing)
   - GET /api/feed (articles with pagination, filters)
   - GET /api/feed/search (search articles)
   - GET /api/categories (list all categories)
   - POST /api/preferences (store user preferences)

**Deliverables**:
- [ ] Next.js app running locally
- [ ] Component library implemented
- [ ] Homepage renders with mock data
- [ ] Responsive on mobile/tablet/desktop
- [ ] Feed endpoints working in API

**Testing**: Component snapshot tests, integration tests

---

### Week 5: Data Integration & Source Management

**Owner**: Backend Developer + Data Engineer

**Tasks**:
1. **Data Collectors Implementation** (12 hours total, shared)
   - ArXiv collector (batch fetch papers daily)
   - GitHub collector (trending repos)
   - Twitter/X collector (API v2 integration)
   - RSS feed collector (news, blog posts)
   - Reddit collector (subreddit monitoring)

2. **Data Normalization** (8 hours)
   - Create transformer for each source type
   - Normalize to unified schema
   - Handle date/timezone conversion
   - Unicode/emoji support

3. **Deduplication Logic** (6 hours)
   - Implement duplicate detection (title + URL hash)
   - Create update strategy for existing items
   - Handle source quality scoring

4. **Frontend - Source Manager** (6 hours, Frontend parallel)
   - UI for adding new sources
   - Source list with rating selector
   - Toggle active/inactive sources
   - Display current data refresh status

**Deliverables**:
- [ ] Real data collecting from 5+ sources
- [ ] Normalization working
- [ ] Feed showing real articles
- [ ] Source management UI functional
- [ ] Data pipeline monitoring

**Testing**: Integration tests for data flow, unit tests for transformers

---

### Week 6: Testing, Optimization & Mobile Polish

**Owner**: Full Team + QA Tester

**Tasks**:
1. **Comprehensive Testing** (8 hours)
   - Unit test coverage >80%
   - Integration tests for all API endpoints
   - E2E tests for critical user flows (view feed, filter, rate source)
   - Mobile device testing (real phone/tablet simulation)

2. **Performance Optimization** (6 hours)
   - Measure load time (target <2s on 4G)
   - Enable database query caching
   - Implement Redis caching for feed
   - Image optimization and lazy loading

3. **Accessibility & Mobile UX** (6 hours)
   - WCAG 2.1 AA audit (Lighthouse)
   - Touch target sizes (minimum 44x44px)
   - Mobile navigation polish
   - Responsive typography

4. **Bug Fixes & Polish** (4 hours)
   - Fix test failures
   - Cross-browser testing (Chrome, Safari, Firefox)
   - Mobile browser testing
   - Error handling for edge cases

**Deliverables**:
- [ ] Test coverage report (>80%)
- [ ] Performance audit (< 2s load time)
- [ ] Accessibility report (0 critical issues)
- [ ] Bug tracker cleared
- [ ] MVP feature-complete

**Phase 2 Demo**: User reviews complete MVP on desktop and mobile

---

## 19. Phase 3: Feedback & Personalization (Weeks 7-8)

### Week 7: Feedback System & Ranking Algorithm

**Owner**: Backend Developer + ML Engineer + Frontend Developer

**Tasks**:
1. **Thumbs Up/Down UI** (4 hours)
   - Add feedback buttons to article cards
   - Animation and feedback (haptic on mobile)
   - Save feedback to backend API
   - Display user's feedback history (optional analytics)

2. **Preference Storage & Retrieval** (6 hours)
   - Create preferences table in PostgreSQL
   - Implement feedback API endpoints
   - Aggregate user feedback by source/category/topic
   - Create analytics queries

3. **Ranking Algorithm** (8 hours)
   - Implement weighted scoring:
     - Source rating (1-5 stars) - 30%
     - User feedback (thumbs up/down) - 40%
     - Recency (timestamp) - 20%
     - Category preference - 10%
   - Create ranking query
   - Cache rankings in Redis
   - Time-decay implementation (newer content weighted higher)

4. **Personalized Feed Endpoint** (4 hours)
   - GET /api/feed/personalized (ranked results)
   - PUT /api/feedback/{article_id} (thumbs up/down)
   - GET /api/analytics (user's stats)

**Deliverables**:
- [ ] Feedback buttons in UI
- [ ] Ranking algorithm working
- [ ] Preferences affecting feed order
- [ ] Analytics dashboard showing top sources/categories
- [ ] Performance: personalization <100ms

**Testing**: Unit tests for ranking logic, integration tests for feedback flow

---

### Week 8: Personalization Testing & Performance

**Owner**: QA Lead + Performance Engineer

**Tasks**:
1. **Personalization E2E Testing** (8 hours)
   - Test feedback persistence
   - Test ranking order changes with more feedback
   - Test category preferences
   - Test source quality impacts
   - Test multiple sessions

2. **Performance Testing** (6 hours)
   - Load testing (1000 concurrent users)
   - Personalization query optimization
   - Cache hit ratio monitoring
   - Database query optimization

3. **Mobile Performance** (4 hours)
   - Test on real mobile devices
   - Network throttling (4G simulation)
   - Battery/CPU impact assessment
   - Smooth animations and interactions

4. **Edge Cases & Bug Fixes** (2 hours)
   - Handle edge cases (no feedback yet, new sources, feed gaps)
   - Cross-browser testing
   - Error recovery testing

**Deliverables**:
- [ ] All personalization flows tested
- [ ] Performance report (personalization <100ms maintained)
- [ ] Load test results (1000 user capacity)
- [ ] Mobile performance validated
- [ ] Zero critical bugs

**Phase 3 Sign-Off**: User validates personalization working as intended

---

## 20. Phase 4: Production Deployment (Week 9)

### Week 9: Security, Deployment & Launch

**Owner**: DevOps Engineer + Security Specialist + QA Lead

**Tasks**:
1. **Security Audit & Hardening** (6 hours)
   - OWASP top 10 vulnerability scan
   - Dependency vulnerability check
   - SQL injection testing
   - XSS vulnerability testing
   - Rate limiting configuration
   - Secrets management setup (AWS Secrets Manager)

2. **AWS Deployment Setup** (8 hours)
   - Create RDS PostgreSQL instance (multi-AZ)
   - Create ElastiCache Redis instance
   - Create EC2 auto-scaling group for FastAPI
   - Create S3 buckets if needed
   - Configure CloudFront CDN
   - Set up Route 53 DNS
   - Configure security groups and VPC

3. **CI/CD Pipeline** (6 hours)
   - GitHub Actions workflow for tests
   - Automated deploy to staging
   - Pre-deployment tests
   - Automated deploy to production
   - Rollback procedure documentation

4. **Monitoring & Alerting** (4 hours)
   - CloudWatch dashboards (CPU, memory, database)
   - Log aggregation and filtering
   - Error alerts (Slack notifications)
   - Performance alerts (API response time)
   - Uptime monitoring

**Deliverables**:
- [ ] Security audit passed (0 critical issues)
- [ ] AWS infrastructure live
- [ ] CI/CD pipeline working
- [ ] Monitoring dashboards active
- [ ] Backup/recovery tested
- [ ] Documentation complete
- [ ] Launch checklist verified

**Phase 4 Final Sign-Off**: User approves production readiness

---

### Launch Day
- [ ] Run final smoke tests
- [ ] Verify monitoring active
- [ ] DNS cutover
- [ ] Monitor first 24 hours
- [ ] Customer support ready

---

## 21. Phase 5+: Multi-User Enhancement (Future)

### Not in Current Scope (MVP Single-User)
Future enhancements after Phase 4 production launch:

**User Authentication** (Week 10-11)
- Sign up/login with email
- JWT tokens
- Session management

**Multi-User Personalization** (Week 12)
- Per-user preferences in database
- Per-user feedback isolation
- Multi-user ranking algorithm

**Advanced Features** (Week 13+)
- Bookmark/save articles
- Email digests
- Mobile apps (React Native)
- Social sharing
- Trending insights dashboard
- ML-powered recommendations

---

**This document will be updated as we progress through each phase.**

*Created: March 28, 2026*
*Last Updated: Session End - Phase 1.0 Planning Complete*
*Status: READY FOR PHASE 1 EXECUTION*

