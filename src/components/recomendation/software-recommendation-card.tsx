"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ExternalLink } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

interface SoftwareRecommendationCardProps {
  name: string
  description: string
  logo: string
  tags: string[]
  category: string
  website: string
  isFree?: boolean
  isPopular?: boolean
}

export function SoftwareRecommendationCard({
  name,
  description,
  logo,
  tags,
  category,
  website,
  isFree = false,
  isPopular = false,
}: SoftwareRecommendationCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="bg-white border-2 border-gray-200 dark:bg-black dark:border-gray-700 rounded-2xl p-6 text-gray-900 dark:text-white relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-blue-500/5 dark:from-gray-500/10 rounded-2xl"></div>

      {/* Animated background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-500/10 to-blue-500/10 dark:from-gray-500/20  rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 p-2 flex items-center justify-center border-2 border-gray-400/40 group-hover:border-gray-300 transition-colors duration-300">
                <Image
                  src={logo || "/placeholder.svg?height=48&width=48"}
                  alt={`${name} logo`}
                  width={48}
                  height={48}
                  className="w-12 h-12 object-contain"
                />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold  transition-colors duration-300">
                {name}
              </h3>
              <p className="text-gray-600/60 dark:text-gray-300 font-medium text-sm">{category}</p>
              {isFree && <Badge className="bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30 mt-1">Gratis</Badge>}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isPopular && <Badge className="bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30 hover:bg-orange-500/30">Popular</Badge>}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">{description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* Action Button */}
        <div className="w-full flex justify-center bg-r">
          <Button
            size="sm"
            className="bg-gray-600/10 dark:bg-gray-600/50 dark:text-white hover:bg-gray-700/10 text-black flex items-center justify-center space-x-2 transform hover:scale-105 transition-all duration-200 hover:shadow-lg hover:shadow-gray-500/25 w-full"
            onClick={() => window.open(website, "_blank")}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <ExternalLink className={cn("w-4 h-4 transition-transform duration-200", isHovered && "rotate-12")} />
            <span>Visitar sitio</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
