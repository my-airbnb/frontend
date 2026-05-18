import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import ListingDetailClient from './ListingDetailClient'

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <ListingDetailClient id={id} />
      </main>
      <Footer />
    </div>
  )
}
