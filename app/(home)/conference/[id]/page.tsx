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

  /* ================= SORTED DATES (DD/MM/YYYY SAFE) ================= */

  const parseIndianDate = (dateStr?: string) => {
    if (!dateStr) return null
    const [day, month, year] = dateStr.split('/').map(Number)
    if (!day || !month || !year) return null
    return new Date(year, month - 1, day) // JS month is 0-indexed
  }

  const dates = useMemo(() => {
    if (!data?.data) return []

    // 1️⃣ Get unique dates safely
    const uniqueDates = Array.from(
      new Set(
        data.data
          .map((t: any) => t?.sessionId?.sessionDate)
          .filter(Boolean)
      )
    ) as string[]

    // 2️⃣ Sort ascending (DD/MM/YYYY aware)
    uniqueDates.sort((a, b) => {
      const da = parseIndianDate(a)
      const db = parseIndianDate(b)

      // 🛡 Safe fallback if parsing fails
      if (!da && !db) return 0
      if (!da) return 1
      if (!db) return -1

      return da.getTime() - db.getTime()
    })

    return uniqueDates
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

    const groups = Array.from(map.values())

    groups.sort((a, b) => {
      const da = parseIndianDate(a.date)
      const db = parseIndianDate(b.date)

      if (!da && !db) return 0
      if (!da) return 1
      if (!db) return -1

      return da.getTime() - db.getTime()
    })

    return groups

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

 
  // ===== NO DATA UI =====
if (!grouped.length) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      
      {/* Topic Icon */}
      <div className="bg-blue-50 p-6 rounded-full mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-14 w-14 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 10h8M8 14h5m-9 5l3-3h11a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12l3-3z"
          />
        </svg>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-semibold mb-3">
        No Topics Found
      </h2>

      {/* Description */}
      <p className="text-gray-500 max-w-md">
        There are currently no topics available for this session.
        Please check back later for updates.
      </p>
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
              className={`px-4 py-2 rounded-lg text-white text-sm ${HALL_COLORS[i % 10]
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
            className={`text-white text-center py-3 rounded-t-lg ${HALL_COLORS[group.hallIndex % 10]
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
