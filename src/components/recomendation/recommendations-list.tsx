'use client'

import { EmptyState } from "@/components/recomendation/empty-state"
import { SoftwareRecommendationCard } from "@/components/recomendation/software-recommendation-card"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { useState } from "react"

interface SoftwareRecommendation {
  name: string
  description: string
  logo: string
  tags: string[]
  category: string
  website: string
  isFree?: boolean
  isPopular?: boolean
}

interface RecommendationsListProps {
  recommendations: SoftwareRecommendation[]
}

export function RecommendationsList({ recommendations }: RecommendationsListProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredRecommendations = recommendations.filter((software) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = 
      software.name.toLowerCase().includes(searchLower) ||
      software.description.toLowerCase().includes(searchLower) ||
      software.category.toLowerCase().includes(searchLower) ||
      software.tags.some((tag) => tag.toLowerCase().includes(searchLower))

    return matchesSearch
  })

  return (
    <>
      {/* Search */}
      <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input 
            placeholder="Buscar software, categoría o tecnología..." 
            className="pl-10 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Software Grid or Empty State */}
      {filteredRecommendations.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-4">
          {filteredRecommendations.map((software, index) => (
            <SoftwareRecommendationCard key={index} {...software} />
          ))}
        </div>
      ) : (
        <EmptyState 
          onRefresh={() => setSearchTerm("")}
        />
      )}
    </>
  )
} 