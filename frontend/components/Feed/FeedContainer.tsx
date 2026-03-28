import React from 'react'
import ArticleCard from './ArticleCard'

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

interface FeedContainerProps {
  articles: Article[]
  loading: boolean
  page: number
  onPageChange: (page: number) => void
}

export default function FeedContainer({
  articles,
  loading,
  page,
  onPageChange,
}: FeedContainerProps) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300"
        >
          ← Previous
        </button>
        <span className="px-4 py-2 text-gray-700">Page {page}</span>
        <button
          onClick={() => onPageChange(page + 1)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
