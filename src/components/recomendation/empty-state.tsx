"use client"

import { Button } from "@/components/ui/button"
import { Package, RefreshCw, Search } from "lucide-react"

interface EmptyStateProps {
  title?: string
  description?: string
  showRefresh?: boolean
  onRefresh?: () => void
}

export function EmptyState({
  title = "No se encontró software recomendado",
  description = "No pudimos encontrar ningún software que coincida con tus criterios de búsqueda. Intenta ajustar los filtros o buscar con otros términos.",
  showRefresh = true,
  onRefresh,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-6">
        {/* Background circle */}
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        {/* Search icon overlay */}
        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full border-2 border-gray-100 flex items-center justify-center">
          <Search className="w-4 h-4 text-gray-500" />
        </div>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">{title}</h3>
      <p className="text-gray-600 text-center max-w-md mb-6 leading-relaxed">{description}</p>

      {showRefresh && (
        <Button
          variant="outline"
          onClick={onRefresh}
          className="flex items-center space-x-2 hover:scale-105 transition-transform duration-200"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Limpiar filtros</span>
        </Button>
      )}
    </div>
  )
}
