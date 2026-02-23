// components/events/EventListPage.tsx
'use client'
import { useState, useEffect } from 'react'
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
import Pagination from '../Pagination'

interface Props {
  type: EventType
}

export default function EventListPage({ type }: Props) {
  const cfg = eventConfig[type]
  const user = useAuthStore((s) => s.user)

  const [loadingRegs, setLoadingRegs] = useState(true)
  const [registeredIds, setRegisteredIds] = useState<string[]>([])
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
          endpoint: `/api/webinar/registrations/${user.id}`,
          method: 'GET',
        })
        const ids =
          res?.data
            ?.map((r: any) => r?.webinar?._id)
            ?.filter((id: any): id is string => Boolean(id)) ?? []

        setRegisteredIds(ids)
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
            className={`pb-1 text-sm font-medium ${tab === t
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
        {loadingRegs ? (
          Array.from({ length: 4 }).map((_, i) => (
            <SkeletonLoading key={i} />
          ))
        ) : events?.length > 0 ? (
          events.map((e) =>
            e?._id ? (
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
            ) : null
          )
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-16">
            <img
              src="/no.png"
              alt="No program"
              className="w-50 h-50 object-cover"
            />

            <p className="text-gray-500 text-sm mb-4">
              No program found matching your search criteria.
            </p>

            {(q || tab !== 'All') && (
              <Button
                onClick={() => {
                  setQ('')
                  setTab('All')
                }}
                className="mt-6 bg-blue-600 hover:bg-blue-700"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>

     {/* Pagination */}
     <Pagination
  page={page}
  totalPages={totalPages}
  onChange={setPage}
/>
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
