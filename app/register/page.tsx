'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Home, Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import useAuth, { useGoogleAuth } from '@/hooks/useAuth'
import { GoogleLogin } from '@react-oauth/google'

function RegisterForm() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const { register, isRegisterLoading, registerError } = useAuth()
  const googleAuth = useGoogleAuth()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [validationError, setValidationError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setValidationError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      setValidationError('Passwords do not match.')
      return
    }
    if (form.password.length < 8) {
      setValidationError('Password must be at least 8 characters.')
      return
    }
    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      }, redirect)
    } catch {
      // handled by hook
    }
  }

  const errorMessage =
    validationError ||
    (registerError as { response?: { data?: { message?: string } } })?.response?.data?.message ||
    (registerError ? 'Registration failed. Please try again.' : null)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex justify-center mb-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                  <Home className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-2xl font-bold text-foreground">Airbnb</span>
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-foreground text-center">Create your account</h1>
            <p className="text-muted-foreground text-center text-sm mt-1">
              Join millions of people discovering great places
            </p>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 mb-6 text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">First name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      placeholder="John"
                      required
                      autoComplete="given-name"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    required
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 8 characters"
                    required
                    autoComplete="new-password"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat your password"
                    required
                    autoComplete="new-password"
                    className="pl-10"
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                By creating an account, you agree to our{' '}
                <a href="#" className="underline hover:text-foreground">Terms of Service</a>{' '}
                and{' '}
                <a href="#" className="underline hover:text-foreground">Privacy Policy</a>.
              </p>

              <Button type="submit" className="w-full" disabled={isRegisterLoading}>
                {isRegisterLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or sign up with</span>
                </div>
              </div>
              <div className="mt-4 flex justify-center">
                <GoogleLogin
                  onSuccess={(res) => {
                    if (res.credential) googleAuth.mutate({ credential: res.credential, redirectTo: redirect })
                  }}
                  onError={() => {}}
                  theme="outline"
                  size="large"
                  width="360"
                />
              </div>
              {googleAuth.isError && (
                <p className="mt-2 text-center text-sm text-destructive">Google sign-up failed. Please try again.</p>
              )}
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            &larr; Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}
