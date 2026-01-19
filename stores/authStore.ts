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
  qualification?: string
  affiliation?: string
  country?: string
  city?: string
  state?: string
  pincode?: string
}

type AuthState = {
  user: AuthUser | null
  isHydrated: boolean

  setUser: (user: AuthUser) => void
  updateUser: (data: Partial<AuthUser>) => void
  hydrateUser: () => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isHydrated: false,

  setUser: (user) => set({ user }),

  // ✅ THIS IS THE KEY FIX
  updateUser: (data) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : state.user,
    })),

 hydrateUser: async () => {
  const { isHydrated } = useAuthStore.getState()
  if (isHydrated) return   // 🔐 HARD GUARD

  try {
    const profile = await apiRequest({
      endpoint: '/users/profile',
      method: 'GET',
    })

    set({
      user: {
        id: profile._id,
        name: profile.name,
        email: profile.email,
        mobile: profile.mobile,
        role: profile.role,
        status: profile.status,
      },
      isHydrated: true,
    })
  } catch {
    set({ user: null, isHydrated: true })
  }
},


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
