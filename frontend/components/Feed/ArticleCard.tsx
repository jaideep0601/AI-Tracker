import React, { useState } from 'react'
import {
  ThumbsUp,
  ThumbsDown,
  Calendar,
  User,
  Tag,
  Bookmark,
} from 'lucide-react'
import axios from 'axios'

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

interface ArticleCardProps {
  article: Article
  bookmarked: boolean
  onBookmarkChange: (articleId: number, saved: boolean) => void
}

export default function ArticleCard({
  article,
  bookmarked,
  onBookmarkChange,
}: ArticleCardProps) {
  const [feedback, setFeedback] = useState<1 | -1 | 0>(0)
  const [loading, setLoading] = useState(false)
  const [bmLoading, setBmLoading] = useState(false)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

  const handleFeedback = async (value: 1 | -1) => {
    setLoading(true)
    try {
      await axios.put(`${apiUrl}/feedback/${article.id}`, {
        feedback: value,
      })
      setFeedback(value)
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleBookmark = async () => {
    setBmLoading(true)
    try {
      if (bookmarked) {
        await axios.delete(`${apiUrl}/bookmarks/${article.id}`)
        onBookmarkChange(article.id, false)
      } else {
        await axios.post(`${apiUrl}/bookmarks/${article.id}`)
        onBookmarkChange(article.id, true)
      }
    } catch (error) {
      console.error('Bookmark failed:', error)
    } finally {
      setBmLoading(false)
    }
  }

  const publicationDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—'

  const getStarRating = (rating: number) => {
    return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating))
  }

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl font-bold text-blue-600 hover:text-blue-800 mb-2 block"
          >
            {article.title}
          </a>
          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
            <span className="font-semibold text-gray-800">
              {article.source?.name ?? 'Unknown source'}
            </span>
            {article.source && (
              <span className="text-yellow-500">
                {getStarRating(article.source.rating)}
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={toggleBookmark}
          disabled={bmLoading}
          title={bookmarked ? 'Remove bookmark' : 'Save article'}
          className={`shrink-0 p-2 rounded-lg border transition ${
            bookmarked
              ? 'bg-amber-100 border-amber-300 text-amber-800'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
          } ${bmLoading ? 'opacity-50' : ''}`}
        >
          <Bookmark
            size={22}
            className={bookmarked ? 'fill-amber-600 text-amber-800' : ''}
          />
        </button>
      </div>

      <p className="text-gray-700 mb-4 line-clamp-3">{article.content}</p>

      <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Tag size={16} />
          <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            {article.category}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar size={16} />
          <span>{publicationDate}</span>
        </div>
        {article.author && (
          <div className="flex items-center gap-1">
            <User size={16} />
            <span>{article.author}</span>
          </div>
        )}
      </div>

      <div className="flex gap-3 items-center border-t pt-4 flex-wrap">
        <button
          type="button"
          onClick={() => handleFeedback(1)}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            feedback === 1
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <ThumbsUp size={18} />
          <span>Helpful</span>
        </button>
        <button
          type="button"
          onClick={() => handleFeedback(-1)}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            feedback === -1
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <ThumbsDown size={18} />
          <span>Not helpful</span>
        </button>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          Read more →
        </a>
      </div>
    </div>
  )
}
