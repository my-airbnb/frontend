"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star, Clock, Users, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"

const categories = [
  { id: "all", label: "All" },
  { id: "food", label: "Food & Drink" },
  { id: "outdoor", label: "Outdoor" },
  { id: "arts", label: "Arts" },
  { id: "tours", label: "Tours" },
  { id: "wellness", label: "Wellness" },
  { id: "sports", label: "Sports" },
]

const experiences = [
  {
    id: "1",
    title: "Wine Tasting in Napa Valley",
    location: "Napa, California",
    image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80",
    price: 150,
    rating: 4.98,
    reviewCount: 234,
    duration: "3 hours",
    maxGuests: 8,
    category: "food",
    host: "Marcus",
  },
  {
    id: "2",
    title: "Sunrise Yoga on the Beach",
    location: "Malibu, California",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
    price: 45,
    rating: 4.95,
    reviewCount: 189,
    duration: "1.5 hours",
    maxGuests: 15,
    category: "wellness",
    host: "Luna",
  },
  {
    id: "3",
    title: "Street Art Walking Tour",
    location: "Brooklyn, New York",
    image: "https://images.unsplash.com/photo-1569545568164-e4c72e1a0b7e?w=800&q=80",
    price: 35,
    rating: 4.92,
    reviewCount: 312,
    duration: "2 hours",
    maxGuests: 12,
    category: "arts",
    host: "Diego",
  },
  {
    id: "4",
    title: "Kayaking Adventure",
    location: "Seattle, Washington",
    image: "https://images.unsplash.com/photo-1472745942893-4b9f730c7668?w=800&q=80",
    price: 85,
    rating: 4.97,
    reviewCount: 167,
    duration: "4 hours",
    maxGuests: 6,
    category: "outdoor",
    host: "Jake",
  },
  {
    id: "5",
    title: "Authentic Italian Pasta Making",
    location: "San Francisco, California",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
    price: 95,
    rating: 4.99,
    reviewCount: 456,
    duration: "3 hours",
    maxGuests: 8,
    category: "food",
    host: "Nonna Maria",
  },
  {
    id: "6",
    title: "Rock Climbing for Beginners",
    location: "Boulder, Colorado",
    image: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80",
    price: 120,
    rating: 4.94,
    reviewCount: 98,
    duration: "5 hours",
    maxGuests: 4,
    category: "sports",
    host: "Alex",
  },
]

export default function ExperiencesPage() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredExperiences = experiences.filter((exp) => {
    const matchesCategory = activeCategory === "all" || exp.category === activeCategory
    const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          exp.location.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-foreground lg:text-4xl">Experiences</h1>
            <p className="mt-2 text-muted-foreground">
              Unique activities hosted by locals around the world
            </p>
          </div>

          {/* Search and Filters */}
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

          {/* Experiences Grid */}
          {filteredExperiences.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredExperiences.map((experience) => (
                <Link key={experience.id} href={`/experiences/${experience.id}`}>
                  <article className="group">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                      <Image
                        src={experience.image}
                        alt={experience.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        loading="lazy"
                      />
                      <div className="absolute bottom-3 left-3 rounded-full bg-card/95 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-sm shadow-sm">
                        ${experience.price} / person
                      </div>
                    </div>
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <span className="font-medium">{experience.rating}</span>
                          <span className="text-muted-foreground">({experience.reviewCount})</span>
                        </div>
                        <span className="text-sm text-muted-foreground capitalize">{experience.category}</span>
                      </div>
                      <h3 className="font-semibold text-foreground line-clamp-1 group-hover:underline">
                        {experience.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{experience.location}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {experience.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          Up to {experience.maxGuests}
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 text-6xl">🔍</div>
              <h3 className="text-xl font-semibold text-foreground">No experiences found</h3>
              <p className="mt-2 text-muted-foreground">
                Try adjusting your filters or search query
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setActiveCategory("all")
                  setSearchQuery("")
                }}
              >
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
