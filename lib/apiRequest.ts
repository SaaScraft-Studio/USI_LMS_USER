// lib/apiRequest.ts
import { fetchClient } from './fetchClient'
import { toast } from 'sonner'

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

  const url = new URL(`${baseUrl}${endpoint}`)

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

  /* ======================================================
     🔐 GLOBAL SESSION HANDLING (PLACE IT HERE)
     ====================================================== */
  if (response.status === 401 || response.status === 403) {
    window.dispatchEvent(new Event('session-expired'))
    throw new Error('Session expired')
  }

  /* ====================================================== */

  const data =
    response.status !== 204
      ? ((await response.json()) as TResponse)
      : ({} as TResponse)

  if (!response.ok) {
    throw new Error(
      (data as any)?.message || 'Something went wrong'
    )
  }

  if (showToast) {
    toast.success(successMessage || 'Operation completed successfully')
  }

  onSuccess?.(data)
  return data
}
