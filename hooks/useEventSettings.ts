'use client'

import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { EventSettings } from '@/lib/events/eventTypes'

export function useEventSettings(eventId?: string, enabled?: boolean) {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL!

  const { data } = useSWR<{ data: Partial<EventSettings> }>(
    eventId && enabled
      ? `${API_BASE}/api/webinars/${eventId}/settings`
      : null,
    fetcher
  )

  if (!data?.data) return null

  // ✅ Preserve original normalization logic
  return {
    faculty: !!data.data.faculty,
    faq: !!data.data.faq,
    feedback: !!data.data.feedback,
    quiz: !!data.data.quiz,
    meeting: !!data.data.meeting,
    question: !!data.data.question,
    summary: !!data.data.summary,
  } satisfies EventSettings
}
