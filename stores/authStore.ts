'use client'

import { create } from 'zustand'
import { apiRequest } from '@/lib/apiRequest'

export type AuthUser = {
  id: string
  name: string
  email: string
  mobile?: string
  membershipNumber?: string
  role: 'user'
  status: 'Pending' | 'Approved'
  profilePicture?: string
}

type AuthState = {
  user: AuthUser | null
  isHydrated: boolean

  hydrateUser: () => Promise<void>
  setUser: (user: AuthUser) => void
  updateUser: (data: Partial<AuthUser>) => void
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isHydrated: false,

  /* ---------------- HYDRATE PROFILE ---------------- */
  hydrateUser: async () => {
    const { isHydrated } = get()
    if (isHydrated) return // 🔐 HARD GUARD

    try {
      const profile = await apiRequest({
        endpoint: '/users/profile', // ✅ FULL API URL handled by apiRequest
        method: 'GET',
      })

      set({
        user: {
          id: profile._id,
          name: profile.name,
          email: profile.email,
          mobile: profile.mobile,
          profilePicture: profile.profilePicture,
          role: profile.role,
          status: profile.status,
        },
        isHydrated: true,
      })
    } catch {
      set({ user: null, isHydrated: true })
    }
  },

  /* ---------------- SET USER ---------------- */
  setUser: (user) => set({ user }),

  /* ---------------- UPDATE USER (LIVE) ---------------- */
  updateUser: (data) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : state.user,
    })),

  /* ---------------- LOGOUT ---------------- */
  logout: async () => {
    try {
      await apiRequest({
        endpoint: '/users/logout',
        method: 'POST',
      })
    } finally {
      set({ user: null, isHydrated: true })
    }
  },
}))
