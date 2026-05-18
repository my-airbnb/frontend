"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Search, CalendarDays, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"

export function HeroSection() {
  const router = useRouter()
  const [city, setCity] = useState("")
  const [checkIn, setCheckIn] = useState<Date>()
  const [checkOut, setCheckOut] = useState<Date>()
  const [guests, setGuests] = useState(1)
  const [openMobileCheckIn, setOpenMobileCheckIn] = useState(false)
  const [openMobileCheckOut, setOpenMobileCheckOut] = useState(false)
  const [openDesktopCheckIn, setOpenDesktopCheckIn] = useState(false)
  const [openDesktopCheckOut, setOpenDesktopCheckOut] = useState(false)

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (city.trim()) params.set('city', city.trim())
    if (checkIn) params.set('checkIn', format(checkIn, 'yyyy-MM-dd'))
    if (checkOut) params.set('checkOut', format(checkOut, 'yyyy-MM-dd'))
    if (guests > 1) params.set('guests', String(guests))
    router.push(`/?${params.toString()}`)
  }

  return (
    <section className="relative w-full overflow-hidden">
      {/* Background Image */}
      <div className="relative h-[550px] sm:h-[550px] lg:h-[600px]">
        <Image
          src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
          alt="Beautiful vacation destination"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-4 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-6xl">
          <span className="text-balance">Find your next</span>
          <br />
          <span className="text-primary">adventure</span>
        </h1>
        <p className="mb-8 max-w-xl text-base text-white/90 sm:text-lg">
          Discover unique places to stay around the world
        </p>

        {/* Search Form */}
        <div className="w-full max-w-4xl rounded-2xl bg-card p-3 shadow-2xl sm:p-4">
          {/* Mobile & Tablet Layout */}
          <div className="flex flex-col gap-3 lg:hidden">
            <div className="rounded-xl bg-secondary/50 px-4 py-3">
              <Label className="text-xs font-semibold text-foreground">Where</Label>
              <Input
                placeholder="Search destinations"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="h-auto border-0 bg-transparent p-0 text-sm placeholder:text-muted-foreground focus-visible:ring-0"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Popover open={openMobileCheckIn} onOpenChange={setOpenMobileCheckIn}>
                <PopoverTrigger asChild>
                  <button className="rounded-xl bg-secondary/50 px-4 py-3 text-left">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Check in
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {checkIn ? format(checkIn, "MMM dd") : "Add date"}
                    </p>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={checkIn} onSelect={(date) => { setCheckIn(date); setOpenMobileCheckIn(false) }} />
                </PopoverContent>
              </Popover>

              <Popover open={openMobileCheckOut} onOpenChange={setOpenMobileCheckOut}>
                <PopoverTrigger asChild>
                  <button className="rounded-xl bg-secondary/50 px-4 py-3 text-left">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Check out
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {checkOut ? format(checkOut, "MMM dd") : "Add date"}
                    </p>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar mode="single" selected={checkOut} onSelect={(date) => { setCheckOut(date); setOpenMobileCheckOut(false) }} />
                </PopoverContent>
              </Popover>
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <button className="rounded-xl bg-secondary/50 px-4 py-3 text-left">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Users className="h-3.5 w-3.5" />
                    Guests
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {guests} guest{guests > 1 ? "s" : ""}
                  </p>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-4" align="start">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Guests</span>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setGuests(Math.max(1, guests - 1))}>-</Button>
                    <span className="w-6 text-center font-medium">{guests}</span>
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setGuests(Math.min(16, guests + 1))}>+</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button size="lg" className="w-full rounded-xl gap-2 h-12" onClick={handleSearch}>
              <Search className="h-5 w-5" />
              Search
            </Button>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex lg:items-center lg:gap-1">
            <div className="flex-1 rounded-xl px-4 py-3 hover:bg-secondary/50">
              <Label className="text-xs font-semibold text-foreground">Where</Label>
              <Input
                placeholder="Search destinations"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="h-auto border-0 bg-transparent p-0 text-sm placeholder:text-muted-foreground focus-visible:ring-0"
              />
            </div>

            <div className="h-10 w-px bg-border" />

            <Popover open={openDesktopCheckIn} onOpenChange={setOpenDesktopCheckIn}>
              <PopoverTrigger asChild>
                <button className="rounded-xl px-4 py-3 text-left hover:bg-secondary/50">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Check in
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {checkIn ? format(checkIn, "MMM dd") : "Add dates"}
                  </p>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={checkIn} onSelect={(date) => { setCheckIn(date); setOpenDesktopCheckIn(false) }} />
              </PopoverContent>
            </Popover>

            <div className="h-10 w-px bg-border" />

            <Popover open={openDesktopCheckOut} onOpenChange={setOpenDesktopCheckOut}>
              <PopoverTrigger asChild>
                <button className="rounded-xl px-4 py-3 text-left hover:bg-secondary/50">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Check out
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {checkOut ? format(checkOut, "MMM dd") : "Add dates"}
                  </p>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={checkOut} onSelect={(date) => { setCheckOut(date); setOpenDesktopCheckOut(false) }} />
              </PopoverContent>
            </Popover>

            <div className="h-10 w-px bg-border" />

            <Popover>
              <PopoverTrigger asChild>
                <button className="rounded-xl px-4 py-3 text-left hover:bg-secondary/50">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Users className="h-3.5 w-3.5" />
                    Guests
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {guests} guest{guests > 1 ? "s" : ""}
                  </p>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-4" align="end">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Guests</span>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setGuests(Math.max(1, guests - 1))}>-</Button>
                    <span className="w-6 text-center font-medium">{guests}</span>
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setGuests(Math.min(16, guests + 1))}>+</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button size="lg" className="ml-2 h-14 rounded-xl px-6 gap-2" onClick={handleSearch}>
              <Search className="h-5 w-5" />
              <span>Search</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
