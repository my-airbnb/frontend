import ListingDetailClient from './ListingDetailClient'

interface Props {
  params: { id: string }
}

export default function ListingPage({ params }: Props) {
  return <ListingDetailClient id={params.id} />
}
