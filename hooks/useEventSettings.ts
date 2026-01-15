// hooks/useEventSettings.ts

'use client'

import { useEffect, useState } from 'react'
import { apiRequest } from '@/lib/apiRequest'
import { EventSettings } from '@/lib/events/eventTypes'

export function useEventSettings(eventId?: string, enabled?: boolean) {
  const [settings, setSettings] = useState<EventSettings | null>(null)

  useEffect(() => {
    if (!eventId || !enabled) return

    const fetchSettings = async () => {
      try {
        const res = await apiRequest({
          endpoint: `/api/webinars/${eventId}/settings`,
          method: 'GET',
        })

        setSettings({
          faculty: !!res.data?.faculty,
          faq: !!res.data?.faq,
          feedback: !!res.data?.feedback,
          quiz: !!res.data?.quiz,
          meeting: !!res.data?.meeting,
          question: !!res.data?.question,
        })
      } catch {
        setSettings(null)
      }
    }

    fetchSettings()
  }, [eventId, enabled])

  return settings
}
