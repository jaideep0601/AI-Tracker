import React from 'react'
import { Search, Filter, X } from 'lucide-react'

interface FilterBarProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  categories: string[]
  onSearchSubmit: () => void
}

export default function FilterBar({
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  categories,
  onSearchSubmit,
}: FilterBarProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchSubmit()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6 space-y-4">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2">
          <Search size={20} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-transparent outline-none text-gray-800"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <button
          onClick={onSearchSubmit}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Search size={18} />
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2">
        <Filter size={20} className="text-gray-600" />
        <span className="font-semibold text-gray-700">Filter by Category:</span>
        <div className="flex flex-wrap gap-2">
          <button
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
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`px-4 py-2 rounded-full text-sm transition ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
