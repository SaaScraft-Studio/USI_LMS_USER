// hooks/useEventMeeting.ts

'use client'

import { useEffect, useState } from 'react'
import { apiRequest } from '@/lib/apiRequest'
import { MeetingData } from '@/lib/events/eventTypes'

export function useEventMeeting(eventId?: string, enabled?: boolean) {
  const [meeting, setMeeting] = useState<MeetingData | null>(null)

  useEffect(() => {
    if (!eventId || !enabled) return

    const fetchMeeting = async () => {
      try {
        const res = await apiRequest({
          endpoint: `/api/meetings/${eventId}`,
          method: 'GET',
        })
        setMeeting(res?.data ?? null)
      } catch {
        setMeeting(null)
      }
    }

    fetchMeeting()
  }, [eventId, enabled])

  return meeting
}
