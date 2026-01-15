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

const HALL_COLORS = [
  '#000000',
  '#f97316',
  '#16a34a',
  '#7c3aed',
  '#a16207',
  '#dc2626',
  '#2563eb',
  '#0f766e',
  '#9333ea',
  '#475569',
]

const DATE_COLORS = ['#ec4899', '#8b5cf6', '#ef4444', '#22c55e', '#0ea5e9']

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

  /* ================= EXTRACT TABS ================= */

  const halls = useMemo(() => {
    if (!data?.data) return []
    return Array.from(
      new Set(
        data.data.map(
          (t: any) => t.sessionId.hallId?.hallName || t.sessionId.hallId
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
      const hall = t.sessionId.hallId?.hallName || t.sessionId.hallId || 'Hall'

      if (activeHall && hall !== activeHall) return
      if (activeDate && date !== activeDate) return

      const searchable = `
        ${t.title}
        ${t.sessionId.sessionName}
        ${t.speakerId?.map((s: any) => s.speakerName).join(' ')}
        ${t.moderator}
        ${t.quizMaster}
        ${t.panelist?.join(' ')}
        ${t.teamMember?.join(' ')}
      `.toLowerCase()

      if (search && !searchable.includes(search.toLowerCase())) return

      const key = `${date}__${hall}`

      if (!map.has(key)) {
        map.set(key, {
          date,
          hall,
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
  }, [data, search, activeHall, activeDate])

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
            placeholder="Search sessions and topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ===== STICKY HALL TABS ===== */}
      <div className="sticky top-0 z-30 bg-background py-2">
        <div className="flex justify-center gap-2 flex-wrap">
          {halls.map((hall, i) => (
            <button
              key={String(hall)}
              onClick={() => setActiveHall(String(hall))}
              className={`px-4 py-2 rounded text-white text-sm ${
                activeHall === String(hall) ? 'ring-2 ring-black' : ''
              }`}
              style={{ backgroundColor: HALL_COLORS[i % 10] }}
            >
              {String(hall)}
            </button>
          ))}
        </div>
      </div>

      {/* ===== STICKY DATE TABS ===== */}
      <div className="sticky top-[56px] z-20 bg-background py-2">
        <div className="flex justify-center gap-2 flex-wrap">
          {dates.map((date, i) => (
            <button
              key={String(date)}
              onClick={() => setActiveDate(String(date))}
              className={`px-4 py-2 rounded text-white text-sm ${
                activeDate === date ? 'ring-2 ring-black' : ''
              }`}
              style={{ backgroundColor: DATE_COLORS[i % 5] }}
            >
              {String(date)}
            </button>
          ))}
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      {grouped.map((group, i) => (
        <div key={i} className="space-y-0">
          <div
            className="text-white text-center py-3 rounded-t-lg"
            style={{ backgroundColor: DATE_COLORS[i % 5] }}
          >
            {group.date} – {group.hall}
          </div>

          <div className="border border-t-0 rounded-b-lg p-4 space-y-4 bg-white">
            {Array.from(group.sessions.values()).map((s: any, idx: number) => (
              <SessionCard
                key={s.session._id}
                session={s.session}
                topics={s.topics}
                view={view}
                index={idx}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
