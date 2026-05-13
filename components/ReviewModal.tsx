'use client'

import React, { useState } from 'react'
import { FiX, FiStar } from 'react-icons/fi'
import { useCreateReview } from '@/hooks/useReviews'

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  bookingId: string
  listingId: string
}

export default function ReviewModal({ isOpen, onClose, onSuccess, bookingId, listingId }: ReviewModalProps) {
  const { mutateAsync: createReview, isPending } = useCreateReview()
  const [rating, setRating] = useState(5)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await createReview({
        bookingId,
        listingId,
        ratingOverall: rating,
        comment,
      })
      setRating(5)
      setComment('')
      onSuccess ? onSuccess() : onClose()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit review')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>

        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">How was your stay?</h2>
          <p className="text-sm text-gray-500 mt-1">Share your experience to help others.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                >
                  <FiStar
                    className={`w-8 h-8 transition-colors ${
                      (hoveredRating || rating) >= star
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Write a public review
            </label>
            <textarea
              id="comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others about your experience..."
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full btn-primary disabled:opacity-50"
            >
              {isPending ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
