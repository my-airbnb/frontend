'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiCamera } from 'react-icons/fi'
import toast from 'react-hot-toast'
import useAuthStore from '@/store/authStore'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { useUpdateProfile } from '@/hooks/useAuth'

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ''
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ''

async function uploadAvatar(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  )
  if (!res.ok) throw new Error('Upload failed')
  const data = await res.json()
  return data.secure_url as string
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const hasHydrated = useHasHydrated()
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile()

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    avatarUrl: '',
  })
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  useEffect(() => {
    if (!hasHydrated) return
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    if (user) {
      setForm({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
        avatarUrl: user.avatarUrl || '',
      })
    }
  }, [hasHydrated, isAuthenticated, user, router])

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      toast.error('Photo upload not configured.')
      return
    }
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
      await updateProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || undefined,
        avatarUrl: form.avatarUrl || undefined,
      })
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile.')
    }
  }

  if (!hasHydrated || !isAuthenticated || !user) return null

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium">
          <FiArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Your profile</h1>
      <p className="text-gray-500 mb-8">Manage your personal information.</p>

      {/* Avatar */}
      <div className="flex items-center gap-6 mb-8 p-5 bg-gray-50 rounded-2xl border border-gray-200">
        <div className="relative">
          {form.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.avatarUrl}
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover border-2 border-white shadow"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-3xl font-bold">
              {user.firstName.charAt(0).toUpperCase()}
            </div>
          )}
          <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors">
            {uploadingAvatar ? (
              <div className="w-3 h-3 border-t-2 border-white rounded-full animate-spin" />
            ) : (
              <FiCamera className="w-3.5 h-3.5 text-white" />
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </label>
        </div>
        <div>
          <p className="font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
            <FiMail className="w-3.5 h-3.5" />
            {user.email}
          </p>
          <span className="inline-block mt-1 text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {user.role}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">First name</label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
              required
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Last name</label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
              required
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="label">Email</label>
          <input
            type="email"
            value={user.email}
            disabled
            className="input-field opacity-60 cursor-not-allowed bg-gray-50"
          />
          <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
        </div>

        <div>
          <label className="label">Phone number</label>
          <div className="relative">
            <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              placeholder="+1 (555) 000-0000"
              className="input-field pl-10"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending || uploadingAvatar}
            className="w-full btn-primary disabled:opacity-60"
          >
            {isPending ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
