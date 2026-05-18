export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  avatarUrl?: string
  role: 'GUEST' | 'HOST' | 'ADMIN'
  isVerified: boolean
  createdAt: string
}

export interface Listing {
  id: string
  hostId: string
  type: string
  title: string
  description: string
  address: string
  city: string
  country: string
  lat: number
  lng: number
  pricePerNight: number
  currency: string
  maxGuests: number
  bedrooms: number
  beds: number
  bathrooms: number
  amenities: string[]
  houseRules?: string
  photos: string[]
  active: boolean
  instantBook: boolean
  createdAt: string
}

export interface Booking {
  id: string
  guestId: string
  listingId: string
  experienceId?: string
  type: 'LISTING' | 'EXPERIENCE'
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'REJECTED'
  checkIn: string
  checkOut: string
  nbGuests: number
  totalPrice: number
  serviceFee: number
  cancellationReason?: string
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
}

export interface Experience {
  id: string
  hostId: string
  title: string
  description: string
  category: string
  location: string
  lat?: number
  lng?: number
  pricePerPerson: number
  currency: string
  maxGroupSize: number
  minGroupSize: number
  durationMinutes: number
  language: string
  whatIncluded?: string
  whatToBring?: string
  photos: string[]
  active: boolean
  createdAt?: string
}

export interface ListingFilters {
  city?: string
  minPrice?: number
  maxPrice?: number
  checkIn?: string
  checkOut?: string
  guests?: number
  type?: string
  query?: string
}

export interface CreateBookingPayload {
  listingId?: string
  experienceId?: string
  type: 'LISTING' | 'EXPERIENCE'
  checkIn: string
  checkOut: string
  nbGuests: number
  totalPrice: number
  serviceFee?: number
}

export interface CreateListingPayload {
  title: string
  description: string
  type: string
  address: string
  city: string
  country: string
  lat?: number
  lng?: number
  pricePerNight: number
  currency?: string
  maxGuests: number
  bedrooms: number
  beds: number
  bathrooms: number
  amenities: string[]
  houseRules?: string
  instantBook: boolean
  photos?: string[]
}

export interface PaymentIntentResponse {
  paymentId: string
  bookingId: string
  clientSecret: string
  amount: number
  currency: string
  status: string
}

export interface ConfirmPaymentPayload {
  paymentIntentId: string
  paymentMethodId: string
}

export interface Review {
  id: string
  reviewerId: string
  revieweeId?: string
  listingId: string
  bookingId: string
  ratingOverall: number
  ratingCleanliness?: number
  ratingCommunication?: number
  ratingLocation?: number
  comment: string
  createdAt: string
}

export interface CreateReviewPayload {
  bookingId: string
  listingId: string
  revieweeId?: string
  ratingOverall: number
  comment: string
}

export interface Conversation {
  id: string
  guestEmail: string
  hostEmail: string
  listingId: string
  lastMessage?: string
  lastMessageAt?: string
  createdAt: string
  unreadCount: number
}

export interface Message {
  id: string
  conversationId: string
  senderEmail: string
  content: string
  read: boolean
  createdAt: string
}

export interface CreateMessagePayload {
  conversationId?: string
  recipientEmail: string
  listingId?: string
  content: string
}

export interface ReviewStats {
  listingId?: string
  totalReviews: number
  averageRating: number | null
  averageCleanliness?: number | null
  averageCommunication?: number | null
  averageLocation?: number | null
}

export interface BlockedDateRange {
  checkIn: string
  checkOut: string
}
