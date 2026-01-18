// lib/apiRequest.ts
import { fetchClient } from './fetchClient'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface ApiRequestConfig<TBody, TResponse> {
  endpoint: string
  method?: HttpMethod
  body?: TBody
  params?: Record<string, any>
  showToast?: boolean
  successMessage?: string
  onSuccess?: (data: TResponse) => void
}

export async function apiRequest<
  TBody = unknown,
  TResponse = any
>({
  endpoint,
  method = 'POST',
  body,
  params,
  showToast = false,
  successMessage,
  onSuccess,
}: ApiRequestConfig<TBody, TResponse>): Promise<TResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL!

  // ✅ SUPPORT RELATIVE + ABSOLUTE BASE URL
  const url =
    baseUrl.startsWith('http')
      ? new URL(`${baseUrl}${endpoint}`)
      : new URL(`${baseUrl}${endpoint}`, window.location.origin)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value))
      }
    })
  }

  const isFormData = body instanceof FormData

  const response = await fetchClient(url.toString(), {
    method,
    body: body
      ? isFormData
        ? body
        : JSON.stringify(body)
      : undefined,
  })

  /* ------------------------------------------------------------------ */
  /* 🔐 HARD SESSION EXPIRY (SINGLE SOURCE OF TRUTH)                     */
  /* ------------------------------------------------------------------ */
  // if (response.status === 401) {
  //   // clear frontend auth state
  //   const store = useAuthStore.getState()
  //   await store.logout()

  //   // redirect ONCE
  //   if (typeof window !== 'undefined') {
  //     window.location.replace('/login')
  //   }

  //   throw new Error('Session expired. Please login again.')
  // }

  /* ------------------------------------------------------------------ */

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.message || 'Request failed')
  }

  const data =
    response.status !== 204
      ? ((await response.json()) as TResponse)
      : ({} as TResponse)

  if (showToast) {
    toast.success(successMessage || 'Operation completed successfully')
  }

  onSuccess?.(data)
  return data
}
