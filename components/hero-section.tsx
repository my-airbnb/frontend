"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Search, CalendarDays, Users, MapPin, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { useListingSearch } from "@/hooks/useListings"

export function HeroSection() {
  const router = useRouter()
  const [city, setCity] = useState("")
  const [debouncedCity, setDebouncedCity] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [guests, setGuests] = useState(1)
  const [openDates, setOpenDates] = useState(false)
  const [openMobileDates, setOpenMobileDates] = useState(false)

  const checkIn = dateRange?.from
  const checkOut = dateRange?.to

  // Debounce city input by 300 ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedCity(city.trim()), 300)
    return () => clearTimeout(timer)
  }, [city])

  // Fetch suggestions from Elasticsearch
  const { data: searchResults, isLoading: isSearching } = useListingSearch(
    debouncedCity,
    showSuggestions && debouncedCity.length >= 2
  )

  // Deduplicate by city+country
  const citySuggestions = useMemo(() => {
    if (!searchResults?.length) return []
    const seen = new Set<string>()
    return searchResults
      .filter(({ city: c, country }) => {
        const key = `${c.toLowerCase()}|${country.toLowerCase()}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .slice(0, 6)
      .map(({ city: c, country }) => ({ city: c, country }))
  }, [searchResults])

  const handleCitySelect = (selected: string) => {
    setCity(selected)
    setShowSuggestions(false)
  }

  const handleDateSelect = (range: DateRange | undefined) => {
    setDateRange(range)
    if (range?.from && range?.to) {
      setOpenDates(false)
      setOpenMobileDates(false)
    }
  }

  const handleSearch = () => {
    setShowSuggestions(false)
    const params = new URLSearchParams()
    if (city.trim()) params.set('city', city.trim())
    if (checkIn) params.set('checkIn', format(checkIn, 'yyyy-MM-dd'))
    if (checkOut) params.set('checkOut', format(checkOut, 'yyyy-MM-dd'))
    if (guests > 1) params.set('guests', String(guests))
    router.push(`/?${params.toString()}`)
  }

  const suggestionsVisible = showSuggestions && (isSearching || citySuggestions.length > 0)

  const SuggestionsDropdown = () =>
    suggestionsVisible ? (
      <div className="absolute left-0 right-0 top-full mt-1 z-[500] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {isSearching && citySuggestions.length === 0 ? (
          <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Searching…
          </div>
        ) : null}
        {citySuggestions.map(({ city: c, country }) => (
          <button
            key={`${c}|${country}`}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors text-left group"
            onMouseDown={(e) => { e.preventDefault(); handleCitySelect(c) }}
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-muted group-hover:bg-background transition-colors">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div>
              <span className="font-semibold">{c}</span>
              <span className="text-muted-foreground">, {country}</span>
            </div>
          </button>
        ))}
      </div>
    ) : null

  return (
    <section className="w-full border-b border-border bg-background px-4 py-4">
      <div className="mx-auto max-w-4xl">

        {/* Search Form */}
        <div className="rounded-2xl border border-border bg-card p-3 shadow-sm sm:p-4">

          {/* ── Mobile & Tablet Layout ── */}
          <div className="flex flex-col gap-3 lg:hidden">
            {/* Where — with autocomplete */}
            <div className="relative">
              <div className="rounded-xl bg-secondary/50 px-4 py-3">
                <Label className="text-xs font-semibold text-foreground">Where</Label>
                <Input
                  placeholder="Search destinations"
                  value={city}
                  onChange={(e) => { setCity(e.target.value); setShowSuggestions(true) }}
                  onFocus={() => city.length >= 2 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch()
                    if (e.key === 'Escape') setShowSuggestions(false)
                  }}
                  className="h-auto border-0 bg-transparent p-0 text-sm placeholder:text-muted-foreground focus-visible:ring-0"
                />
              </div>
              <SuggestionsDropdown />
            </div>

            <Popover open={openMobileDates} onOpenChange={setOpenMobileDates}>
              <div className="grid grid-cols-2 gap-3">
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
              </div>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={handleDateSelect}
                  disabled={(date) => date < new Date()}
                  numberOfMonths={1}
                />
              </PopoverContent>
            </Popover>

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

          {/* ── Desktop Layout ── */}
          <div className="hidden lg:flex lg:items-center lg:gap-1">
            {/* Where — with autocomplete */}
            <div className="relative flex-1">
              <div className="rounded-xl px-4 py-3 hover:bg-secondary/50">
                <Label className="text-xs font-semibold text-foreground">Where</Label>
                <Input
                  placeholder="Search destinations"
                  value={city}
                  onChange={(e) => { setCity(e.target.value); setShowSuggestions(true) }}
                  onFocus={() => city.length >= 2 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch()
                    if (e.key === 'Escape') setShowSuggestions(false)
                  }}
                  className="h-auto border-0 bg-transparent p-0 text-sm placeholder:text-muted-foreground focus-visible:ring-0"
                />
              </div>
              <SuggestionsDropdown />
            </div>

            <div className="h-10 w-px bg-border" />

            <Popover open={openDates} onOpenChange={setOpenDates}>
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
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={handleDateSelect}
                  disabled={(date) => date < new Date()}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            <div className="h-10 w-px bg-border" />

            <button
              className="rounded-xl px-4 py-3 text-left hover:bg-secondary/50"
              onClick={() => setOpenDates(true)}
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                Check out
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {checkOut ? format(checkOut, "MMM dd") : "Add dates"}
              </p>
            </button>

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
