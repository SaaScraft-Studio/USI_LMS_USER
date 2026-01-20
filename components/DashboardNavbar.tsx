'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MoreVertical, LogOut } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/stores/authStore'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

/* ---------------- SAFE IMAGE URL ---------------- */

const getImageUrl = (path?: string | null): string => {
  if (!path) return '/avatar.png'
  if (path.startsWith('blob:')) return path
  if (path.startsWith('http://') || path.startsWith('https://')) return path

  const base = process.env.NEXT_PUBLIC_API_URL
  if (!base) return '/avatar.png'

  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

/* ---------------- COMPONENT ---------------- */

export default function DashboardNavbar() {
  const router = useRouter()

  const { user, isHydrated, logout } = useAuthStore()

  const profileSrc = getImageUrl(user?.profilePicture)

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#B5D9FF] to-[#D6E7FF] shadow-md">
      <div className="flex items-center justify-between h-16 px-4 md:px-[30px]">
        {/* ================= LEFT LOGOS ================= */}
        <Link href="/mylearning">
          <div className="flex items-center gap-2 cursor-pointer">
            <img src="/urological.png" alt="USI" className="h-12" />
            <p className="text-xs font-bold text-[#1F5C9E] leading-tight">
              Urological Society <br /> of India
            </p>

            <div className="h-10 w-[1px] bg-[#1F5C9E] mx-3" />

            <div className="flex items-center gap-2">
              <img src="/ISU_Logo.png" alt="ISU" className="h-12" />
              <p className="text-xs font-bold text-[#1F5C9E] leading-tight">
                Indian School <br /> of Urology
              </p>
            </div>
          </div>
        </Link>

        {/* ================= RIGHT ================= */}
        <div className="flex items-center gap-4">
          {/* ================= MOBILE ================= */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-full hover:bg-black/10">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-64 p-2">
                <DropdownMenuLabel className="flex items-center gap-3 p-2">
                  {!isHydrated ? (
                    <Skeleton className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 rounded-full overflow-hidden border">
                      <img
                        src={profileSrc}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">
                      {user?.name || 'User'}
                    </span>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* ================= DESKTOP ================= */}
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => router.push('/myprofile')}>
              {!isHydrated ? (
                <Skeleton className="w-[45px] h-[45px] rounded-full" />
              ) : (
                <div className="w-[45px] h-[45px] rounded-full overflow-hidden border-2 border-white shadow-sm">
                  <img
                    src={profileSrc}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </button>

            <button
              onClick={handleLogout}
              className="bg-orange-500 text-white font-semibold px-6 py-2 rounded-full hover:bg-orange-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
