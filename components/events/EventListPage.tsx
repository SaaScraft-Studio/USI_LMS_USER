// components/events/EventListPage.tsx
'use client'

import { useState, useEffect } from 'react'
import getPaginationPages from '@/utils/getPaginationPages'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import SkeletonLoading from '@/components/SkeletonLoading'
import { useAuthStore } from '@/stores/authStore'
import { useEventList } from '@/hooks/useEventList'
import { EventType, EventListItem } from '@/lib/events/eventTypes'
import { eventConfig } from '@/lib/events/eventConfig'
import EventCard from './EventCard'
import EventRegisterDialog from './EventRegisterDialog'
import { apiRequest } from '@/lib/apiRequest'

interface Props {
  type: EventType
}

export default function EventListPage({ type }: Props) {
  const cfg = eventConfig[type]
  const user = useAuthStore((s) => s.user)

  const [loadingRegs, setLoadingRegs] = useState(true)
  const [registeredIds, setRegisteredIds] = useState<string[]>([])
  const [jumpPage, setJumpPage] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selected, setSelected] = useState<EventListItem | null>(null)

  const {
    loading,
    events,
    tab,
    setTab,
    q,
    setQ,
    sortOrder,
    setSortOrder,
    page,
    setPage,
    totalPages,
  } = useEventList(type)

  /* ---------------- FETCH REGISTRATIONS ---------------- */
  useEffect(() => {
    if (!user?.id) {
      setRegisteredIds([])
      setLoadingRegs(false)
      return
    }

    const fetchRegistrations = async () => {
      try {
        setLoadingRegs(true)
        const res = await apiRequest({
          endpoint: `/webinar/registrations/${user.id}`,
          method: 'GET',
        })
        setRegisteredIds(res.data.map((r: any) => r.webinar._id))
      } catch {
        setRegisteredIds([])
      } finally {
        setLoadingRegs(false)
      }
    }

    fetchRegistrations()
  }, [user?.id])

  /* ---------------- KEYBOARD PAGINATION ---------------- */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && page > 1) setPage((p) => p - 1)
      if (e.key === 'ArrowRight' && page < totalPages) setPage((p) => p + 1)
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [page, totalPages, setPage])

  if (loading) return <SkeletonLoading />

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-[#252641] mb-4">
        {cfg.title}
      </h1>

      {/* TABS */}
      <div className="flex gap-6 border-b pb-3 mb-6">
        {(['Live', 'Upcoming', 'Past', 'All'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-1 text-sm font-medium ${
              tab === t
                ? 'text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-500'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* SEARCH + SORT */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search..."
          className="w-full sm:w-80 px-4 py-2 rounded-lg border"
        />

        <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as any)}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loadingRegs
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonLoading key={i} />)
          : events.map((e) => (
              <EventCard
                key={e._id}
                event={e}
                type={type}
                isRegistered={registeredIds.includes(e._id)}
                onRegister={() => {
                  setSelected(e)
                  setDialogOpen(true)
                }}
              />
            ))}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-10">
          <Button
            size="sm"
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </Button>

          {getPaginationPages(page, totalPages).map((item, idx) =>
            item === 'dots' ? (
              <span key={idx} className="px-2 text-gray-500">
                ...
              </span>
            ) : (
              <Button
                key={item}
                size="sm"
                variant={page === item ? 'default' : 'outline'}
                className={
                  page === item
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'border-gray-300 text-gray-700 hover:border-orange-600 hover:text-orange-600'
                }
                onClick={() => setPage(item)}
              >
                {item}
              </Button>
            )
          )}

          <Button
            size="sm"
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>

          {/* Jump to page */}
          <div className="flex items-center gap-2 ml-2">
            <span className="text-sm">Go to</span>
            <input
              type="number"
              placeholder='3'
              min={1}
              max={totalPages}
              value={jumpPage}
              onChange={(e) => setJumpPage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const p = Number(jumpPage)
                  if (p >= 1 && p <= totalPages) {
                    setPage(p)
                    setJumpPage('')
                  }
                }
              }}
              className="w-16 px-2 py-1 border rounded text-sm"
            />
          </div>
        </div>
      )}

      <EventRegisterDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        event={selected}
        userId={user?.id}
        onSuccess={(id) => setRegisteredIds((prev) => [...prev, id])}
      />
    </div>
  )
}
