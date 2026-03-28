# ThinkStream - API Specification (OpenAPI 3.0)

**Project**: ThinkStream - Centralized AI Tracker  
**Phase**: 1 Planning - API Design  
**Version**: 1.0.0  
**Base URL**: https://api.thinkstream.io/api

---

## OPENAPI 3.0 SPECIFICATION

```yaml
openapi: 3.0.0
info:
  title: ThinkStream API
  description: Centralized AI developments aggregation platform
  version: 1.0.0
  contact:
    name: ThinkStream Team
    url: https://thinkstream.io
  license:
    name: MIT

servers:
  - url: https://api.thinkstream.io/api
    description: Production API
  - url: http://localhost:8000/api
    description: Local development

tags:
  - name: Feed
    description: Article feed and search operations
  - name: Sources
    description: Data source management
  - name: Feedback
    description: User feedback and preferences
  - name: Categories
    description: Content categories
  - name: Analytics
    description: Usage statistics

paths:
  /feed:
    get:
      summary: Get article feed
      description: Retrieve paginated feed with optional filters and sorting
      tags:
        - Feed
      parameters:
        - name: category
          in: query
          description: Filter by category (research, development, people, companies, social, models, events)
          schema:
            type: string
          example: research
        - name: source_id
          in: query
          description: Filter by specific source
          schema:
            type: integer
          example: 1
        - name: search
          in: query
          description: Full-text search in title and content
          schema:
            type: string
          example: GPT-4
        - name: sort_by
          in: query
          description: Sort order (newest, trending, rating)
          schema:
            type: string
            enum: [newest, trending, rating]
          default: newest
        - name: page
          in: query
          description: Pagination page (1-indexed)
          schema:
            type: integer
            minimum: 1
          default: 1
        - name: limit
          in: query
          description: Items per page
          schema:
            type: integer
            minimum: 10
            maximum: 100
          default: 50
      responses:
        '200':
          description: Successful feed response
          headers:
            X-Total-Count:
              description: Total number of articles available
              schema:
                type: integer
            X-Page:
              description: Current page
              schema:
                type: integer
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Article'
                  pagination:
                    $ref: '#/components/schemas/Pagination'
              example:
                data:
                  - id: 12345
                    title: "GPT-4 Technical Report"
                    content: "..."
                    url: "https://openai.com/research/gpt-4"
                    category: research
                    author: OpenAI
                    published_at: "2024-03-27T10:00:00Z"
                    source:
                      id: 1
                      name: OpenAI Blog
                      rating: 5
                    metadata:
                      views: 10000
                      engagement: high
                pagination:
                  page: 1
                  limit: 50
                  total_count: 5000
                  total_pages: 100
        '400':
          $ref: '#/components/responses/BadRequest'
        '500':
          $ref: '#/components/responses/ServerError'

  /feed/search:
    get:
      summary: Full-text search articles
      description: Search articles by title, content, author, or source
      tags:
        - Feed
      parameters:
        - name: q
          in: query
          required: true
          description: Search query
          schema:
            type: string
          example: "neural networks"
        - name: filters
          in: query
          description: JSON filters (category, source_id, date_range)
          schema:
            type: string
          example: '{"category": "research", "date_from": "2024-01-01"}'
      responses:
        '200':
          description: Search results
          content:
            application/json:
              schema:
                type: object
                properties:
                  results:
                    type: array
                    items:
                      $ref: '#/components/schemas/Article'
                  query:
                    type: string
                  total_hits:
                    type: integer
        '400':
          $ref: '#/components/responses/BadRequest'

  /feed/personalized:
    get:
      summary: Get personalized feed (Phase 3+)
      description: Get feed ranked by user preferences and feedback
      tags:
        - Feed
      parameters:
        - name: page
          in: query
          schema:
            type: integer
          default: 1
        - name: limit
          in: query
          schema:
            type: integer
          default: 50
      responses:
        '200':
          description: Personalized feed
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Article'
                  personalization:
                    type: object
                    properties:
                      primary_categories:
                        type: array
                        items:
                          type: string
                      preferred_sources:
                        type: array
                        items:
                          type: string

  /feed/{id}:
    get:
      summary: Get article details
      description: Retrieve full details of a single article
      tags:
        - Feed
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
          example: 12345
      responses:
        '200':
          description: Article details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Article'
        '404':
          $ref: '#/components/responses/NotFound'

  /sources:
    get:
      summary: List all sources
      description: Retrieve all data sources with optional filters
      tags:
        - Sources
      parameters:
        - name: type
          in: query
          schema:
            type: string
            enum: [linkedin, twitter, github, arxiv, rss, reddit, blog]
          example: twitter
        - name: rating_min
          in: query
          description: Minimum source rating (1-5)
          schema:
            type: integer
            minimum: 1
            maximum: 5
        - name: active_only
          in: query
          description: Show only active sources
          schema:
            type: boolean
          default: true
      responses:
        '200':
          description: List of sources
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Source'
                  total_count:
                    type: integer
              example:
                data:
                  - id: 1
                    name: "OpenAI Blog"
                    type: "blog"
                    url: "https://openai.com/blog"
                    rating: 5
                    articles_count: 45
                    last_fetched_at: "2024-03-27T10:30:00Z"
                total_count: 47

    post:
      summary: Add new source (admin)
      description: Create a new data source (admin only)
      tags:
        - Sources
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [name, type, url]
              properties:
                name:
                  type: string
                  example: "@karpathy"
                type:
                  type: string
                  enum: [linkedin, twitter, github, arxiv, rss, reddit, blog]
                  example: twitter
                url:
                  type: string
                  format: uri
                  example: "https://twitter.com/karpathy"
                description:
                  type: string
                  example: "Andrej Karpathy's Twitter feed"
                rating:
                  type: integer
                  minimum: 1
                  maximum: 5
                  default: 3
      responses:
        '201':
          description: Source created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Source'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /sources/{id}:
    get:
      summary: Get source details
      tags:
        - Sources
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: Source details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Source'
        '404':
          $ref: '#/components/responses/NotFound'

    patch:
      summary: Update source
      description: Update source rating or active status
      tags:
        - Sources
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                rating:
                  type: integer
                  minimum: 1
                  maximum: 5
                active:
                  type: boolean
      responses:
        '200':
          description: Source updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Source'
        '404':
          $ref: '#/components/responses/NotFound'

    delete:
      summary: Delete source
      tags:
        - Sources
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '204':
          description: Source deleted
        '404':
          $ref: '#/components/responses/NotFound'

  /feedback/{article_id}:
    put:
      summary: Submit article feedback
      description: Add or update thumbs up/down feedback for an article
      tags:
        - Feedback
      parameters:
        - name: article_id
          in: path
          required: true
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [feedback]
              properties:
                feedback:
                  type: integer
                  enum: [-1, 0, 1]
                  description: "-1=thumbs_down, 0=remove, 1=thumbs_up"
                  example: 1
                reason:
                  type: string
                  description: Optional reason for feedback
                  enum: [relevant, duplicate, spam, not_interested, saved_for_later]
                  example: relevant
      responses:
        '200':
          description: Feedback recorded
          content:
            application/json:
              schema:
                type: object
                properties:
                  article_id:
                    type: integer
                  feedback:
                    type: integer
                  recorded_at:
                    type: string
                    format: date-time
        '404':
          $ref: '#/components/responses/NotFound'

    delete:
      summary: Remove feedback
      description: Remove feedback for an article
      tags:
        - Feedback
      parameters:
        - name: article_id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '204':
          description: Feedback removed
        '404':
          $ref: '#/components/responses/NotFound'

  /feedback/history:
    get:
      summary: Get user's feedback history
      description: Retrieve all feedback given by user
      tags:
        - Feedback
      parameters:
        - name: feedback_type
          in: query
          schema:
            type: integer
            enum: [-1, 1]
          example: 1
        - name: limit
          in: query
          schema:
            type: integer
          default: 100
      responses:
        '200':
          description: Feedback history
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      type: object
                      properties:
                        article_id:
                          type: integer
                        feedback:
                          type: integer
                        reason:
                          type: string
                        created_at:
                          type: string
                          format: date-time

  /categories:
    get:
      summary: List all categories
      description: Get available content categories
      tags:
        - Categories
      responses:
        '200':
          description: List of categories
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      type: object
                      properties:
                        id:
                          type: string
                        name:
                          type: string
                        description:
                          type: string
                        count:
                          type: integer
                          description: Article count in category
              example:
                data:
                  - id: research
                    name: "Research & Academia"
                    description: "Academic papers and research publications"
                    count: 1200
                  - id: development
                    name: "Development & Projects"
                    description: "Code repositories and open-source projects"
                    count: 800

  /categories/{category_id}:
    get:
      summary: Get articles in category
      description: Retrieve articles filtered by category
      tags:
        - Categories
      parameters:
        - name: category_id
          in: path
          required: true
          schema:
            type: string
          example: research
        - name: page
          in: query
          schema:
            type: integer
          default: 1
        - name: limit
          in: query
          schema:
            type: integer
          default: 50
      responses:
        '200':
          description: Category articles
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Article'
                  category:
                    type: string
                  pagination:
                    $ref: '#/components/schemas/Pagination'

  /preferences:
    get:
      summary: Get user preferences
      description: Retrieve current user preferences
      tags:
        - Feedback
      responses:
        '200':
          description: User preferences
          content:
            application/json:
              schema:
                type: object
                properties:
                  category_preferences:
                    type: object
                    additionalProperties:
                      type: number
                  source_preferences:
                    type: object
                    additionalProperties:
                      type: number
                  author_preferences:
                    type: object
                    additionalProperties:
                      type: number

    put:
      summary: Update preferences
      description: Set or update user preferences
      tags:
        - Feedback
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                category_weights:
                  type: object
                  additionalProperties:
                    type: number
                    description: Weight multiplier (0.0-5.0)
                source_weights:
                  type: object
                  additionalProperties:
                    type: number
              example:
                category_weights:
                  research: 1.5
                  models: 1.2
      responses:
        '200':
          description: Preferences updated

  /analytics/stats:
    get:
      summary: Get feed statistics
      description: Overall statistics about the feed
      tags:
        - Analytics
      responses:
        '200':
          description: Feed statistics
          content:
            application/json:
              schema:
                type: object
                properties:
                  total_articles:
                    type: integer
                  total_sources:
                    type: integer
                  avg_articles_per_day:
                    type: number
                  categories:
                    type: object
                    additionalProperties:
                      type: integer
                  last_updated:
                    type: string
                    format: date-time

  /analytics/top-sources:
    get:
      summary: Get most engaged sources
      description: Sources with highest engagement
      tags:
        - Analytics
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
          default: 10
        - name: period_days
          in: query
          description: Analysis period in days
          schema:
            type: integer
          default: 30
      responses:
        '200':
          description: Top sources
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      type: object
                      properties:
                        source_id:
                          type: integer
                        source_name:
                          type: string
                        thumbs_up_count:
                          type: integer
                        thumbs_down_count:
                          type: integer
                        engagement_ratio:
                          type: number

components:
  schemas:
    Article:
      type: object
      properties:
        id:
          type: integer
          example: 12345
        title:
          type: string
          example: "GPT-4 Technical Report"
        content:
          type: string
          description: Article summary or preview
        url:
          type: string
          format: uri
        category:
          type: string
          enum: [research, development, people, companies, social, models, events]
        author:
          type: string
        published_at:
          type: string
          format: date-time
        fetched_at:
          type: string
          format: date-time
        source:
          $ref: '#/components/schemas/Source'
        metadata:
          type: object
          properties:
            views:
              type: integer
            likes:
              type: integer
            engagement:
              type: string
              enum: [low, medium, high]
        user_feedback:
          type: integer
          enum: [-1, 0, 1]
          nullable: true
          description: User's feedback if exists (null if not provided)

    Source:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        type:
          type: string
          enum: [linkedin, twitter, github, arxiv, rss, reddit, blog]
        url:
          type: string
          format: uri
        description:
          type: string
        rating:
          type: integer
          minimum: 1
          maximum: 5
        active:
          type: boolean
        articles_count:
          type: integer
        last_fetched_at:
          type: string
          format: date-time
          nullable: true
        created_at:
          type: string
          format: date-time

    Pagination:
      type: object
      properties:
        page:
          type: integer
          example: 1
        limit:
          type: integer
          example: 50
        total_count:
          type: integer
          example: 5000
        total_pages:
          type: integer
          example: 100

  responses:
    BadRequest:
      description: Bad request
      content:
        application/json:
          schema:
            type: object
            properties:
              error:
                type: string
              details:
                type: string

    Unauthorized:
      description: Unauthorized access
      content:
        application/json:
          schema:
            type: object
            properties:
              error:
                type: string
                example: "Authentication required"

    NotFound:
      description: Resource not found
      content:
        application/json:
          schema:
            type: object
            properties:
              error:
                type: string
                example: "Article not found"

    ServerError:
      description: Internal server error
      content:
        application/json:
          schema:
            type: object
            properties:
              error:
                type: string
                example: "Internal server error"
              request_id:
                type: string
```

---

## API RATE LIMITING

```
Default Rate Limits (per IP):
├─ Read endpoints (GET): 100 requests/minute
├─ Write endpoints (POST, PUT): 10 requests/minute
├─ Search endpoints: 20 requests/minute
└─ Analytics endpoints: 5 requests/minute

Response Headers:
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2024-03-27T11:05:00Z

When limit exceeded: HTTP 429 Too Many Requests
```

---

## ERROR CODES

```
2xx Success:
├─ 200: OK
├─ 201: Created
└─ 204: No Content

4xx Client Errors:
├─ 400: Bad Request (validation failed)
├─ 401: Unauthorized (auth required)
├─ 403: Forbidden (permission denied)
├─ 404: Not Found (resource doesn't exist)
└─ 429: Too Many Requests (rate limit exceeded)

5xx Server Errors:
├─ 500: Internal Server Error
├─ 502: Bad Gateway
└─ 503: Service Unavailable
```

---

## AUTHENTICATION (Phase 5+)

```
JWT Bearer Token (future implementation):

Request:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response (on success):
HTTP 200
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}

Token Expiry: 1 hour
Refresh Token: 30 days
```

---

## NEXT STEPS

1. ✅ **Sources** - Complete
2. ✅ **Database Schema** - Complete
3. ✅ **System Architecture** - Complete
4. ✅ **API Specification** - This document
5. ⏳ **UI/UX Wireframes** - Week 2
6. ⏳ **Design System** - Week 2
7. ⏳ **AWS Architecture** - Week 2
8. ⏳ **Docker Setup** - Week 2

**Status**: Ready for UI/UX design  
**Owner**: Phase 1 Week 1 Completion
