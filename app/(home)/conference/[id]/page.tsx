'use client'

import { use, useMemo, useState } from 'react'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import SessionCard from '@/components/SessionCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type PageProps = {
  params: Promise<{ id: string }>
}

const DATE_COLORS = ['#9f1239', '#86198f', '#86198f', '#065f46', '#155e75']

/** Dark hall colors (tabs + headers) */
export const HALL_COLORS = [
  'bg-green-800',
  'bg-gray-800',
  'bg-red-800',
  'bg-blue-800',
  'bg-purple-800',
  'bg-amber-800',
  'bg-rose-800',
  'bg-violet-800',
  'bg-emerald-800',
  'bg-sky-800',
]

/** Light versions for topics */
export const HALL_LIGHT_COLORS = [
  'bg-green-100',
  'bg-gray-100',
  'bg-red-100',
  'bg-blue-100',
  'bg-purple-100',
  'bg-amber-100',
  'bg-rose-100',
  'bg-violet-100',
  'bg-emerald-100',
  'bg-sky-100',
]



export default function ProgramSchedulePage({ params }: PageProps) {
  const { id: conferenceId } = use(params)

  const { data, isLoading } = useSWR(
    conferenceId
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/conferences/${conferenceId}/topics`
      : null,
    fetcher
  )

  const [view, setView] = useState<'list' | 'collapse'>('list')
  const [search, setSearch] = useState('')
  const [activeHall, setActiveHall] = useState<string | null>(null)
  const [activeDate, setActiveDate] = useState<string | null>(null)

  /* ================= TABS ================= */

  const halls = useMemo(() => {
    if (!data?.data) return []
    return Array.from(
      new Set(
        data.data.map(
          (t: any) => t.sessionId.hallId.hallName
        )
      )
    )
  }, [data])

  const dates = useMemo(() => {
    if (!data?.data) return []
    return Array.from(
      new Set(data.data.map((t: any) => t.sessionId.sessionDate))
    )
  }, [data])

  /* ================= GROUP DATA ================= */

  const grouped = useMemo(() => {
    if (!data?.data) return []

    const map = new Map<string, any>()

    data.data.forEach((t: any) => {
      const date = t.sessionId.sessionDate
      const hall = t.sessionId.hallId.hallName

      if (activeHall && hall !== activeHall) return
      if (activeDate && date !== activeDate) return

      const searchable = `
        ${t.title}
        ${t.sessionId.sessionName}
        ${t.speakerId?.map((s: any) => s.speakerName).join(' ')}
        ${t.panelist?.map((p: any) => p.speakerName).join(' ')}
        ${t.teamMember?.map((m: any) => m.speakerName).join(' ')}
      `.toLowerCase()

      if (search && !searchable.includes(search.toLowerCase())) return

      const key = `${date}__${hall}`

      if (!map.has(key)) {
        map.set(key, {
          date,
          hall,
          hallIndex: halls.indexOf(hall),
          sessions: new Map(),
        })
      }

      const group = map.get(key)
      const sid = t.sessionId._id

      if (!group.sessions.has(sid)) {
        group.sessions.set(sid, {
          session: t.sessionId,
          topics: [],
        })
      }

      group.sessions.get(sid).topics.push(t)
    })

    return Array.from(map.values())
  }, [data, search, activeHall, activeDate, halls])

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <SessionCard.Skeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* ===== HEADER ===== */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Session Details</h1>

        <div className="flex justify-center gap-2">
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            onClick={() => setView('list')}
          >
            List View
          </Button>
          <Button
            variant={view === 'collapse' ? 'default' : 'outline'}
            onClick={() => setView('collapse')}
          >
            Collapsible View
          </Button>
        </div>

        <div className="max-w-xl mx-auto">
          <Input
            placeholder="Search sessions & topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ===== STICKY DATE TABS ===== */}
      <div className="bg-background">
        <div className="flex justify-center gap-2 flex-wrap">
          {dates.map((date, i) => {
            const isActive = activeDate === String(date)

            return (
              <button
                key={String(date)}
                onClick={() => setActiveDate(String(date))}
                className={`px-4 py-2 rounded-lg text-sm transition-colors
            ${isActive
                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                    : 'text-white'
                  }
          `}
                style={{
                  backgroundColor: isActive ? undefined : DATE_COLORS[i % 5],
                }}
              >
                {String(date)}
              </button>
            )
          })}
        </div>
      </div>

      {/* ===== STICKY HALL TABS ===== */}
      <div className="sticky top-0 z-30 bg-background py-2">
        <div className="flex justify-center gap-2 flex-wrap">
          {halls.map((hall, i) => (
            <button
              key={String(hall)}
              onClick={() => setActiveHall(String(hall))}
              className={`px-4 py-2 rounded-lg text-white text-sm ${
                HALL_COLORS[i % 10]
              } ${activeHall === hall ? 'ring-2 ring-gray' : ''}`}
            >
              {String(hall)}
            </button>
          ))}
        </div>
      </div>


      {/* ===== CONTENT ===== */}
      {grouped.map((group, i) => (
        <div key={i} className="space-y-0">
          <div
            className={`text-white text-center py-3 rounded-t-lg ${
              HALL_COLORS[group.hallIndex % 10]
            }`}
          >
            {group.date} – {group.hall}
          </div>

          <div className="border border-t-0 rounded-b-lg p-4 space-y-4 bg-white">
            {Array.from(group.sessions.values()).map(
              (s: any, idx: number) => (
                <SessionCard
                  key={s.session._id}
                  conferenceId={conferenceId}
                  session={s.session}
                  topics={s.topics}
                  view={view}
                  hallIndex={group.hallIndex}
                />
              )
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
