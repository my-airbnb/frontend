"use client"

import { useState, useRef } from "react"
import { 
  Waves, Mountain, Trees, Building2, Home, 
  Droplets, Castle, Palmtree, SlidersHorizontal,
  ChevronLeft, ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const categories = [
  { id: "beachfront", label: "Beachfront", icon: Waves },
  { id: "mountains", label: "Mountains", icon: Mountain },
  { id: "countryside", label: "Countryside", icon: Trees },
  { id: "city", label: "City", icon: Building2 },
  { id: "cabins", label: "Cabins", icon: Home },
  { id: "pools", label: "Pools", icon: Droplets },
  { id: "castles", label: "Castles", icon: Castle },
  { id: "islands", label: "Islands", icon: Palmtree },
]

export function CategoryFilters() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      })
    }
  }

  return (
    <div className="sticky top-16 z-40 w-full border-b border-border bg-card py-3">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center gap-2">
          {/* Scroll left button - desktop only */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex h-8 w-8 shrink-0"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Categories */}
          <div 
            ref={scrollRef}
            className="flex items-center gap-4 overflow-x-auto scrollbar-hide flex-1 touch-pan-x"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {categories.map((category) => {
              const Icon = category.icon
              const isActive = activeCategory === category.id
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(isActive ? null : category.id)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 py-2 min-w-[60px] text-muted-foreground",
                    isActive && "text-foreground"
                  )}
                >
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl",
                    isActive ? "bg-primary text-primary-foreground" : "bg-secondary"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium whitespace-nowrap">{category.label}</span>
                  {isActive && (
                    <div className="h-0.5 w-6 rounded-full bg-primary" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Scroll right button - desktop only */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex h-8 w-8 shrink-0"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Filters Button */}
          <Button variant="outline" className="hidden md:flex gap-2 shrink-0 ml-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>
    </div>
  )
}
