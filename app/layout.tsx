import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'
import Navbar from '@/components/Navbar'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Airbnb Clone',
  description: 'Find your perfect place',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
          <main className="min-h-screen">{children}</main>
          <footer className="bg-gray-50 border-t border-gray-200 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Support</h3>
                  <ul className="space-y-2 text-sm text-gray-500">
                    <li><a href="#" className="hover:text-gray-700">Help Center</a></li>
                    <li><a href="#" className="hover:text-gray-700">Safety Information</a></li>
                    <li><a href="#" className="hover:text-gray-700">Cancellation Options</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Community</h3>
                  <ul className="space-y-2 text-sm text-gray-500">
                    <li><a href="#" className="hover:text-gray-700">Airbnb.org</a></li>
                    <li><a href="#" className="hover:text-gray-700">Support Refugees</a></li>
                    <li><a href="#" className="hover:text-gray-700">Combating Discrimination</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Hosting</h3>
                  <ul className="space-y-2 text-sm text-gray-500">
                    <li><a href="/host/new-listing" className="hover:text-gray-700">Try Hosting</a></li>
                    <li><a href="#" className="hover:text-gray-700">Explore Resources</a></li>
                    <li><a href="#" className="hover:text-gray-700">Community Forum</a></li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-gray-200 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-sm text-gray-400">
                  &copy; {new Date().getFullYear()} Airbnb Clone, Inc.
                </p>
                <div className="flex gap-4 text-sm text-gray-400">
                  <a href="#" className="hover:text-gray-600">Privacy</a>
                  <a href="#" className="hover:text-gray-600">Terms</a>
                  <a href="#" className="hover:text-gray-600">Sitemap</a>
                </div>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  )
}
