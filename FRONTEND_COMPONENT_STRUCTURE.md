# Frontend Component Structure - ThinkStream

## Overview
The ThinkStream frontend is built with Next.js 14, React 18, and Tailwind CSS. It follows a component-based architecture with clear separation of concerns.

---

## Directory Structure

```
frontend/
├── app/
│   ├── layout.tsx           # Root layout with Header, Main, Footer
│   ├── page.tsx             # Homepage - main feed interface
│   └── globals.css          # Global Tailwind styles
├── components/
│   ├── Common/
│   │   ├── Header.tsx       # Navigation header with source manager button
│   │   ├── StatsCard.tsx    # Reusable stats display card
│   │   └── Footer.tsx       # Footer component (future)
│   └── Feed/
│       ├── FeedContainer.tsx    # Main feed container with pagination
│       ├── ArticleCard.tsx      # Individual article display card
│       ├── FilterBar.tsx        # Search and category filter controls
│       └── SourceManager.tsx    # Modal for managing sources
├── package.json
├── next.config.js
└── Dockerfile
```

---

## Component Details

### Common Components

#### Header.tsx
- **Purpose**: Top navigation bar with branding and controls
- **Features**:
  - ThinkStream logo and title
  - "Sources" button to open source manager modal
  - Sticky positioning
- **Props**: None (uses state for SourceManager)
- **Usage**: Imported in `app/layout.tsx`

#### StatsCard.tsx
- **Purpose**: Displays a metric with icon and value
- **Features**:
  - Icon support (Lucide React)
  - Hover effect
  - Responsive grid layout
- **Props**:
  - `label: string` - Card title
  - `value: number` - Metric value
  - `icon: React.ReactNode` - Lucide React icon component
- **Usage**: Multiple instances in `app/page.tsx` for stats grid

---

### Feed Components

#### FeedContainer.tsx
- **Purpose**: Container for article feed with pagination
- **Features**:
  - Displays articles in responsive grid
  - Loading state with spinner
  - Empty state message
  - Pagination buttons
  - Previous/Next navigation
- **Props**:
  - `articles: Article[]` - Array of article objects
  - `loading: boolean` - Loading indicator
  - `page: number` - Current page number
  - `onPageChange: (page: number) => void` - Pagination callback
- **Renders**: Uses `ArticleCard` component for each article

#### ArticleCard.tsx
- **Purpose**: Display individual article with metadata and interactions
- **Features**:
  - Article title linking to original URL
  - Source name and rating (1-5 stars)
  - Category badge
  - Publication date + author
  - Thumbs up/down feedback buttons
  - "Read More" link
  - Real-time feedback submission to API
- **Props**:
  - `article: Article` - Full article object with source data
- **State**:
  - `feedback: 1 | -1 | 0` - Current user feedback state
  - `loading: boolean` - Feedback submission state
- **API Integration**: 
  - `PUT /api/feedback/{article_id}` - Submit thumbs up/down

#### FilterBar.tsx
- **Purpose**: Search and category filtering interface
- **Features**:
  - Text search box with clear button
  - "All" + category filter buttons
  - Search submit on Enter key or button click
  - Active state styling
  - Responsive layout
- **Props**:
  - `selectedCategory: string` - Currently selected category filter
  - `onCategoryChange: (category: string) => void` - Category change callback
  - `searchQuery: string` - Current search text
  - `onSearchChange: (query: string) => void` - Search text update callback
  - `categories: string[]` - Available categories from API
  - `onSearchSubmit: () => void` - Search submission callback
- **Usage**: In `app/page.tsx` between stats and feed

#### SourceManager.tsx
- **Purpose**: Modal interface for managing content sources
- **Features**:
  - List all sources with quality ratings
  - Add new source form
  - Edit existing sources
  - Delete sources with confirmation
  - Source type selection (Research, GitHub, Social, News, Company)
  - Quality rating slider (1-5)
  - Active/Inactive status display
  - Form validation
- **Props**:
  - `isOpen: boolean` - Show/hide modal
  - `onClose: () => void` - Close callback
- **State**:
  - `sources: Source[]` - List of active sources
  - `showForm: boolean` - Show add/edit form
  - `editingId: number | null` - Currently editing source ID
  - `formData` - Form input state
- **API Integration**:
  - `GET /api/sources` - Fetch all sources
  - `POST /api/sources` - Add new source
  - `PATCH /api/sources/{id}` - Update source
  - `DELETE /api/sources/{id}` - Remove source

---

## Data Types

### Article
```typescript
interface Article {
  id: number
  title: string
  content: string
  url: string
  category: string
  author: string
  published_at: string
  source: {
    id: number
    name: string
    rating: number
  }
}
```

### Source
```typescript
interface Source {
  id: number
  name: string
  type: string
  url: string
  rating: number
  active: boolean
}
```

### Stats
```typescript
interface Stats {
  total_articles: number
  total_sources: number
  total_categories: number
  research_papers: number
}
```

---

## Styling Approach

### Tailwind CSS
- **Mobile-First Design**: Base styles for mobile, then `md:` and `lg:` breakpoints
- **Color System**:
  - Primary: Blue (`bg-blue-600`, `text-blue-600`)
  - Success: Green (`bg-green-600`)
  - Warning/Danger: Red/Yellow
  - Neutral: Gray scale

### Responsive Breakpoints
- **Mobile**: 0px - 767px (default Tailwind classes)
- **Tablet**: 768px - 1023px (`md:`)
- **Desktop**: 1024px+ (`lg:`)

### Common Patterns
- Cards: `bg-white rounded-lg shadow hover:shadow-lg`
- Buttons: `px-4 py-2 rounded-lg transition hover:` variants
- Input: `border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500`
- Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4`

---

## State Management

### Global State (Zustand - Optional Future Enhancement)
Currently, state is managed locally in components. For Phase 2+, consider adding Zustand for:
- User preferences (saved filters, category favorites)
- Feed state across page navigations
- Authentication state (Phase 5+)

### Local Component State
- Page.tsx: Feed, stats, loading, error, filters, pagination
- FeedContainer: Pagination UI state
- ArticleCard: Feedback submission state
- SourceManager: Form state, source list, edit mode

---

## API Integration

### Base URL
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
```

### Main Endpoints Used
- `GET /api/feed` - Fetch articles with pagination/filtering
- `GET /api/feed/search` - Search articles
- `GET /api/categories` - Get all categories
- `GET /api/analytics/stats` - Fetch statistics
- `GET /api/sources` - List sources
- `POST /api/sources` - Create source
- `PATCH /api/sources/{id}` - Update source
- `DELETE /api/sources/{id}` - Delete source
- `PUT /api/feedback/{article_id}` - Submit feedback

### HTTP Client
Uses **Axios** for all API requests with:
- Error handling for network failures
- Retry logic (optional future enhancement)
- Base URL configuration

---

## Accessibility Features

### Current Implementation
- Semantic HTML (buttons, links, headers)
- Focus states on interactive elements
- ARIA labels on icon-only buttons
- Color not sole method of info (uses text + color)
- Keyboard navigation support

### Future Enhancements (Phase 2+)
- ARIA live regions for dynamic content updates
- Skip to main content link
- Keyboard shortcuts documentation
- Enhanced screen reader support
- WCAG 2.1 AA compliance audit

---

## Performance Considerations

### Optimization Strategies
1. **Image Optimization**: Next.js Image component for responsive images
2. **Code Splitting**: Dynamic imports for modal components
3. **Lazy Loading**: Articles load on pagination
4. **Caching**: Browser cache + API response caching (Redis on backend)

### Metrics Targets
- First Contentful Paint: < 1.5s (4G)
- Largest Contentful Paint: < 2s (4G)
- Cumulative Layout Shift: < 0.1

---

## Development Workflow

### Adding a New Component

1. **Create file** in appropriate subdirectory:
   ```bash
   touch frontend/components/Feed/NewComponent.tsx
   ```

2. **Define interfaces** at top of file:
   ```typescript
   interface Props {
     // ...
   }
   ```

3. **Use functional component** with TypeScript:
   ```typescript
   export default function NewComponent(props: Props) {
     // ...
   }
   ```

4. **Import and use** in parent component:
   ```typescript
   import NewComponent from '@/components/Feed/NewComponent'
   ```

### Testing Components

1. **Manual testing**: `docker-compose up --build`
2. **Browser DevTools**: Chrome DevTools for responsive design
3. **Network throttling**: Simulate slow 4G networks
4. **Console**: Check for warnings/errors

### Common Tasks

**Add new data field to article card**:
- Update `Article` interface in `page.tsx`
- Add field to backend response
- Display in `ArticleCard.tsx`

**Add new category filter**:
- Already handled dynamically from API
- Categories fetch from `GET /api/categories`

**Change styling**:
- Update Tailwind classes in component
- Use `className={}` template literals for conditional styles
- Reference `global.css` for custom rules if needed

---

## Known Limitations & Future Work

### Current (Phase 1)
- ✅ Static article feed
- ✅ Basic filtering
- ❌ Infinite scroll (uses pagination)
- ❌ Offline mode
- ❌ Dark mode
- ❌ Mobile app

### Phase 2 Enhancements
- Infinite scroll implementation
- Real-time data updates (WebSocket)
- Bookmarking/saving articles
- Enhanced UI animations
- Dark mode toggle
- Advanced filtering (multiple selections)

### Phase 3+ Enhancements
- User authentication
- Personalized recommendations
- Email digest
- Trending insights dashboard
- Social sharing
- Export/import preferences

---

## Troubleshooting

### Components not rendering
- Check `next.config.js` API_URL environment variable
- Verify backend is running: `docker-compose ps`
- Check browser console for errors

### Styling not applying
- Restart dev server: `docker-compose down && docker-compose up --build`
- Clear Next.js cache: Check `.next/` folder
- Verify Tailwind config in `tailwind.config.js`

### API calls failing
- Check backend is running: `curl http://localhost:8000/api/health`
- Verify CORS headers from backend
- Check network tab in DevTools

---

## Next Steps

1. **Phase 1 Week 2**: Complete design system, additional UI refinements
2. **Phase 2**: Integrate real data collectors, optimize performance
3. **Phase 3**: Personalization algorithm, advanced recommendations
4. **Phase 4**: Production deployment to AWS

