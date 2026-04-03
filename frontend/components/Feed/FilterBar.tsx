import React from 'react'
import { Search, Filter, X, Sparkles, Bookmark } from 'lucide-react'

interface FilterBarProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  categories: string[]
  onSearchSubmit: () => void
  sort: 'recent' | 'personalized'
  onSortChange: (sort: 'recent' | 'personalized') => void
  savedOnly: boolean
  onSavedOnlyChange: (value: boolean) => void
}

export default function FilterBar({
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  categories,
  onSearchSubmit,
  sort,
  onSortChange,
  savedOnly,
  onSavedOnlyChange,
}: FilterBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchSubmit()
    }
  }

  const label = (id: string) =>
    id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6 space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-purple-600 shrink-0" />
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Sort:</span>
          <select
            value={sort}
            onChange={(e) =>
              onSortChange(e.target.value as 'recent' | 'personalized')
            }
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            aria-label="Feed sort order"
          >
            <option value="recent">Most recent</option>
            <option value="personalized">For you (ranked)</option>
          </select>
        </div>
        <button
          type="button"
          onClick={() => onSavedOnlyChange(!savedOnly)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition ${
            savedOnly
              ? 'bg-amber-100 border-amber-300 text-amber-900'
              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Bookmark size={18} className={savedOnly ? 'fill-amber-600 text-amber-700' : ''} />
          Saved only
        </button>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2">
          <Search size={20} className="text-gray-500 shrink-0" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-gray-800 min-w-0"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="text-gray-500 hover:text-gray-700 shrink-0"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onSearchSubmit}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shrink-0"
        >
          <Search size={18} />
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>

      <div className="flex items-start gap-2">
        <Filter size={20} className="text-gray-600 shrink-0 mt-1" />
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-gray-700 block mb-2">Category</span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onCategoryChange('')}
              className={`px-4 py-2 rounded-full text-sm transition ${
                selectedCategory === ''
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                type="button"
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`px-4 py-2 rounded-full text-sm transition ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {label(category)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
