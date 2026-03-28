import React, { useState, useEffect } from 'react'
import { X, Plus, Edit2, Trash2, Star } from 'lucide-react'
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

export default function SourceManager({ isOpen, onClose }: SourceManagerProps) {
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'research',
    url: '',
    rating: 3,
  })

  useEffect(() => {
    if (isOpen) {
      fetchSources()
    }
  }, [isOpen])

  const fetchSources = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/sources`)
      setSources(response.data.sources || [])
    } catch (error) {
      console.error('Error fetching sources:', error)
    } finally {
      setLoading(false)
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
        await axios.post(`${API_URL}/sources`, {
          ...formData,
          rating: Number(formData.rating),
        })
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
      type: 'research',
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
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Manage Sources</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Add Button */}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus size={18} />
              Add New Source
            </button>
          )}

          {/* Add/Edit Form */}
          {showForm && (
            <form onSubmit={handleAddSource} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Source Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., OpenAI Blog"
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
                    <option value="research">Research</option>
                    <option value="github">GitHub</option>
                    <option value="social">Social Media</option>
                    <option value="news">News</option>
                    <option value="company">Company</option>
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
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quality Rating (1-5)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
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
                  {editingId ? 'Update' : 'Add'} Source
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

          {/* Sources List */}
          {loading ? (
            <div className="text-center py-8">Loading sources...</div>
          ) : sources.length === 0 ? (
            <div className="text-center py-8 text-gray-600">No sources added yet</div>
          ) : (
            <div className="space-y-3">
              {sources.map((source) => (
                <div
                  key={source.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{source.name}</h3>
                      <p className="text-sm text-gray-600">{source.url}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500">
                        {'★'.repeat(source.rating)}
                        {'☆'.repeat(5 - source.rating)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
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
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditSource(source)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteSource(source.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
