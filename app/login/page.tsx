'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SiAirbnb } from 'react-icons/si'
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi'
import useAuth from '@/hooks/useAuth'

export default function LoginPage() {
  const { login, isLoginLoading, loginError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
    } catch {
      // Error is handled by the hook
    }
  }

  const errorMessage =
    (loginError as { response?: { data?: { message?: string } } })?.response?.data?.message ||
    (loginError ? 'Invalid email or password. Please try again.' : null)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-card p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2">
              <SiAirbnb className="w-10 h-10 text-primary" />
              <span className="text-2xl font-bold text-primary">airbnb</span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Welcome back</h1>
          <p className="text-gray-500 text-center mb-8 text-sm">
            Sign in to your account to continue
          </p>

          {/* Error */}
          {errorMessage && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">
              <FiAlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="label">
                Email address
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="input-field pl-11"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="input-field pl-11"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoginLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoginLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4l-3 3-3-3h4z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </div>
        </div>

        {/* Back to home */}
        <p className="text-center mt-6 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600">
            &larr; Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}
