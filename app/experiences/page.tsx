"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star, Clock, Users, Search, Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import apiClient from "@/lib/axios"
import type { Experience } from "@/types"

const categories = [
  { id: "all", label: "All" },
  { id: "food", label: "Food & Drink" },
  { id: "outdoor", label: "Outdoor" },
  { id: "arts", label: "Arts" },
  { id: "tours", label: "Tours" },
  { id: "wellness", label: "Wellness" },
  { id: "sports", label: "Sports" },
]

const PLACEHOLDER = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80"

function formatDuration(minutes?: number) {
  if (!minutes) return ""
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

export default function ExperiencesPage() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({})

  const { data: experiences = [], isLoading, isError } = useQuery({
    queryKey: ["experiences"],
    queryFn: async (): Promise<Experience[]> => {
      const res = await apiClient.get<Experience[]>("/experiences")
      return Array.isArray(res.data) ? res.data : []
    },
    staleTime: 5 * 60 * 1000,
  })

  const filtered = experiences.filter((exp) => {
    const matchesCategory = activeCategory === "all" ||
      exp.category?.toLowerCase() === activeCategory
    const matchesSearch =
      exp.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.location?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-foreground lg:text-4xl">Experiences</h1>
            <p className="mt-2 text-muted-foreground">Unique activities hosted by locals around the world</p>
          </div>

          <div className="mb-8 space-y-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={activeCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(cat.id)}
                  className="rounded-full"
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>

          {isLoading && (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          )}

          {isError && (
            <div className="text-center py-20 text-muted-foreground">
              Failed to load experiences. Please try again later.
            </div>
          )}

          {!isLoading && !isError && filtered.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((exp) => (
                <Link key={exp.id} href={`/experiences/${exp.id}`}>
                  <article className="group">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                      <Image
                        src={imgErrors[exp.id] || !exp.photos?.[0] ? PLACEHOLDER : exp.photos[0]}
                        alt={exp.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        loading="lazy"
                        onError={() => setImgErrors((p) => ({ ...p, [exp.id]: true }))}
                      />
                      <div className="absolute bottom-3 left-3 rounded-full bg-card/95 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-sm shadow-sm">
                        ${exp.pricePerPerson} / person
                      </div>
                    </div>
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <span className="font-medium">New</span>
                        </div>
                        <span className="text-sm text-muted-foreground capitalize">{exp.category}</span>
                      </div>
                      <h3 className="font-semibold text-foreground line-clamp-1 group-hover:underline">
                        {exp.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{exp.location}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {exp.durationMinutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDuration(exp.durationMinutes)}
                          </span>
                        )}
                        {exp.maxGroupSize && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            Up to {exp.maxGroupSize}
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 text-6xl">🔍</div>
              <h3 className="text-xl font-semibold text-foreground">No experiences found</h3>
              <p className="mt-2 text-muted-foreground">Try adjusting your filters or search query</p>
              <Button variant="outline" className="mt-4" onClick={() => { setActiveCategory("all"); setSearchQuery("") }}>
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
