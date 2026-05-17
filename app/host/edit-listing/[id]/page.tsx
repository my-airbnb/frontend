'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FiArrowLeft, FiAlertCircle, FiCheckCircle, FiUploadCloud, FiX } from 'react-icons/fi'
import useAuthStore from '@/store/authStore'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { useListing, useUpdateListing } from '@/hooks/useListings'
import toast from 'react-hot-toast'

const LISTING_TYPES = [
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'HOUSE', label: 'House' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'CABIN', label: 'Cabin' },
  { value: 'STUDIO', label: 'Studio' },
  { value: 'CONDO', label: 'Condo' },
  { value: 'TOWNHOUSE', label: 'Townhouse' },
  { value: 'COTTAGE', label: 'Cottage' },
  { value: 'LOFT', label: 'Loft' },
]

const AMENITIES_OPTIONS = [
  { value: 'wifi', label: 'WiFi', icon: '📶' },
  { value: 'kitchen', label: 'Kitchen', icon: '🍳' },
  { value: 'parking', label: 'Free Parking', icon: '🚗' },
  { value: 'pool', label: 'Pool', icon: '🏊' },
  { value: 'gym', label: 'Gym', icon: '💪' },
  { value: 'tv', label: 'TV', icon: '📺' },
  { value: 'ac', label: 'Air Conditioning', icon: '❄️' },
  { value: 'washer', label: 'Washer', icon: '🫧' },
  { value: 'dryer', label: 'Dryer', icon: '👕' },
  { value: 'workspace', label: 'Workspace', icon: '💻' },
  { value: 'hot_tub', label: 'Hot Tub', icon: '♨️' },
  { value: 'bbq', label: 'BBQ Grill', icon: '🍖' },
]

async function uploadToServer(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch('/api/upload', { method: 'POST', body: formData })
  if (!res.ok) {
    let msg = `Upload failed (${res.status})`
    try {
      const err = await res.json()
      if (err?.error) msg = err.error
    } catch {}
    throw new Error(msg)
  }
  const data = await res.json()
  return data.url as string
}

export default function EditListingPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const hasHydrated = useHasHydrated()
  const id = params.id as string

  const { data: listing, isLoading } = useListing(id)
  const { mutateAsync: updateListing, isPending } = useUpdateListing()

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'APARTMENT',
    address: '',
    city: '',
    country: '',
    pricePerNight: '',
    maxGuests: '2',
    bedrooms: '1',
    beds: '1',
    bathrooms: '1',
    amenities: [] as string[],
    instantBook: false,
    photos: [] as string[],
  })
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!hasHydrated) return
    if (!isAuthenticated) router.push('/login')
    else if (user?.role === 'GUEST') router.push('/dashboard')
  }, [hasHydrated, isAuthenticated, user, router])

  // Populate form once listing loads
  useEffect(() => {
    if (listing) {
      setForm({
        title: listing.title,
        description: listing.description,
        type: listing.type,
        address: listing.address,
        city: listing.city,
        country: listing.country,
        pricePerNight: String(listing.pricePerNight),
        maxGuests: String(listing.maxGuests),
        bedrooms: String(listing.bedrooms),
        beds: String(listing.beds),
        bathrooms: String(listing.bathrooms),
        amenities: listing.amenities || [],
        instantBook: listing.instantBook,
        photos: listing.photos || [],
      })
    }
  }, [listing])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      if (name === 'instantBook') {
        setForm((prev) => ({ ...prev, instantBook: checked }))
      } else if (name === 'amenities') {
        setForm((prev) => ({
          ...prev,
          amenities: checked
            ? [...prev.amenities, value]
            : prev.amenities.filter((a) => a !== value),
        }))
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handlePhotoFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const uploads = await Promise.all(Array.from(files).map(uploadToServer))
      setForm((prev) => ({ ...prev, photos: [...prev.photos, ...uploads] }))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Some photos failed to upload.'
      toast.error(msg)
    } finally {
      setUploading(false)
    }
  }

  const removePhoto = (url: string) => {
    setForm((prev) => ({ ...prev, photos: prev.photos.filter((p) => p !== url) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateListing({
        id,
        payload: {
          title: form.title,
          description: form.description,
          type: form.type,
          address: form.address,
          city: form.city,
          country: form.country,
          pricePerNight: Number(form.pricePerNight),
          maxGuests: Number(form.maxGuests),
          bedrooms: Number(form.bedrooms),
          beds: Number(form.beds),
          bathrooms: Number(form.bathrooms),
          amenities: form.amenities,
          instantBook: form.instantBook,
          photos: form.photos,
        },
      })
      toast.success('Listing updated!')
      router.push('/dashboard')
    } catch {
      toast.error('Failed to update listing.')
    }
  }

  if (!hasHydrated || !isAuthenticated || !user || user.role === 'GUEST') return null

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium">
          <FiArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit listing</h1>
      <p className="text-gray-500 mb-8">Update your property details.</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic info */}
        <div className="space-y-5">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic information</h2>
          <div>
            <label className="label">Property type</label>
            <select name="type" value={form.type} onChange={handleChange} className="input-field">
              {LISTING_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Title</label>
            <input name="title" type="text" value={form.title} onChange={handleChange} required maxLength={100} className="input-field" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={5} maxLength={1000} className="input-field resize-none" />
          </div>
          <div>
            <label className="label">Price per night (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input name="pricePerNight" type="number" value={form.pricePerNight} onChange={handleChange} required min={1} className="input-field pl-8" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-gray-900 text-sm">Instant Book</label>
              <p className="text-xs text-gray-500 mt-0.5">Allow guests to book without approval</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="instantBook" checked={form.instantBook} onChange={handleChange} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
            </label>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-5">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Location</h2>
          <div>
            <label className="label">Street address</label>
            <input name="address" type="text" value={form.address} onChange={handleChange} required className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">City</label>
              <input name="city" type="text" value={form.city} onChange={handleChange} required className="input-field" />
            </div>
            <div>
              <label className="label">Country</label>
              <input name="country" type="text" value={form.country} onChange={handleChange} required className="input-field" />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-5">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Property details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Max guests</label>
              <input name="maxGuests" type="number" value={form.maxGuests} onChange={handleChange} min={1} max={50} required className="input-field" />
            </div>
            <div>
              <label className="label">Bedrooms</label>
              <input name="bedrooms" type="number" value={form.bedrooms} onChange={handleChange} min={0} max={20} required className="input-field" />
            </div>
            <div>
              <label className="label">Beds</label>
              <input name="beds" type="number" value={form.beds} onChange={handleChange} min={1} max={50} required className="input-field" />
            </div>
            <div>
              <label className="label">Bathrooms</label>
              <input name="bathrooms" type="number" value={form.bathrooms} onChange={handleChange} min={1} max={20} step={0.5} required className="input-field" />
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Amenities</h2>
          <div className="grid grid-cols-2 gap-3">
            {AMENITIES_OPTIONS.map((amenity) => {
              const checked = form.amenities.includes(amenity.value)
              return (
                <label key={amenity.value} className={`flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition-all ${checked ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="checkbox" name="amenities" value={amenity.value} checked={checked} onChange={handleChange} className="sr-only" />
                  <span className="text-xl">{amenity.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{amenity.label}</span>
                  {checked && <span className="ml-auto text-gray-900 text-sm font-bold">✓</span>}
                </label>
              )
            })}
          </div>
        </div>

        {/* Photos */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Photos</h2>
          <label
            htmlFor="photo-upload-edit"
            className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-primary transition-colors cursor-pointer block"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); handlePhotoFiles(e.dataTransfer.files) }}
          >
            <input id="photo-upload-edit" ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handlePhotoFiles(e.target.files)} />
            <FiUploadCloud className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            {uploading ? (
              <p className="text-sm text-primary font-medium">Uploading...</p>
            ) : (
              <p className="text-sm font-medium text-gray-700">Click to upload or drag & drop</p>
            )}
          </label>

          {form.photos.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {form.photos.map((url, i) => (
                <div key={url} className="relative aspect-square rounded-xl overflow-hidden group">
                  <Image src={url} alt={`Photo ${i + 1}`} fill className="object-cover" sizes="33vw" />
                  {i === 0 && (
                    <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">Cover</span>
                  )}
                  <button
                    type="button"
                    onClick={() => removePhoto(url)}
                    className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiX className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Link href="/dashboard" className="btn-outline flex-1 text-center">
            Cancel
          </Link>
          <button type="submit" disabled={isPending || uploading} className="btn-primary flex-1 disabled:opacity-60">
            {isPending ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
