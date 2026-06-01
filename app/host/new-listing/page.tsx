"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Check, Upload, X, Loader as Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Header } from "@/components/header"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useCreateListing } from "@/hooks/useListings"
import useAuthStore from "@/store/authStore"
import { useEffect } from "react"
import { useHasHydrated } from "@/hooks/useHasHydrated"

const steps = [
  { id: 1, name: "Basics", description: "Property type and details" },
  { id: 2, name: "Location", description: "Where is your place?" },
  { id: 3, name: "Details", description: "Rooms and capacity" },
  { id: 4, name: "Amenities", description: "What you offer" },
  { id: 5, name: "Photos", description: "Show off your space" },
]

const propertyTypes = [
  "Apartment", "House", "Villa", "Cabin", "Cottage", "Treehouse", "Boat", "Castle", "Other",
]

const amenitiesList = [
  { id: "WiFi", label: "📶 WiFi" },
  { id: "Kitchen", label: "🍳 Kitchen" },
  { id: "Washer", label: "🫧 Washer" },
  { id: "Dryer", label: "🌀 Dryer" },
  { id: "Air conditioning", label: "❄️ Air conditioning" },
  { id: "Heating", label: "🔥 Heating" },
  { id: "TV", label: "📺 TV" },
  { id: "Free parking", label: "🅿️ Free parking" },
  { id: "Pool", label: "🏊 Pool" },
  { id: "Hot tub", label: "🛁 Hot tub" },
  { id: "Gym", label: "💪 Gym" },
  { id: "Elevator", label: "🛗 Elevator" },
  { id: "Breakfast", label: "🥐 Breakfast" },
  { id: "Workspace", label: "💻 Workspace" },
  { id: "Beachfront", label: "🏖️ Beachfront" },
  { id: "Mountain view", label: "🏔️ Mountain view" },
]

export default function NewListingPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const hasHydrated = useHasHydrated()
  const { mutateAsync: createListing, isPending: isCreating } = useCreateListing()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [currentStep, setCurrentStep] = useState(1)
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [formData, setFormData] = useState({
    propertyType: "",
    title: "",
    description: "",
    price: "",
    instantBook: false,
    address: "",
    city: "",
    state: "",
    country: "",
    guests: "2",
    bedrooms: "1",
    beds: "1",
    bathrooms: "1",
    amenities: [] as string[],
    photos: [] as string[],
  })

  useEffect(() => {
    if (!hasHydrated) return
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    if (user?.role !== 'HOST' && user?.role !== 'ADMIN') {
      toast.error('You need to be a host to create listings. Go to Profile to become a host.')
      router.push('/profile')
    }
  }, [hasHydrated, isAuthenticated, user, router])

  const updateFormData = (field: string, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleAmenity = (amenityId: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter((id) => id !== amenityId)
        : [...prev.amenities, amenityId],
    }))
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploadingPhotos(true)
    try {
      const uploaded: string[] = []
      for (const file of files) {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        if (!res.ok) throw new Error('Upload failed')
        const { url } = await res.json()
        uploaded.push(url)
      }
      setFormData((prev) => ({ ...prev, photos: [...prev.photos, ...uploaded] }))
      toast.success(`${uploaded.length} photo${uploaded.length > 1 ? 's' : ''} uploaded`)
    } catch {
      toast.error('Failed to upload photos')
    } finally {
      setUploadingPhotos(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }))
  }

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.propertyType) { toast.error('Please select a property type'); return false }
        if (!formData.title.trim()) { toast.error('Please enter a title'); return false }
        if (!formData.description.trim()) { toast.error('Please enter a description'); return false }
        if (!formData.price || Number(formData.price) <= 0) { toast.error('Please enter a valid price'); return false }
        return true
      case 2:
        if (!formData.address.trim()) { toast.error('Please enter an address'); return false }
        if (!formData.city.trim()) { toast.error('Please enter a city'); return false }
        if (!formData.country.trim()) { toast.error('Please enter a country'); return false }
        return true
      case 3:
        return true
      case 4:
        return true
      case 5:
        if (formData.photos.length === 0) { toast.error('Please upload at least one photo'); return false }
        return true
      default:
        return true
    }
  }

  const nextStep = () => {
    if (validateStep()) setCurrentStep((prev) => Math.min(prev + 1, steps.length))
  }
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1))

  const handleSubmit = async () => {
    if (!validateStep()) return
    try {
      let lat = 0
      let lng = 0
      let geocoded = false
      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(`${formData.address}, ${formData.city}, ${formData.country}`)}&format=json&limit=1`,
          { signal: AbortSignal.timeout(5000) }
        )
        const geoData = await geoRes.json()
        if (geoData?.[0]) {
          lat = parseFloat(geoData[0].lat)
          lng = parseFloat(geoData[0].lon)
          geocoded = true
        }
      } catch {
        // M3: geocoding is best-effort but warn the host so they know map pin may be wrong
      }
      if (!geocoded) {
        toast('Could not determine exact location — map pin may be inaccurate. You can update it later.', { duration: 6000 })
      }

      await createListing({
        title: formData.title,
        description: formData.description,
        type: formData.propertyType.toUpperCase(),
        address: formData.address,
        city: formData.city,
        country: formData.country,
        lat,
        lng,
        pricePerNight: Number(formData.price),
        maxGuests: Number(formData.guests),
        bedrooms: Number(formData.bedrooms),
        beds: Number(formData.beds),
        bathrooms: Number(formData.bathrooms),
        amenities: formData.amenities,
        instantBook: formData.instantBook,
        photos: formData.photos,
      })
      toast.success('Listing created successfully!')
      router.push('/dashboard')
    } catch {
      toast.error('Failed to create listing. Please try again.')
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Basic Information</h2>

            <div className="space-y-2">
              <Label>Property type</Label>
              <Select value={formData.propertyType} onValueChange={(v) => updateFormData("propertyType", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Listing title</Label>
              <Input
                id="title"
                placeholder="e.g. Cozy apartment in the city center"
                value={formData.title}
                onChange={(e) => updateFormData("title", e.target.value)}
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">{formData.title.length}/100</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your place: what makes it special, the neighborhood, nearby attractions..."
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                className="min-h-32"
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground">{formData.description.length}/1000</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price per night (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="price"
                  type="number"
                  placeholder="0"
                  value={formData.price}
                  onChange={(e) => updateFormData("price", e.target.value)}
                  className="pl-7"
                  min={1}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <Label htmlFor="instantBook" className="font-medium">Instant Book</Label>
                <p className="text-sm text-muted-foreground">Allow guests to book without your approval</p>
              </div>
              <Switch
                id="instantBook"
                checked={formData.instantBook}
                onCheckedChange={(checked) => updateFormData("instantBook", checked)}
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Location</h2>

            <div className="space-y-2">
              <Label htmlFor="address">Street address</Label>
              <Input
                id="address"
                placeholder="123 Main Street"
                value={formData.address}
                onChange={(e) => updateFormData("address", e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Paris"
                  value={formData.city}
                  onChange={(e) => updateFormData("city", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State / Province (optional)</Label>
                <Input
                  id="state"
                  placeholder="Île-de-France"
                  value={formData.state}
                  onChange={(e) => updateFormData("state", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                placeholder="France"
                value={formData.country}
                onChange={(e) => updateFormData("country", e.target.value)}
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Property Details</h2>

            <div className="grid gap-6 sm:grid-cols-2">
              {[
                { label: "Max guests", field: "guests", max: 16, unit: "guest" },
                { label: "Bedrooms", field: "bedrooms", max: 10, unit: "bedroom" },
                { label: "Beds", field: "beds", max: 10, unit: "bed" },
                { label: "Bathrooms", field: "bathrooms", max: 10, unit: "bathroom" },
              ].map(({ label, field, max, unit }) => (
                <div key={field} className="space-y-2">
                  <Label>{label}</Label>
                  <Select
                    value={formData[field as keyof typeof formData] as string}
                    onValueChange={(v) => updateFormData(field, v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(max)].map((_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>
                          {i + 1} {unit}{i > 0 ? "s" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Amenities</h2>
            <p className="text-muted-foreground">Select all amenities your place offers</p>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {amenitiesList.map((amenity) => {
                const isSelected = formData.amenities.includes(amenity.id)
                return (
                  <button
                    key={amenity.id}
                    type="button"
                    onClick={() => toggleAmenity(amenity.id)}
                    className={cn(
                      "flex items-center justify-between rounded-lg border p-4 text-left transition-colors",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <span className={cn("font-medium", isSelected ? "text-primary" : "text-foreground")}>
                      {amenity.label}
                    </span>
                    {isSelected && <Check className="h-5 w-5 text-primary shrink-0" />}
                  </button>
                )
              })}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Photos</h2>
            <p className="text-muted-foreground">
              Add photos of your place. The first photo will be the cover image.
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className={cn(
                "flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 transition-colors hover:border-primary hover:bg-muted",
                uploadingPhotos && "opacity-50 pointer-events-none"
              )}>
                {uploadingPhotos ? (
                  <><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /><span className="mt-2 text-sm text-muted-foreground">Uploading...</span></>
                ) : (
                  <><Upload className="h-8 w-8 text-muted-foreground mb-2" /><span className="text-sm font-medium text-muted-foreground">Upload photos</span><span className="text-xs text-muted-foreground">PNG, JPG up to 10MB</span></>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhotos}
                />
              </label>

              {formData.photos.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                  <Image src={url} alt={`Photo ${i + 1}`} fill className="object-cover" />
                  {i === 0 && (
                    <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="py-8">
        <div className="container mx-auto max-w-3xl px-4">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground lg:text-3xl">Create a new listing</h1>
            <p className="mt-2 text-muted-foreground">Fill in the details to start hosting your property</p>
          </div>

          <div className="mb-8 overflow-x-auto">
            <div className="flex items-center justify-between min-w-max px-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors",
                      currentStep > step.id
                        ? "bg-primary text-primary-foreground"
                        : currentStep === step.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                    </div>
                    <span className="mt-2 text-xs font-medium text-foreground hidden sm:block whitespace-nowrap">
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={cn(
                      "mx-2 h-0.5 w-8 sm:w-16 lg:w-20 transition-colors",
                      currentStep > step.id ? "bg-primary" : "bg-border"
                    )} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 lg:p-8">
            {renderStepContent()}

            <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
              <Button variant="ghost" onClick={prevStep} disabled={currentStep === 1 || isCreating}>
                Previous
              </Button>
              {currentStep === steps.length ? (
                <Button onClick={handleSubmit} disabled={isCreating || uploadingPhotos}>
                  {isCreating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : 'Create Listing'}
                </Button>
              ) : (
                <Button onClick={nextStep}>Next</Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
