"use client"

import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Star, Clock, Users, MapPin, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

const experiences: Record<string, {
  id: string
  title: string
  location: string
  image: string
  price: number
  rating: number
  reviewCount: number
  duration: string
  maxGuests: number
  category: string
  host: string
  hostAvatar: string
  description: string
  includes: string[]
  highlights: string[]
  reviews: { author: string; rating: number; comment: string; date: string }[]
}> = {
  "1": {
    id: "1",
    title: "Wine Tasting in Napa Valley",
    location: "Napa, California",
    image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1200&q=80",
    price: 150,
    rating: 4.98,
    reviewCount: 234,
    duration: "3 hours",
    maxGuests: 8,
    category: "food",
    host: "Marcus",
    hostAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
    description: "Join me for an intimate wine tasting experience in the heart of Napa Valley. We'll visit three boutique wineries, tasting carefully selected wines while I share the stories behind each bottle — the grapes, the terroir, and the winemakers. This is not a typical tourist wine tour; it's a deep dive into what makes Napa's wines truly special.",
    includes: ["Transportation between wineries", "6 wine tastings", "Cheese and charcuterie pairing", "Take-home bottle", "Expert guided commentary"],
    highlights: ["Visit 3 exclusive boutique wineries", "Meet the winemakers", "Stunning vineyard views", "Small group (max 8)"],
    reviews: [
      { author: "Sarah M.", rating: 5, comment: "Absolutely incredible experience! Marcus clearly knows and loves wine. The wineries we visited were off the beaten path — places I never would have found on my own.", date: "March 2026" },
      { author: "Tom K.", rating: 5, comment: "The perfect birthday gift for my wife. Marcus made everyone feel welcome and his knowledge is exceptional.", date: "February 2026" },
    ],
  },
  "2": {
    id: "2",
    title: "Sunrise Yoga on the Beach",
    location: "Malibu, California",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80",
    price: 45,
    rating: 4.95,
    reviewCount: 189,
    duration: "1.5 hours",
    maxGuests: 15,
    category: "wellness",
    host: "Luna",
    hostAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    description: "Start your day with an invigorating yoga session on the shores of Malibu as the sun rises over the Pacific. This all-levels class is designed to energize your body and calm your mind. No experience needed — just bring yourself and an open heart.",
    includes: ["Yoga mat provided", "Herbal tea after class", "Meditation session", "Breathwork guide"],
    highlights: ["All levels welcome", "Breathtaking ocean views", "Small intimate group", "Certified instructor"],
    reviews: [
      { author: "Emma L.", rating: 5, comment: "Luna is a magical teacher. The sunrise, the sound of waves, the gentle flow — I've never felt so peaceful.", date: "April 2026" },
    ],
  },
  "3": {
    id: "3",
    title: "Street Art Walking Tour",
    location: "Brooklyn, New York",
    image: "https://images.unsplash.com/photo-1569545568164-e4c72e1a0b7e?w=1200&q=80",
    price: 35,
    rating: 4.92,
    reviewCount: 312,
    duration: "2 hours",
    maxGuests: 12,
    category: "arts",
    host: "Diego",
    hostAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    description: "Explore Brooklyn's vibrant street art scene with local artist Diego. From hidden murals to iconic pieces in Bushwick, you'll learn the history, techniques, and stories behind some of the city's most striking works. Diego has been painting the streets of Brooklyn for over a decade and knows every wall.",
    includes: ["Expert guide", "Art history context", "Map of key murals", "Photo opportunities"],
    highlights: ["Hidden gems off the tourist trail", "Meet local artists", "Bushwick Collective", "Williamsburg bridges"],
    reviews: [
      { author: "James R.", rating: 5, comment: "Diego is passionate, knowledgeable, and hilarious. We saw art I walk past every day but never really saw before.", date: "May 2026" },
      { author: "Priya S.", rating: 4, comment: "Great tour — very informative and fun. Would recommend bringing comfortable shoes!", date: "April 2026" },
    ],
  },
}

export default function ExperienceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const experience = experiences[id]

  if (!experience) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="text-6xl">🔍</div>
          <h2 className="text-2xl font-semibold">Experience not found</h2>
          <Button onClick={() => router.push('/experiences')}>Browse Experiences</Button>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <Link href="/experiences" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Experiences
          </Link>

          {/* Hero image */}
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-8">
            <Image src={experience.image} alt={experience.title} fill className="object-cover" priority sizes="(max-width: 1024px) 100vw, 896px" />
            <Badge className="absolute top-4 left-4 capitalize">{experience.category}</Badge>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">{experience.title}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {experience.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" /> {experience.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" /> Up to {experience.maxGuests} guests
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-1">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span className="font-medium">{experience.rating}</span>
                  <span className="text-muted-foreground">({experience.reviewCount} reviews)</span>
                </div>
              </div>

              <Separator />

              {/* Host */}
              <div className="flex items-center gap-4">
                <div className="relative h-14 w-14 rounded-full overflow-hidden bg-muted shrink-0">
                  <Image src={experience.hostAvatar} alt={experience.host} fill className="object-cover" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hosted by</p>
                  <p className="font-semibold text-foreground">{experience.host}</p>
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div>
                <h2 className="text-lg font-semibold mb-3">About this experience</h2>
                <p className="text-muted-foreground leading-relaxed">{experience.description}</p>
              </div>

              {/* Highlights */}
              <div>
                <h2 className="text-lg font-semibold mb-3">Highlights</h2>
                <ul className="space-y-2">
                  {experience.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* What's included */}
              <div>
                <h2 className="text-lg font-semibold mb-3">What&apos;s included</h2>
                <ul className="space-y-2">
                  {experience.includes.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              {/* Reviews */}
              <div>
                <h2 className="text-lg font-semibold mb-4">
                  <span className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-primary text-primary" />
                    {experience.rating} · {experience.reviewCount} reviews
                  </span>
                </h2>
                <div className="space-y-6">
                  {experience.reviews.map((review, i) => (
                    <div key={i}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                          {review.author[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{review.author}</p>
                          <p className="text-xs text-muted-foreground">{review.date}</p>
                        </div>
                        <div className="ml-auto flex items-center gap-0.5">
                          {[...Array(review.rating)].map((_, j) => (
                            <Star key={j} className="h-3 w-3 fill-primary text-primary" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Booking card */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-border bg-card shadow-lg p-6">
                <div className="mb-4">
                  <span className="text-2xl font-bold">${experience.price}</span>
                  <span className="text-muted-foreground text-sm"> / person</span>
                </div>
                <div className="flex items-center gap-1 text-sm mb-6">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span className="font-medium">{experience.rating}</span>
                  <span className="text-muted-foreground">({experience.reviewCount} reviews)</span>
                </div>
                <div className="space-y-3 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" /> {experience.duration}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" /> Up to {experience.maxGuests} guests
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> {experience.location}
                  </div>
                </div>
                <Button className="w-full h-12 text-base" onClick={() => alert('Booking for experiences coming soon!')}>
                  Book Experience
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-3">You won&apos;t be charged yet</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
