import React, { useEffect, useRef } from 'react'
import ArticleCard from './ArticleCard'

interface Article {
  id: number
  title: string
  content: string
  url: string
  category: string
  author: string
  published_at: string
  source?: {
    id: number
    name: string
    rating: number
  }
}

interface FeedContainerProps {
  articles: Article[]
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  onLoadMore: () => void
  bookmarkedIds: Set<number>
  onBookmarkChange: (articleId: number, saved: boolean) => void
  infiniteScroll: boolean
}

export default function FeedContainer({
  articles,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  bookmarkedIds,
  onBookmarkChange,
  infiniteScroll,
}: FeedContainerProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!infiniteScroll || !hasMore) return
    const el = sentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry?.isIntersecting && !loadingMore && hasMore) {
          onLoadMore()
        }
      },
      { rootMargin: '240px', threshold: 0 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [infiniteScroll, hasMore, loadingMore, onLoadMore])

  if (loading && articles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-block">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
          <p className="text-gray-600 mt-4">Loading articles...</p>
        </div>
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-600">No articles found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            bookmarked={bookmarkedIds.has(article.id)}
            onBookmarkChange={onBookmarkChange}
          />
        ))}
      </div>

      {infiniteScroll && hasMore && (
        <div
          ref={sentinelRef}
          className="h-12 flex items-center justify-center text-gray-500 text-sm"
          aria-hidden
        >
          {loadingMore ? (
            <span className="inline-flex items-center gap-2">
              <span className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent" />
              Loading more…
            </span>
          ) : (
            <span className="opacity-60">Scroll for more</span>
          )}
        </div>
      )}

      {!infiniteScroll && (
        <p className="text-center text-sm text-gray-500 py-4">
          End of search results
        </p>
      )}
    </div>
  )
}
