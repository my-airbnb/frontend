import { Suspense } from 'react'
import HomeContent from './HomeContent'

export default function Home() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" /></div>}>
      <HomeContent />
    </Suspense>
  )
}
