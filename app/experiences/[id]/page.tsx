"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Star, Clock, Users, MapPin, Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { toast } from "sonner"
import apiClient from "@/lib/axios"
import useAuthStore from "@/store/authStore"
import { useCreateBooking } from "@/hooks/useBookings"
import type { Experience } from "@/types"

const PLACEHOLDER = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80"

function formatDuration(minutes?: number) {
  if (!minutes) return ""
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} hr`
  return `${h} hr ${m} min`
}

export default function ExperienceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { isAuthenticated } = useAuthStore()
  const { mutateAsync: createBooking, isPending } = useCreateBooking()

  const [date, setDate] = useState<Date | undefined>()
  const [guests, setGuests] = useState(1)
  const [imgError, setImgError] = useState(false)

  const { data: experience, isLoading, isError } = useQuery({
    queryKey: ["experience", id],
    queryFn: async (): Promise<Experience> => {
      const res = await apiClient.get<Experience>(`/experiences/${id}`)
      return res.data
    },
    enabled: !!id,
  })

  const handleBook = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/experiences/${id}`)
      return
    }
    if (!date) {
      toast.error("Please select a date for the experience.")
      return
    }
    if (!experience) return

    const checkIn = format(date, "yyyy-MM-dd")
    // Experiences are single-day; use same date as checkOut so booking service accepts it
    const checkOut = format(date, "yyyy-MM-dd")

    try {
      const booking = await createBooking({
        experienceId: experience.id,
        type: "EXPERIENCE",
        checkIn,
        checkOut,
        nbGuests: guests,
        totalPrice: experience.pricePerPerson * guests,
      })
      router.push(`/checkout/${booking.id}`)
    } catch {
      toast.error("Failed to create booking. Please try again.")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    )
  }

  if (isError || !experience) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <p className="text-5xl mb-4">😕</p>
          <h2 className="text-2xl font-semibold mb-4">Experience not found</h2>
          <Button asChild><Link href="/experiences">Browse experiences</Link></Button>
        </div>
        <Footer />
      </div>
    )
  }

  const cover = !imgError && experience.photos?.[0] ? experience.photos[0] : PLACEHOLDER
  const total = experience.pricePerPerson * guests

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="ghost" size="sm" className="mb-6" asChild>
            <Link href="/experiences"><ArrowLeft className="mr-2 h-4 w-4" />All experiences</Link>
          </Button>

          <div className="relative aspect-[16/7] overflow-hidden rounded-2xl mb-8">
            <Image
              src={cover}
              alt={experience.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority
              onError={() => setImgError(true)}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h1 className="text-3xl font-bold mb-3">{experience.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-foreground text-foreground" />New</span>
                  {experience.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{experience.location}</span>}
                  {experience.durationMinutes && <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{formatDuration(experience.durationMinutes)}</span>}
                  {experience.maxGroupSize && <span className="flex items-center gap-1"><Users className="h-4 w-4" />Up to {experience.maxGroupSize} guests</span>}
                </div>
              </div>

              {experience.description && (
                <div className="pb-6 border-b border-border">
                  <h2 className="text-xl font-semibold mb-4">About this experience</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{experience.description}</p>
                </div>
              )}

              {experience.whatIncluded && (
                <div className="pb-6 border-b border-border">
                  <h2 className="text-xl font-semibold mb-4">What&apos;s included</h2>
                  <p className="text-muted-foreground leading-relaxed">{experience.whatIncluded}</p>
                </div>
              )}

              {experience.whatToBring && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">What to bring</h2>
                  <p className="text-muted-foreground leading-relaxed">{experience.whatToBring}</p>
                </div>
              )}
            </div>

            {/* Booking card */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-2xl shadow-lg p-6 lg:sticky lg:top-24">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <span className="text-2xl font-bold">${experience.pricePerPerson}</span>
                    <span className="text-muted-foreground text-sm"> / person</span>
                  </div>
                  <span className="text-sm text-muted-foreground capitalize">{experience.category}</span>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-border px-4 py-3">
                    <div className="text-xs font-bold uppercase tracking-wider mb-1">Date</div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="w-full text-left text-sm text-muted-foreground">
                          {date ? format(date, "MMM d, yyyy") : "Select a date"}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          disabled={(d) => d < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="rounded-xl border border-border px-4 py-3">
                    <div className="text-xs font-bold uppercase tracking-wider mb-1">Guests</div>
                    <div className="flex items-center justify-between">
                      <input
                        type="number"
                        value={guests}
                        onChange={(e) => setGuests(Math.min(experience.maxGroupSize || 16, Math.max(experience.minGroupSize || 1, Number(e.target.value))))}
                        min={experience.minGroupSize || 1}
                        max={experience.maxGroupSize || 16}
                        className="text-sm bg-transparent outline-none w-20 font-medium"
                      />
                      <span className="text-xs text-muted-foreground">Max {experience.maxGroupSize || 16}</span>
                    </div>
                  </div>

                  <Button className="w-full h-12 text-base" onClick={handleBook} disabled={isPending}>
                    {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Booking...</> : isAuthenticated ? "Book Experience" : "Log in to Book"}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">You won&apos;t be charged yet</p>

                  {date && (
                    <>
                      <Separator />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>${experience.pricePerPerson} × {guests} guest{guests !== 1 ? "s" : ""}</span>
                        <span>${total.toLocaleString()}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>${total.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
