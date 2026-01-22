'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import SpeakerCard from '@/components/SpeakerCard'
import SpeakerSkeleton from '@/components/SpeakerSkeleton'
import { apiRequest } from '@/lib/apiRequest'
import getPaginationPages from '@/utils/getPaginationPages'

type Speaker = {
  id: string
  name: string
  photo: string
  institute: string
  location: string
  topicVideos: number
  webinarVideos: number
  totalVideos: number
}


const PAGE_SIZE = 20

export default function SpeakersPage() {
  const [search, setSearch] = useState('')
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [page, setPage] = useState(1)
  const [isFetching, setIsFetching] = useState(true)

  /* ================= FETCH ================= */

  useEffect(() => {
    const fetchSpeakers = async () => {
      try {
        setIsFetching(true)

        const res = await apiRequest<null, any>({
          endpoint: '/api/speakers/global-stats',
          method: 'GET',
        })

        const mapped: Speaker[] = res.data.map((item: any) => {
  const s = item.speaker

  return {
    id: s._id,
    name: `${s.prefix} ${s.speakerName}`,
    photo: s.speakerProfilePicture || '/avatar.png',
    institute: s.affiliation || '—',
    location: [s.state, s.country].filter(Boolean).join(', '),
    topicVideos: item.topicVideos ?? 0,
    webinarVideos: item.webinarVideos ?? 0,
    totalVideos: item.totalVideos ?? 0,
  }
})


        setSpeakers(mapped)
      } finally {
        setIsFetching(false)
      }
    }

    fetchSpeakers()
  }, [])

  /* ================= SEARCH ================= */

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return speakers.filter((s) =>
      s.name.toLowerCase().includes(q)
    )
  }, [search, speakers])

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  const paginatedSpeakers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, page])

  useEffect(() => {
    setPage(1)
  }, [search])

  /* ================= SKELETON ================= */

  if (isFetching) {
    return <SpeakerSkeleton />
  }

  /* ================= UI ================= */

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Speakers</h1>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search speakers"
          className="pl-9 w-full border rounded-md py-2 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {paginatedSpeakers.map((speaker) => (
          <SpeakerCard key={speaker.id} speaker={speaker} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-6">
          {getPaginationPages(page, totalPages).map((p, i) =>
            p === 'dots' ? (
              <span key={i} className="px-3 py-1 text-gray-500">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 rounded-md text-sm ${
                  p === page
                    ? 'bg-orange-600 text-white'
                    : 'border hover:bg-gray-100'
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-center text-gray-500 mt-10">
          No speakers found.
        </p>
      )}
    </div>
  )
}
