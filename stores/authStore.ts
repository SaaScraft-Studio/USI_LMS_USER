import { create } from 'zustand'
import { apiRequest } from '@/lib/apiRequest'

interface User {
  id: string
  name: string
  email: string
  mobile: string
  role: string
  profilePicture?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean

  setUser: (user: User) => void
  updateUser: (partial: Partial<User>) => void
  clearUser: () => void
  hydrate: () => Promise<void>
  logout: () => Promise<void>
}


export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: true,
      isLoading: false, // ✅ hydration finished
    }),

  updateUser: (partial) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...partial } : state.user,
    })),

  clearUser: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }),

  hydrate: async () => {
    try {
      const data = await apiRequest<
        undefined,
        {
          authenticated: boolean
          user: any
        }
      >({
        endpoint: '/api/users/me',
        method: 'GET',
        showToast: false,
      })

      if (!data.authenticated) throw new Error()

      set({
        user: {
          id: data.user._id,
          name: data.user.name,
          email: data.user.email,
          mobile: data.user.mobile,
          role: data.user.role,
          profilePicture: data.user.profilePicture || '/avatar.png',
        },
        isAuthenticated: true,
        isLoading: false,
      })
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },

  logout: async () => {
    try {
      await apiRequest({
        endpoint: '/api/users/logout',
        method: 'POST',
        showToast: false,
      })
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },
}))

