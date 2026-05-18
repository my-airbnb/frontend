'use client'

import { useState } from 'react'
import { Star, CircleCheck as CheckCircle, Loader as Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Review, ReviewStats, Booking, User } from '@/types'
import { useCreateReview } from '@/hooks/useReviews'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ReviewsSectionProps {
  listingId: string
  reviews: Review[] | undefined
  reviewStats: ReviewStats | undefined
  reviewsLoading: boolean
  completedBooking: Booking | undefined
  user: User | null
  hostId: string | undefined
}

export default function ReviewsSection({
  listingId,
  reviews,
  reviewStats,
  reviewsLoading,
  completedBooking,
  user,
  hostId,
}: ReviewsSectionProps) {
  const { mutateAsync: createReview, isPending: submittingReview } = useCreateReview()
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSubmitted, setReviewSubmitted] = useState(false)

  const alreadyReviewed = reviewSubmitted || reviews?.some((r) => r.reviewerId === user?.email)

  const handleSubmit = async () => {
    if (!completedBooking) return
    try {
      await createReview({
        bookingId: completedBooking.id,
        listingId,
        revieweeId: hostId,
        ratingOverall: reviewRating,
        comment: reviewComment,
      })
      setReviewSubmitted(true)
      toast.success('Review submitted!')
    } catch {
      toast.error('Failed to submit review.')
    }
  }

  return (
    <div className="pt-6 border-t border-border">
      <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <Star className="h-5 w-5 fill-foreground text-foreground" />
        {reviews?.length
          ? `${(reviews.reduce((a, r) => a + r.ratingOverall, 0) / reviews.length).toFixed(2)} · ${reviews.length} review${reviews.length !== 1 ? 's' : ''}`
          : 'No reviews yet'}
      </h3>

      {reviewsLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-16 bg-muted rounded-xl" />
          <div className="h-16 bg-muted rounded-xl" />
        </div>
      ) : reviews?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="space-y-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{review.reviewerId?.[0]?.toUpperCase() ?? 'G'}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{review.reviewerId?.split('@')[0] ?? 'Guest'}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>
              <div className="flex text-yellow-500 text-xs">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn('h-3.5 w-3.5', i < review.ratingOverall ? 'fill-yellow-400 text-yellow-400' : 'text-muted')} />
                ))}
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">{review.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground italic">This place doesn&apos;t have any reviews yet.</p>
      )}

      {user && completedBooking && !reviewSubmitted && !alreadyReviewed && (
        <div className="mt-8 pt-6 border-t border-border">
          <h4 className="text-base font-semibold mb-4">Share your experience</h4>
          <div className="flex gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} type="button" onClick={() => setReviewRating(star)} className={cn('text-2xl transition-transform hover:scale-110', star <= reviewRating ? 'text-yellow-400' : 'text-muted')}>
                ★
              </button>
            ))}
          </div>
          <Textarea
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="What did you love about this place?"
            rows={3}
            className="mb-3"
          />
          <Button onClick={handleSubmit} disabled={submittingReview || !reviewComment.trim()} size="sm">
            {submittingReview ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting…</> : 'Submit Review'}
          </Button>
        </div>
      )}

      {user && completedBooking && (reviewSubmitted || alreadyReviewed) && (
        <div className="mt-6 flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-xl p-3 text-sm font-medium">
          <CheckCircle className="h-4 w-4" />Your review has been submitted. Thank you!
        </div>
      )}
    </div>
  )
}
