// hooks/useEventList.ts
'use client'

import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from '@/lib/apiRequest'
import { EventListItem, EventType } from '@/lib/events/eventTypes'
import { eventConfig } from '@/lib/events/eventConfig'

const PAGE_SIZE = 20
const TABS = ['Live', 'Upcoming', 'Past', 'All'] as const

export type TabType = (typeof TABS)[number]
export type SortOrder = 'newest' | 'oldest'

/* ✅ SAFE DATE PARSER (DD/MM/YYYY) */
const parseDMY = (date: string) => {
  if (!date) return 0
  const [day, month, year] = date.split('/')
  return new Date(Number(year), Number(month) - 1, Number(day)).getTime()
}

export function useEventList(type: EventType) {
  const [events, setEvents] = useState<EventListItem[]>([])
  const [loading, setLoading] = useState(true)

  const [tab, setTab] = useState<TabType>('All')
  const [q, setQ] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [page, setPage] = useState(1)

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        const res = await apiRequest({
          endpoint: eventConfig[type].listEndpoint,
          method: 'GET',
        })
        setEvents(res.data || [])
      } catch {
        setEvents([])
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [type])

  /* ---------------- FILTER ---------------- */
  const filtered = useMemo(() => {
    let list =
      tab === 'All' ? events : events.filter((e) => e.dynamicStatus === tab)

    if (q.trim()) {
      const query = q.toLowerCase()
      list = list.filter((e) => e.name.toLowerCase().includes(query))
    }

    return list
  }, [events, tab, q])

  /* ---------------- SORT (GLOBAL, BEFORE PAGINATION) ---------------- */
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const d1 = parseDMY(a.startDate)
      const d2 = parseDMY(b.startDate)
      return sortOrder === 'newest' ? d2 - d1 : d1 - d2
    })
  }, [filtered, sortOrder])

  /* ✅ RESET PAGE WHEN SORT / TAB / SEARCH CHANGES */
  useEffect(() => {
    setPage(1)
  }, [sortOrder, tab, q])

  /* ---------------- PAGINATION ---------------- */
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return sorted.slice(start, start + PAGE_SIZE)
  }, [sorted, page])

  return {
    loading,
    events: paginated,
    tab,
    setTab,
    q,
    setQ,
    sortOrder,
    setSortOrder,
    page,
    setPage,
    totalPages,
  }
}
