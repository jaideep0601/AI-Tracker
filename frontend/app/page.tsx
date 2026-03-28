'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import FeedContainer from '@/components/Feed/FeedContainer'
import FilterBar from '@/components/Feed/FilterBar'
import StatsCard from '@/components/Common/StatsCard'
import { TrendingUp, Globe, Zap, BookOpen } from 'lucide-react'

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

interface Stats {
  total_articles: number
  total_sources: number
  total_categories: number
  research_papers: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [page, setPage] = useState(1)

  // Fetch feed and categories
  useEffect(() => {
    fetchFeed()
    if (categories.length === 0) {
      fetchCategories()
    }
  }, [page, selectedCategory])

  // Fetch stats
  useEffect(() => {
    fetchStats()
  }, [])

  const fetchFeed = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        limit: '10',
        offset: String((page - 1) * 10),
      })

      if (selectedCategory) {
        params.append('category', selectedCategory)
      }

      const response = await axios.get(`${API_URL}/feed?${params}`)
      setArticles(response.data.articles || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching feed:', err)
      if (axios.isAxiosError(err) && err.code === 'ERR_NETWORK') {
        setError(
          'Backend server is not running. Please run: docker-compose up --build'
        )
      } else {
        setError('Failed to load feed. Please try again.')
      }
      setArticles([])
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/analytics/stats`)
      setStats(response.data)
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`)
      setCategories(response.data.categories || [])
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSelectedCategory('')
      setPage(1)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(
        `${API_URL}/feed/search?q=${encodeURIComponent(searchQuery)}&limit=20`
      )
      setArticles(response.data.articles || [])
    } catch (err) {
      console.error('Search error:', err)
      setError('Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8">
        <h1 className="text-4xl font-bold mb-2">ThinkStream</h1>
        <p className="text-lg text-blue-100">
          Your centralized hub for AI developments - research, models, companies, people, and industry insights in one place
        </p>
      </div>

      {/* Stats Section */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label="Total Articles"
            value={stats.total_articles}
            icon={<TrendingUp className="text-blue-500" size={24} />}
          />
          <StatsCard
            label="Active Sources"
            value={stats.total_sources}
            icon={<Globe className="text-green-500" size={24} />}
          />
          <StatsCard
            label="Categories"
            value={stats.total_categories}
            icon={<Zap className="text-yellow-500" size={24} />}
          />
          <StatsCard
            label="Research Papers"
            value={stats.research_papers}
            icon={<BookOpen className="text-purple-500" size={24} />}
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded">
          <p className="font-semibold">⚠️ Connection Error</p>
          <p className="text-sm mt-1">{error}</p>
          <p className="text-sm mt-2 bg-red-100 px-3 py-2 rounded font-mono">
            docker-compose up --build
          </p>
        </div>
      )}

      {/* Category Filter */}
      {!error && (
        <FilterBar
          selectedCategory={selectedCategory}
          onCategoryChange={(cat) => {
            setSelectedCategory(cat)
            setPage(1)
            setSearchQuery('')
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categories={categories}
          onSearchSubmit={handleSearch}
        />
      )}

      {/* Feed */}
      {!error && (
        <FeedContainer
          articles={articles}
          loading={loading}
          page={page}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}
