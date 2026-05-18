'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, Camera, Loader as Loader2 } from 'lucide-react'
import useAuthStore from '@/store/authStore'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { useUpdateProfile } from '@/hooks/useAuth'
import { useBecomeHost } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-utils'

async function uploadAvatar(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch('/api/upload', { method: 'POST', body: formData })
  if (!res.ok) throw new Error('Upload failed')
  const data = await res.json()
  return data.url as string
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const hasHydrated = useHasHydrated()
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile()
  const { mutate: becomeHost, isPending: isBecomeHostPending } = useBecomeHost()

  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', avatarUrl: '' })
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  useEffect(() => {
    if (!hasHydrated) return
    if (!isAuthenticated) { router.push('/login'); return }
    if (user) setForm({ firstName: user.firstName, lastName: user.lastName, phone: user.phone || '', avatarUrl: user.avatarUrl || '' })
  }, [hasHydrated, isAuthenticated, user, router])

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const url = await uploadAvatar(file)
      setForm((prev) => ({ ...prev, avatarUrl: url }))
    } catch {
      toast.error('Failed to upload photo.')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateProfile({ firstName: form.firstName, lastName: form.lastName, phone: form.phone || undefined, avatarUrl: form.avatarUrl || undefined })
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile.')
    }
  }

  if (!hasHydrated || !isAuthenticated || !user) return null

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center gap-2 mb-8">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />Dashboard</Link>
            </Button>
          </div>

          <h1 className="text-3xl font-bold mb-2">Your profile</h1>
          <p className="text-muted-foreground mb-8">Manage your personal information.</p>

          {/* Avatar section */}
          <Card className="mb-8">
            <CardContent className="p-5 flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={form.avatarUrl} />
                  <AvatarFallback className="text-2xl font-bold">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute -bottom-1 -right-1 h-7 w-7 bg-foreground rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                  {uploadingAvatar ? <Loader2 className="h-3.5 w-3.5 animate-spin text-background" /> : <Camera className="h-3.5 w-3.5 text-background" />}
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>
              <div>
                <p className="font-semibold">{user.firstName} {user.lastName}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Mail className="h-3.5 w-3.5" />{user.email}
                </p>
                <Badge variant="secondary" className="mt-1">{user.role}</Badge>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>First name</Label>
                <Input value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <Label>Last name</Label>
                <Input value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={user.email} disabled className="opacity-60 cursor-not-allowed" />
              <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
            </div>

            <div className="space-y-1.5">
              <Label>Phone number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="tel" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="+1 (555) 000-0000" className="pl-10" />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isPending || uploadingAvatar}>
              {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : 'Save changes'}
            </Button>
          </form>

          {user.role === 'GUEST' && (
            <div className="mt-8 pt-8 border-t border-border">
              <h2 className="text-lg font-semibold mb-2">Become a host</h2>
              <p className="text-muted-foreground text-sm mb-4">Start hosting and earn money from your space.</p>
              <Button variant="outline" className="w-full" onClick={() => becomeHost(undefined, { onSuccess: () => toast.success('You are now a host!'), onError: (err) => toast.error(getApiErrorMessage(err, 'Failed to become a host.')) })} disabled={isBecomeHostPending}>
                {isBecomeHostPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</> : 'Become a host'}
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
