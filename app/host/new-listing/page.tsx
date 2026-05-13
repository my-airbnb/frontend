'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FiArrowLeft, FiAlertCircle, FiCheckCircle, FiUploadCloud, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'
import useAuthStore from '@/store/authStore'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import useListings from '@/hooks/useListings'

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ''
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ''

async function uploadToCloudinary(file: File): Promise<string> {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error('Cloudinary is not configured. Check NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.')
  }
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  )
  if (!res.ok) {
    let msg = `Upload failed (${res.status})`
    try {
      const err = await res.json()
      if (err?.error?.message) msg = err.error.message
    } catch {}
    throw new Error(msg)
  }
  const data = await res.json()
  return data.secure_url as string
}

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

interface FormData {
  title: string
  description: string
  type: string
  address: string
  city: string
  country: string
  pricePerNight: string
  maxGuests: string
  bedrooms: string
  beds: string
  bathrooms: string
  amenities: string[]
  instantBook: boolean
  photos: string[]
}

const initialForm: FormData = {
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
  amenities: [],
  instantBook: false,
  photos: [],
}

export default function NewListingPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const hasHydrated = useHasHydrated()
  const { createListing, isCreating, createError } = useListings()
  const [form, setForm] = useState<FormData>(initialForm)
  const [success, setSuccess] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!hasHydrated) return
    if (!isAuthenticated) {
      router.push('/login')
    } else if (user?.role === 'GUEST') {
      router.push('/dashboard')
    }
  }, [hasHydrated, isAuthenticated, user, router])

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
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      setUploadError('Photo upload is not configured. Listing will be created without photos.')
      return
    }
    setUploading(true)
    setUploadError('')
    try {
      const uploads = await Promise.all(Array.from(files).map(uploadToCloudinary))
      setForm((prev) => ({ ...prev, photos: [...prev.photos, ...uploads] }))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Some photos failed to upload.'
      setUploadError(msg)
    } finally {
      setUploading(false)
    }
  }

  const removePhoto = (url: string) => {
    setForm((prev) => ({ ...prev, photos: prev.photos.filter((p) => p !== url) }))
  }

  const validateStep = (): string | null => {
    switch (currentStep) {
      case 1:
        if (!form.title.trim()) return 'Title is required.'
        if (!form.description.trim()) return 'Description is required.'
        return null
      case 2:
        if (!form.address.trim()) return 'Street address is required.'
        if (!form.city.trim()) return 'City is required.'
        if (!form.country.trim()) return 'Country is required.'
        return null
      case 3:
        if (!form.pricePerNight || Number(form.pricePerNight) <= 0) return 'Price per night must be greater than 0.'
        return null
      default:
        return null
    }
  }

  const handleNext = () => {
    const error = validateStep()
    if (error) {
      toast.error(error)
      return
    }
    setCurrentStep((s) => Math.min(5, s + 1))
  }

  const handlePublish = async () => {
    try {
      await createListing({
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
        currency: 'USD',
        photos: form.photos,
      })
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 2000)
    } catch {
      // Error is handled by the hook
    }
  }

  const errorMessage =
    (createError as { response?: { data?: { message?: string } } })?.response?.data?.message ||
    (createError ? 'Failed to create listing. Please try again.' : null)

  if (!hasHydrated || !isAuthenticated || !user || user.role === 'GUEST') return null

  const steps = [
    { num: 1, label: 'Basics' },
    { num: 2, label: 'Location' },
    { num: 3, label: 'Details' },
    { num: 4, label: 'Amenities' },
    { num: 5, label: 'Photos' },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
        >
          <FiArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Create a new listing</h1>
      <p className="text-gray-500 mb-8">Fill in the details to start hosting your property.</p>

      {/* Progress steps */}
      <div className="flex items-center gap-2 mb-10">
        {steps.map((step, i) => (
          <div key={step.num} className="flex items-center gap-2 flex-1">
            <button
              onClick={() => setCurrentStep(step.num)}
              className={`flex items-center gap-2 flex-1 ${currentStep >= step.num ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                  currentStep > step.num
                    ? 'bg-gray-900 text-white'
                    : currentStep === step.num
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {currentStep > step.num ? '✓' : step.num}
              </div>
              <span
                className={`text-sm font-medium hidden sm:block ${
                  currentStep >= step.num ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 ${
                  currentStep > step.num ? 'bg-gray-900' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Success message */}
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 mb-6">
          <FiCheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>Listing created successfully! Redirecting to dashboard...</span>
        </div>
      )}

      {/* Error message */}
      {errorMessage && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">
          <FiAlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        {/* Step 1: Basics */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <h2 className="text-xl font-semibold text-gray-900">Basic information</h2>

            <div>
              <label htmlFor="type" className="label">
                Property type
              </label>
              <select
                id="type"
                name="type"
                value={form.type}
                onChange={handleChange}
                className="input-field"
              >
                {LISTING_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="title" className="label">
                Listing title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Cozy apartment in the city center"
                required
                maxLength={100}
                className="input-field"
              />
              <p className="text-xs text-gray-400 mt-1">{form.title.length}/100</p>
            </div>

            <div>
              <label htmlFor="description" className="label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your place: what makes it special, the neighborhood, nearby attractions..."
                required
                rows={5}
                maxLength={1000}
                className="input-field resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">{form.description.length}/1000</p>
            </div>

            <div>
              <label htmlFor="pricePerNight" className="label">
                Price per night (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  $
                </span>
                <input
                  id="pricePerNight"
                  name="pricePerNight"
                  type="number"
                  value={form.pricePerNight}
                  onChange={handleChange}
                  placeholder="0"
                  required
                  min={1}
                  max={10000}
                  className="input-field pl-8"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900 text-sm">Instant Book</label>
                <p className="text-xs text-gray-500 mt-0.5">
                  Allow guests to book without approval
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="instantBook"
                  checked={form.instantBook}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <h2 className="text-xl font-semibold text-gray-900">Location</h2>

            <div>
              <label htmlFor="address" className="label">
                Street address
              </label>
              <input
                id="address"
                name="address"
                type="text"
                value={form.address}
                onChange={handleChange}
                placeholder="123 Main Street"
                required
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="label">
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="e.g. Paris"
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="country" className="label">
                  Country
                </label>
                <input
                  id="country"
                  name="country"
                  type="text"
                  value={form.country}
                  onChange={handleChange}
                  placeholder="e.g. France"
                  required
                  className="input-field"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Details */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <h2 className="text-xl font-semibold text-gray-900">Property details</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="maxGuests" className="label">
                  Max guests
                </label>
                <input
                  id="maxGuests"
                  name="maxGuests"
                  type="number"
                  value={form.maxGuests}
                  onChange={handleChange}
                  min={1}
                  max={50}
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="bedrooms" className="label">
                  Bedrooms
                </label>
                <input
                  id="bedrooms"
                  name="bedrooms"
                  type="number"
                  value={form.bedrooms}
                  onChange={handleChange}
                  min={0}
                  max={20}
                  required
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="beds" className="label">
                  Beds
                </label>
                <input
                  id="beds"
                  name="beds"
                  type="number"
                  value={form.beds}
                  onChange={handleChange}
                  min={1}
                  max={50}
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="bathrooms" className="label">
                  Bathrooms
                </label>
                <input
                  id="bathrooms"
                  name="bathrooms"
                  type="number"
                  value={form.bathrooms}
                  onChange={handleChange}
                  min={1}
                  max={20}
                  step={0.5}
                  required
                  className="input-field"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Amenities */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <h2 className="text-xl font-semibold text-gray-900">Amenities</h2>
            <p className="text-sm text-gray-500">
              Select all the amenities available at your property.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {AMENITIES_OPTIONS.map((amenity) => {
                const checked = form.amenities.includes(amenity.value)
                return (
                  <label
                    key={amenity.value}
                    className={`flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition-all ${
                      checked
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="amenities"
                      value={amenity.value}
                      checked={checked}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-xl">{amenity.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{amenity.label}</span>
                    {checked && (
                      <span className="ml-auto text-gray-900 text-sm font-bold">✓</span>
                    )}
                  </label>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 5: Photos */}
        {currentStep === 5 && (
          <div className="space-y-5">
            <h2 className="text-xl font-semibold text-gray-900">Add photos</h2>
            <p className="text-sm text-gray-500">
              Upload photos of your property. The first photo will be used as the cover image.
            </p>

            {/* Upload area */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handlePhotoFiles(e.target.files)}
            />
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handlePhotoFiles(e.dataTransfer.files) }}
              className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-primary transition-colors cursor-pointer"
            >
              <FiUploadCloud className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              {uploading ? (
                <p className="text-sm text-primary font-medium">Uploading photos...</p>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-700">
                    Click to upload or drag & drop
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP — up to 10 files</p>
                </>
              )}
            </div>

            {uploadError && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <FiAlertCircle className="w-4 h-4" />
                {uploadError}
              </p>
            )}

            {/* Preview grid */}
            {form.photos.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {form.photos.map((url, i) => (
                  <div key={url} className="relative aspect-square rounded-xl overflow-hidden group">
                    <Image
                      src={url}
                      alt={`Photo ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="33vw"
                    />
                    {i === 0 && (
                      <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                        Cover
                      </span>
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

            <p className="text-xs text-gray-400">
              {form.photos.length === 0
                ? 'No photos yet — you can skip this and add them later.'
                : `${form.photos.length} photo${form.photos.length !== 1 ? 's' : ''} added`}
            </p>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
            disabled={currentStep === 1}
            className="btn-outline disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePublish}
              disabled={isCreating || success || uploading}
              className="btn-primary flex items-center gap-2 disabled:opacity-60"
            >
              {isCreating ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4l-3 3-3-3h4z" />
                  </svg>
                  Creating...
                </>
              ) : (
                'Publish listing'
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
