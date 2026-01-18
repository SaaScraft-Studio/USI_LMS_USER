'use client'

import { useAuthStore } from '@/stores/authStore'

let isRefreshing = false
let refreshPromise: Promise<void> | null = null

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = fetch('/api/users/refresh-token', {
      method: 'POST',
      credentials: 'include',
    }).then((res) => {
      if (!res.ok) {
        throw new Error('Refresh failed')
      }
    }).finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}

export async function fetchClient(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  })

  // 🔐 Access token expired
  if (response.status === 401) {
    try {
      if (!isRefreshing) {
        isRefreshing = true
        await refreshAccessToken()
        isRefreshing = false
      } else {
        await refreshPromise
      }

      // retry original request
      return fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      })
    } catch {
      // 🚨 HARD SESSION EXPIRY
      isRefreshing = false

      // clear frontend auth state
      useAuthStore.getState().logout()

      // redirect
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }

      throw new Error('Session expired. Please login again.')
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.message || 'Request failed')
  }

  return response
}
