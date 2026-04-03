import React, { useState, useEffect } from 'react'
import { X, Plus, Edit2, Trash2, RefreshCw, CheckSquare, Square } from 'lucide-react'
import axios from 'axios'

interface Source {
  id: number
  name: string
  type: string
  url: string
  rating: number
  active: boolean
}

interface SourceManagerProps {
  isOpen: boolean
  onClose: () => void
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

const FEED_REFRESH = 'thinkstream:feed-refresh'

export default function SourceManager({ isOpen, onClose }: SourceManagerProps) {
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'blog',
    url: '',
    rating: 3,
  })

  useEffect(() => {
    if (isOpen) {
      fetchSources()
      setSyncMessage(null)
    }
  }, [isOpen])

  const fetchSources = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/sources`, {
        params: { active_only: false },
      })
      const list: Source[] = Array.isArray(response.data) ? response.data : []
      setSources(list)
      setSelectedIds(new Set(list.map((s) => s.id)))
    } catch (error) {
      console.error('Error fetching sources:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    setSelectedIds(new Set(sources.map((s) => s.id)))
  }

  const selectNone = () => {
    setSelectedIds(new Set())
  }

  const handleFetchNews = async () => {
    if (selectedIds.size === 0) {
      setSyncMessage('Select at least one source to load news.')
      return
    }
    setSyncing(true)
    setSyncMessage(null)
    try {
      const { data } = await axios.post(`${API_URL}/sources/fetch`, {
        source_ids: Array.from(selectedIds),
      })
      const failed = data.results?.filter((r: { ok: boolean }) => !r.ok) ?? []
      const ok = data.results?.filter((r: { ok: boolean }) => r.ok) ?? []
      setSyncMessage(
        `Imported ${data.total_inserted ?? 0} new article(s). ` +
          `${ok.length} source(s) synced OK` +
          (failed.length ? `, ${failed.length} had issues (see below).` : '.')
      )
      if (failed.length) {
        const lines = failed.map(
          (f: { name: string; error?: string }) =>
            `${f.name}: ${f.error || 'failed'}`
        )
        setSyncMessage((prev) => prev + '\n' + lines.join('\n'))
      }
      window.dispatchEvent(new CustomEvent(FEED_REFRESH))
    } catch (error) {
      console.error('Fetch news error:', error)
      setSyncMessage('Could not load news. Is the API running?')
    } finally {
      setSyncing(false)
    }
  }

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await axios.patch(`${API_URL}/sources/${editingId}`, {
          ...formData,
          rating: Number(formData.rating),
        })
      } else {
        const { data: created } = await axios.post(`${API_URL}/sources`, {
          ...formData,
          rating: Number(formData.rating),
          active: true,
        })
        setSelectedIds((prev) => new Set(prev).add(created.id))
        try {
          await axios.post(`${API_URL}/sources/fetch`, {
            source_ids: [created.id],
          })
          window.dispatchEvent(new CustomEvent(FEED_REFRESH))
          setSyncMessage(
            `Source added. Started loading articles from "${created.name}".`
          )
        } catch {
          setSyncMessage(
            `Source saved. Click "Load latest news" to pull articles (check the URL supports RSS or use arXiv/Reddit/GitHub).`
          )
        }
      }
      fetchSources()
      resetForm()
    } catch (error) {
      console.error('Error saving source:', error)
    }
  }

  const handleDeleteSource = async (id: number) => {
    if (confirm('Are you sure you want to remove this source?')) {
      try {
        await axios.delete(`${API_URL}/sources/${id}`)
        setSelectedIds((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
        fetchSources()
      } catch (error) {
        console.error('Error deleting source:', error)
      }
    }
  }

  const handleEditSource = (source: Source) => {
    setFormData({
      name: source.name,
      type: source.type,
      url: source.url,
      rating: source.rating,
    })
    setEditingId(source.id)
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'blog',
      url: '',
      rating: 3,
    })
    setEditingId(null)
    setShowForm(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold">Sources</h2>
            <p className="text-sm text-gray-600 mt-1">
              Select sources, then load the latest articles into your feed (RSS, arXiv, Reddit, GitHub releases).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleFetchNews}
                disabled={syncing || sources.length === 0}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
                {syncing ? 'Loading…' : 'Load latest news'}
              </button>
              <button
                type="button"
                onClick={selectAll}
                className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={selectNone}
                className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
              >
                Clear
              </button>
            </div>
            {!showForm && (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus size={18} />
                Add source
              </button>
            )}
          </div>

          {syncMessage && (
            <div className="text-sm bg-slate-50 border border-slate-200 rounded-lg p-3 whitespace-pre-wrap">
              {syncMessage}
            </div>
          )}

          {showForm && (
            <form onSubmit={handleAddSource} className="p-4 bg-gray-50 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Hugging Face Blog"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="blog">Blog / news site (RSS discovery)</option>
                    <option value="rss">RSS or Atom URL</option>
                    <option value="arxiv">arXiv (category or paper list URL)</option>
                    <option value="reddit">Reddit subreddit</option>
                    <option value="github">GitHub repository (releases)</option>
                    <option value="research">Research (RSS)</option>
                    <option value="news">News (RSS)</option>
                    <option value="company">Company (RSS)</option>
                    <option value="social">Social (RSS if available)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://…"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use a site homepage, direct RSS link, arXiv listing, subreddit URL, or GitHub repo URL.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quality (1–5)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={formData.rating}
                      onChange={(e) =>
                        setFormData({ ...formData, rating: Number(e.target.value) })
                      }
                      className="flex-1"
                    />
                    <span className="text-yellow-500 font-bold">{formData.rating}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {editingId ? 'Update' : 'Add'} source
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="text-center py-8">Loading sources…</div>
          ) : sources.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              No sources yet. Add a blog or RSS URL to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {sources.map((source) => {
                const checked = selectedIds.has(source.id)
                return (
                  <div
                    key={source.id}
                    className={`p-4 border rounded-lg transition ${
                      checked ? 'border-emerald-300 bg-emerald-50/40' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex gap-3 items-start">
                      <button
                        type="button"
                        onClick={() => toggleSelect(source.id)}
                        className="mt-1 text-emerald-700"
                        title={checked ? 'Exclude from sync' : 'Include in sync'}
                      >
                        {checked ? <CheckSquare size={22} /> : <Square size={22} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">{source.name}</h3>
                        <p className="text-sm text-gray-600 truncate">{source.url}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded capitalize">
                            {source.type}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              source.active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {source.active ? 'Active' : 'Inactive'}
                          </span>
                          <span className="text-yellow-600 text-xs">
                            {'★'.repeat(source.rating)}
                            {'☆'.repeat(5 - source.rating)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEditSource(source)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSource(source.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
