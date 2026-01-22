'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

import Sidebar from '@/components/Sidebar'
import DashboardNavbar from '@/components/DashboardNavbar'
import MobileNavbar from '@/components/MobileNavbar'

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  const { isAuthenticated, isLoading, hydrate } = useAuthStore()

  // =============================
  // 🔐 AUTH BOOTSTRAP
  // =============================
  useEffect(() => {
    hydrate()
  }, [])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isLoading, isAuthenticated, router])

  // ⛔ Prevent UI flicker while checking auth
  if (isLoading) return null

  return (
    <>
      {/* Top Navbar */}
      <DashboardNavbar />

      {/* Mobile Navbar */}
      <div className="block lg:hidden sticky top-[56px] z-50">
        <MobileNavbar />
      </div>

      {/* Main layout */}
      <div className="flex flex-1">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </>
  )
}
