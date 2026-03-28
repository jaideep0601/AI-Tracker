'use client'

import React, { useState } from 'react'
import { Settings, Zap } from 'lucide-react'
import SourceManager from '@/components/Feed/SourceManager'

export default function Header() {
  const [showSourceManager, setShowSourceManager] = useState(false)

  return (
    <>
      <header className="sticky top-0 bg-white shadow-sm z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="text-blue-600" size={28} />
            <h1 className="text-2xl font-bold text-gray-900">ThinkStream</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSourceManager(true)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              title="Manage Sources"
            >
              <Settings size={20} />
              <span className="hidden sm:inline">Sources</span>
            </button>
          </div>
        </div>
      </header>

      <SourceManager
        isOpen={showSourceManager}
        onClose={() => setShowSourceManager(false)}
      />
    </>
  )
}
