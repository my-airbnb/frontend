export default function ListingLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="h-6 w-32 bg-muted rounded mb-6" />
      <div className="h-8 w-2/3 bg-muted rounded mb-4" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 h-72 mb-8">
        <div className="col-span-2 row-span-2 bg-muted rounded-xl" />
        <div className="bg-muted rounded-xl" />
        <div className="bg-muted rounded-xl" />
        <div className="bg-muted rounded-xl" />
        <div className="bg-muted rounded-xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-6 w-1/2 bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-3/4 bg-muted rounded" />
          <div className="h-4 w-5/6 bg-muted rounded" />
        </div>
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    </div>
  )
}
