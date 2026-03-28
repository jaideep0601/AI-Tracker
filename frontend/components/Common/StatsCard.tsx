import React from 'react'

interface StatsCardProps {
  label: string
  value: number | string
  icon?: React.ReactNode
}

export default function StatsCard({ label, value, icon }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        {icon && <div className="ml-4 flex-shrink-0">{icon}</div>}
      </div>
    </div>
  )
}
