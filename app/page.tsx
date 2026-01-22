'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, isLoading, hydrate } = useAuthStore()

  // 🔐 Bootstrap auth once
  useEffect(() => {
    hydrate()
  }, [])

  // 🔁 Redirect after auth check
  useEffect(() => {
    if (isLoading) return

    if (isAuthenticated) {
      router.replace('/upcoming')
    } else {
      router.replace('/login')
    }
  }, [isLoading, isAuthenticated])
  return null
}
