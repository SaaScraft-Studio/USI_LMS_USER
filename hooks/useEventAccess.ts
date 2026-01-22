// hooks/useEventAccess.ts

'use client'

import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { EventDetail } from '@/lib/events/eventTypes'

export function useEventAccess(eventId?: string, userId?: string) {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL

  /* ---------------- FETCH EVENT ---------------- */

  const {
    data: eventRes,
    isLoading: eventLoading,
  } = useSWR<{ data: EventDetail }>(
    eventId ? `${API_BASE}/api/webinars/active/${eventId}` : null,
    fetcher
  )

  /* ---------------- FETCH REGISTRATIONS ---------------- */

  const {
    data: regRes,
    isLoading: regLoading,
  } = useSWR<{ data: any[] }>(
    userId ? `${API_BASE}/api/webinar/registrations/${userId}` : null,
    fetcher
  )

  /* ---------------- DERIVED STATE ---------------- */

  const loading = eventLoading || regLoading

  if (loading) {
    return {
      event: null,
      hasAccess: false,
      loading: true,
    }
  }

  const registeredIds =
    regRes?.data?.map((r) => r.webinar._id) ?? []

  const hasAccess =
    !!eventId && registeredIds.includes(eventId)

  return {
    event: hasAccess ? eventRes?.data ?? null : null,
    hasAccess,
    loading: false,
  }
}
