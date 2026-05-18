"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Upload, X, Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Header } from "@/components/header"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useListing, useUpdateListing } from "@/hooks/useListings"
import useAuthStore from "@/store/authStore"

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

export default function EditListingPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { isAuthenticated } = useAuthStore()
  const { data: listing, isLoading } = useListing(id)
  const { mutateAsync: updateListing, isPending } = useUpdateListing()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingPhotos, setUploadingPhotos] = useState(false)

  const [formData, setFormData] = useState({
    propertyType: "",
    title: "",
    description: "",
    price: "",
    instantBook: false,
    address: "",
    city: "",
    country: "",
    guests: "2",
    bedrooms: "1",
    beds: "1",
    bathrooms: "1",
    amenities: [] as string[],
    photos: [] as string[],
  })

  useEffect(() => {
    if (!isAuthenticated) router.push('/login')
  }, [isAuthenticated, router])

  useEffect(() => {
    if (listing) {
      setFormData({
        propertyType: listing.type?.toLowerCase() || "",
        title: listing.title || "",
        description: listing.description || "",
        price: String(listing.pricePerNight || ""),
        instantBook: listing.instantBook || false,
        address: listing.address || "",
        city: listing.city || "",
        country: listing.country || "",
        guests: String(listing.maxGuests || 2),
        bedrooms: String(listing.bedrooms || 1),
        beds: String(listing.beds || 1),
        bathrooms: String(listing.bathrooms || 1),
        amenities: listing.amenities || [],
        photos: listing.photos || [],
      })
    }
  }, [listing])

  const update = (field: string, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleAmenity = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(id)
        ? prev.amenities.filter((a) => a !== id)
        : [...prev.amenities, id],
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
    setFormData((prev) => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }))
  }

  const handleSave = async () => {
    if (!formData.title.trim()) { toast.error('Title is required'); return }
    if (!formData.price || Number(formData.price) <= 0) { toast.error('Valid price is required'); return }
    if (!formData.city.trim()) { toast.error('City is required'); return }

    try {
      await updateListing({
        id,
        payload: {
          title: formData.title,
          description: formData.description,
          type: formData.propertyType.toUpperCase(),
          address: formData.address,
          city: formData.city,
          country: formData.country,
          pricePerNight: Number(formData.price),
          maxGuests: Number(formData.guests),
          bedrooms: Number(formData.bedrooms),
          beds: Number(formData.beds),
          bathrooms: Number(formData.bathrooms),
          amenities: formData.amenities,
          instantBook: formData.instantBook,
          photos: formData.photos,
        },
      })
      toast.success('Listing updated successfully!')
      router.push('/dashboard')
    } catch {
      toast.error('Failed to update listing')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <p className="text-muted-foreground">Listing not found</p>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    )
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

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-foreground lg:text-3xl">Edit Listing</h1>
              <p className="mt-1 text-muted-foreground truncate max-w-xs">{listing.title}</p>
            </div>
            <Button onClick={handleSave} disabled={isPending || uploadingPhotos}>
              {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Save className="mr-2 h-4 w-4" />Save Changes</>}
            </Button>
          </div>

          <div className="space-y-8">
            {/* Basics */}
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold mb-6">Basic Information</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Property type</Label>
                  <Select value={formData.propertyType} onValueChange={(v) => update("propertyType", v)}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {propertyTypes.map((t) => (
                        <SelectItem key={t} value={t.toLowerCase()}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={formData.title} onChange={(e) => update("title", e.target.value)} maxLength={100} />
                  <p className="text-xs text-muted-foreground">{formData.title.length}/100</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => update("description", e.target.value)} className="min-h-32" maxLength={1000} />
                  <p className="text-xs text-muted-foreground">{formData.description.length}/1000</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price per night (USD)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input id="price" type="number" value={formData.price} onChange={(e) => update("price", e.target.value)} className="pl-7" min={1} />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <Label className="font-medium">Instant Book</Label>
                    <p className="text-sm text-muted-foreground">Allow guests to book without approval</p>
                  </div>
                  <Switch checked={formData.instantBook} onCheckedChange={(v) => update("instantBook", v)} />
                </div>
              </div>
            </section>

            {/* Location */}
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold mb-6">Location</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Street address</Label>
                  <Input id="address" value={formData.address} onChange={(e) => update("address", e.target.value)} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={formData.city} onChange={(e) => update("city", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" value={formData.country} onChange={(e) => update("country", e.target.value)} />
                  </div>
                </div>
              </div>
            </section>

            {/* Details */}
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold mb-6">Property Details</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: "Max guests", field: "guests", max: 16, unit: "guest" },
                  { label: "Bedrooms", field: "bedrooms", max: 10, unit: "bedroom" },
                  { label: "Beds", field: "beds", max: 10, unit: "bed" },
                  { label: "Bathrooms", field: "bathrooms", max: 10, unit: "bathroom" },
                ].map(({ label, field, max, unit }) => (
                  <div key={field} className="space-y-2">
                    <Label>{label}</Label>
                    <Select value={formData[field as keyof typeof formData] as string} onValueChange={(v) => update(field, v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[...Array(max)].map((_, i) => (
                          <SelectItem key={i + 1} value={String(i + 1)}>{i + 1} {unit}{i > 0 ? "s" : ""}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </section>

            {/* Amenities */}
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold mb-2">Amenities</h2>
              <p className="text-sm text-muted-foreground mb-6">Select all amenities your place offers</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {amenitiesList.map((amenity) => {
                  const isSelected = formData.amenities.includes(amenity.id)
                  return (
                    <button
                      key={amenity.id}
                      type="button"
                      onClick={() => toggleAmenity(amenity.id)}
                      className={cn(
                        "flex items-center justify-between rounded-lg border p-3 text-left text-sm transition-colors",
                        isSelected ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"
                      )}
                    >
                      <span className={cn("font-medium", isSelected ? "text-primary" : "text-foreground")}>{amenity.label}</span>
                      {isSelected && <span className="text-primary">✓</span>}
                    </button>
                  )
                })}
              </div>
            </section>

            {/* Photos */}
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold mb-2">Photos</h2>
              <p className="text-sm text-muted-foreground mb-6">The first photo will be used as the cover image</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <label className={cn(
                  "flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 transition-colors hover:border-primary hover:bg-muted",
                  uploadingPhotos && "opacity-50 pointer-events-none"
                )}>
                  {uploadingPhotos ? (
                    <><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /><span className="mt-2 text-sm text-muted-foreground">Uploading...</span></>
                  ) : (
                    <><Upload className="h-8 w-8 text-muted-foreground mb-2" /><span className="text-sm font-medium text-muted-foreground">Add photos</span></>
                  )}
                  <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploadingPhotos} />
                </label>
                {formData.photos.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                    <Image src={url} alt={`Photo ${i + 1}`} fill className="object-cover" />
                    {i === 0 && (
                      <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">Cover</span>
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
            </section>

            <div className="flex justify-end pb-8">
              <Button onClick={handleSave} disabled={isPending || uploadingPhotos} size="lg">
                {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Save className="mr-2 h-4 w-4" />Save Changes</>}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
