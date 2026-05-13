'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiSearch } from 'react-icons/fi'

interface SearchBarProps {
  initialCity?: string
  initialCheckIn?: string
  initialCheckOut?: string
  initialGuests?: number
  compact?: boolean
}

const SearchBar = ({
  initialCity = '',
  initialCheckIn = '',
  initialCheckOut = '',
  initialGuests = 1,
  compact = false,
}: SearchBarProps) => {
  const router = useRouter()
  const [city, setCity] = useState(initialCity)
  const [checkIn, setCheckIn] = useState(initialCheckIn)
  const [checkOut, setCheckOut] = useState(initialCheckOut)
  const [guests, setGuests] = useState(initialGuests)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (checkIn) params.set('checkIn', checkIn)
    if (checkOut) params.set('checkOut', checkOut)
    if (guests > 1) params.set('guests', String(guests))
    router.push(`/?${params.toString()}`)
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center">
        <div className="flex items-center border border-gray-300 rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-shadow gap-2 bg-white">
          <input
            type="text"
            placeholder="Where are you going?"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="outline-none text-sm text-gray-700 placeholder-gray-400 w-40"
          />
          <button
            type="submit"
            className="bg-primary text-white rounded-full p-2 hover:bg-primary-hover transition-colors"
          >
            <FiSearch className="w-3 h-3" />
          </button>
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="flex items-center bg-white rounded-full shadow-card border border-gray-200 overflow-hidden">
        {/* City */}
        <div className="flex-1 px-6 py-4 border-r border-gray-200">
          <label className="block text-xs font-bold text-gray-800 mb-1">Where</label>
          <input
            type="text"
            placeholder="Search destinations"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
          />
        </div>

        {/* Check-in */}
        <div className="px-6 py-4 border-r border-gray-200 hidden md:block">
          <label className="block text-xs font-bold text-gray-800 mb-1">Check in</label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="outline-none text-sm text-gray-700 bg-transparent w-32"
          />
        </div>

        {/* Check-out */}
        <div className="px-6 py-4 border-r border-gray-200 hidden md:block">
          <label className="block text-xs font-bold text-gray-800 mb-1">Check out</label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            min={checkIn || new Date().toISOString().split('T')[0]}
            className="outline-none text-sm text-gray-700 bg-transparent w-32"
          />
        </div>

        {/* Guests */}
        <div className="px-6 py-4 hidden sm:block">
          <label className="block text-xs font-bold text-gray-800 mb-1">Who</label>
          <input
            type="number"
            placeholder="Add guests"
            value={guests}
            onChange={(e) => setGuests(Math.max(1, Number(e.target.value)))}
            min={1}
            max={20}
            className="outline-none text-sm text-gray-700 bg-transparent w-24"
          />
        </div>

        {/* Search button */}
        <div className="px-3 py-3">
          <button
            type="submit"
            className="flex items-center gap-2 bg-primary text-white rounded-full px-5 py-3 font-semibold hover:bg-primary-hover transition-colors"
          >
            <FiSearch className="w-4 h-4" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </div>
    </form>
  )
}

export default SearchBar
