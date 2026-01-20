'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const hydrateUser = useAuthStore((s) => s.hydrateUser)

  useEffect(() => {
    hydrateUser()
  }, [hydrateUser])

  return <>{children}</>
}
