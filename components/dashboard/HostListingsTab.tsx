'use client'

import Link from 'next/link'
import { Hop as Home, CreditCard as Edit2, Trash2, CalendarDays } from 'lucide-react'
import { Listing } from '@/types'
import { useDeleteListing } from '@/hooks/useListings'
import ListingCard from '@/components/ListingCard'
import { Button } from '@/components/ui/button'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import { toast } from 'sonner'

export function HostListingsTab({ listingsLoading, hostListings }: { listingsLoading: boolean; hostListings: Listing[] | undefined }) {
  const { mutate: deleteListing, isPending: isDeleting } = useDeleteListing()

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    deleteListing(id, {
      onSuccess: () => toast.success('Listing deleted.'),
      onError: () => toast.error('Failed to delete listing.'),
    })
  }

  if (listingsLoading) return <LoadingSkeleton count={4} />
  if (!hostListings?.length) return (
    <div className="text-center py-20">
      <Home className="h-16 w-16 text-muted mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-2">No listings yet</h3>
      <p className="text-muted-foreground mb-6">Start hosting and create your first listing!</p>
      <Button asChild><Link href="/host/new-listing">Create a listing</Link></Button>
    </div>
  )

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {hostListings.map((listing) => (
        <div key={listing.id} className="group relative">
          <ListingCard listing={listing} />
          <div className="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <Button size="icon" variant="secondary" className="h-7 w-7 rounded-full shadow" asChild>
              <Link href={`/host/edit-listing/${listing.id}`} title="Edit">
                <Edit2 className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button size="icon" variant="secondary" className="h-7 w-7 rounded-full shadow" asChild>
              <Link href={`/host/availability/${listing.id}`} title="Manage availability">
                <CalendarDays className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button
              size="icon" variant="secondary"
              className="h-7 w-7 rounded-full shadow text-destructive hover:text-destructive"
              onClick={() => handleDelete(listing.id, listing.title)}
              disabled={isDeleting}
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
