'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { FiMenu, FiUser } from 'react-icons/fi'
import { SiAirbnb } from 'react-icons/si'
import toast from 'react-hot-toast'
import useAuthStore from '@/store/authStore'
import useAuth from '@/hooks/useAuth'
import { useBecomeHost } from '@/hooks/useAuth'
import SearchBar from './SearchBar'

const Navbar = () => {
  const { user, isAuthenticated } = useAuthStore()
  const { logout } = useAuth()
  const { mutateAsync: becomeHostMutate, isPending: isBecomeHostPending } = useBecomeHost()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    setIsMenuOpen(false)
    logout()
  }

  const handleBecomeHost = async () => {
    try {
      await becomeHostMutate()
      toast.success('Welcome! You are now a host. You can now create listings.')
    } catch {
      toast.error('Failed to upgrade account. Please try again.')
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 flex-shrink-0">
            <SiAirbnb className="w-8 h-8 text-primary" />
            <span className="hidden sm:block font-bold text-primary text-xl tracking-tight">
              airbnb
            </span>
          </Link>

          {/* Search bar (compact) */}
          <div className="flex-1 flex justify-center max-w-md">
            <SearchBar compact />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/experiences"
              className="hidden md:block text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-4 py-2 rounded-full transition-colors"
            >
              Experiences
            </Link>
            {isAuthenticated && user && (
              user.role === 'HOST' ? (
                <Link
                  href="/host/new-listing"
                  className="hidden md:block text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-4 py-2 rounded-full transition-colors"
                >
                  Create Listing
                </Link>
              ) : (
                <button
                  onClick={handleBecomeHost}
                  disabled={isBecomeHostPending}
                  className="hidden md:block text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-4 py-2 rounded-full transition-colors disabled:opacity-50"
                >
                  {isBecomeHostPending ? 'Upgrading...' : 'Become a Host'}
                </button>
              )
            )}

            {/* User menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 border border-gray-300 rounded-full px-3 py-2 hover:shadow-md transition-shadow bg-white"
                aria-label="User menu"
              >
                <FiMenu className="w-4 h-4 text-gray-700" />
                {isAuthenticated && user?.avatarUrl ? (
                  <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                    <Image
                      src={user.avatarUrl}
                      alt={user.firstName}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
                    {isAuthenticated && user ? (
                      <span className="text-white text-sm font-medium">
                        {user.firstName.charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      <FiUser className="w-4 h-4 text-white" />
                    )}
                  </div>
                )}
              </button>

              {/* Dropdown */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  {isAuthenticated && user ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100 mb-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/messages"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Messages
                      </Link>
                      <Link
                        href="/experiences"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Experiences
                      </Link>
                      {user.role === 'GUEST' ? (
                        <button
                          onClick={() => { handleBecomeHost(); setIsMenuOpen(false) }}
                          disabled={isBecomeHostPending}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Become a Host
                        </button>
                      ) : (
                        <Link
                          href="/host/new-listing"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Create Listing
                        </Link>
                      )}
                      {user.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          className="block px-4 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Admin Panel
                        </Link>
                      )}
                      <hr className="my-1 border-gray-100" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Log out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="block px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Log in
                      </Link>
                      <Link
                        href="/register"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Sign up
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
