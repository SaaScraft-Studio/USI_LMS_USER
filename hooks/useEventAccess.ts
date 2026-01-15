// hooks/useEventAccess.ts

'use client'

import { useEffect, useState } from 'react'
import { apiRequest } from '@/lib/apiRequest'
import { EventDetail } from '@/lib/events/eventTypes'

export function useEventAccess(eventId?: string, userId?: string) {
  const [event, setEvent] = useState<EventDetail | null>(null)
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!eventId || !userId) return

    const fetchData = async () => {
      try {
        const [eventRes, regRes] = await Promise.all([
          apiRequest({
            endpoint: `/api/webinars/active/${eventId}`,
            method: 'GET',
          }),
          apiRequest({
            endpoint: `/api/webinar/registrations/${userId}`,
            method: 'GET',
          }),
        ])

        const registeredIds = regRes.data.map((r: any) => r.webinar._id)

        if (!registeredIds.includes(eventId)) {
          setHasAccess(false)
          return
        }

        setHasAccess(true)
        setEvent(eventRes.data)
      } catch {
        setEvent(null)
        setHasAccess(false)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [eventId, userId])

  return { event, hasAccess, loading }
}
