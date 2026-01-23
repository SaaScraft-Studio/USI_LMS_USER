'use client'

import { useEffect, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MoreVertical, LogOut, Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/stores/authStore'
import { apiRequest } from '@/lib/apiRequest'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog'

/* ---------------- SAFE IMAGE URL ---------------- */

const getImageUrl = (path?: string | null): string => {
  if (!path) return '/avatar.png'
  if (path.startsWith('blob:')) return path
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return path
}

/* ---------------- COMPONENT ---------------- */

export default function DashboardNavbar() {
  const router = useRouter()

  const clearUser = useAuthStore((s) => s.clearUser)

  const [profilePic, setProfilePic] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>('User')
  const [isLoading, setIsLoading] = useState(true)

  const [logoutOpen, setLogoutOpen] = useState(false)
  const [sessionExpired, setSessionExpired] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  /* ================= FETCH PROFILE ================= */

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true)

      const profile = await apiRequest<null, any>({
        endpoint: '/api/users/profile',
        method: 'GET',
        showToast: false,
      })

      setProfilePic(profile.profilePicture || null)
      setUserName(profile.name || 'User')
    } catch {
      setProfilePic(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /* ================= INITIAL LOAD ================= */

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  /* ================= PROFILE UPDATED EVENT ================= */

  useEffect(() => {
    const refetch = () => fetchProfile()
    window.addEventListener('profile-updated', refetch)
    return () => window.removeEventListener('profile-updated', refetch)
  }, [fetchProfile])

  /* ================= SESSION EXPIRED EVENT ================= */

  useEffect(() => {
    const handler = () => setSessionExpired(true)
    window.addEventListener('session-expired', handler)
    return () => window.removeEventListener('session-expired', handler)
  }, [])

  /* ================= LOGOUT HANDLER ================= */

  const performLogout = async () => {
    if (loggingOut) return // 🔒 double-click guard

    try {
      setLoggingOut(true)

      await apiRequest({
        endpoint: '/api/users/logout',
        method: 'POST',
        showToast: false,
      })

      clearUser()
      setLogoutOpen(false)
      setSessionExpired(false)

      router.replace('/login')
      router.refresh()
    } catch (err: any) {
      // ❗ dialog stays open → retry possible
    } finally {
      setLoggingOut(false)
    }
  }

  const profileSrc = getImageUrl(profilePic)

  /* ================= UI ================= */

  return (
    <>
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
                    {isLoading ? (
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

                    <span className="text-sm font-semibold">
                      {userName}
                    </span>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => setLogoutOpen(true)}
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
                {isLoading ? (
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
                onClick={() => setLogoutOpen(true)}
                className="bg-orange-500 text-white font-semibold px-6 py-2 rounded-full hover:bg-orange-600 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ================= LOGOUT CONFIRM DIALOG ================= */}
      <AlertDialog open={logoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? This will end your session and
              you will need to login again.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <button
              disabled={loggingOut}
              onClick={() => setLogoutOpen(false)}
              className="px-4 py-2 rounded-md border"
            >
              Cancel
            </button>

            <button
              disabled={loggingOut}
              onClick={performLogout}
              className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-white disabled:opacity-60"
            >
              {loggingOut && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Logout
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ================= SESSION EXPIRED DIALOG ================= */}
      <AlertDialog open={sessionExpired}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Session Expired</AlertDialogTitle>
            <AlertDialogDescription>
              Your session has expired. Please login again.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <button
              onClick={performLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-2 rounded-md bg-orange-600 px-4 py-2 text-white disabled:opacity-60"
            >
              {loggingOut && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Login Again
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
