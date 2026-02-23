'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search, Users } from 'lucide-react'
import Image from 'next/image'
import SpeakerCard from '@/components/SpeakerCard'
import SpeakerSkeleton from '@/components/SpeakerSkeleton'
import { apiRequest } from '@/lib/apiRequest'
import Pagination from '@/components/Pagination'

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
  const [error, setError] = useState<string | null>(null)

  /* ================= FETCH (SAFE FALLBACK) ================= */

  useEffect(() => {
    const fetchSpeakers = async () => {
      try {
        setIsFetching(true)
        setError(null)

        const res = await apiRequest<null, any>({
          endpoint: '/api/speakers/global-stats',
          method: 'GET',
        })

        // 🛡 SAFE: handle null / undefined / wrong shape
        const rawList = Array.isArray(res?.data) ? res.data : []

        const mapped: Speaker[] = rawList
          .map((item: any) => {
            const s = item?.speaker

            // 🛡 Skip broken speaker records
            if (!s?._id) return null

            return {
              id: s._id,
              name: [s.prefix, s.speakerName]
                .filter(Boolean)
                .join(' ')
                .trim() || 'Unnamed Speaker',
              photo: s.speakerProfilePicture || '/avatar.png',
              institute: s.affiliation || '—',
              location: [s?.state, s?.country]
                .filter(Boolean)
                .join(', ') || '—',
              topicVideos: item?.topicVideos ?? 0,
              webinarVideos: item?.webinarVideos ?? 0,
              totalVideos: item?.totalVideos ?? 0,
            }
          })
          .filter(Boolean) as Speaker[] // remove nulls safely

        setSpeakers(mapped)
      } catch (err: any) {
        console.error('Speakers fetch error:', err)
        setError(err?.message || 'Failed to load speakers')
        setSpeakers([]) // 🛡 fallback to empty
      } finally {
        setIsFetching(false)
      }
    }

    fetchSpeakers()
  }, [])

  /* ================= SEARCH ================= */

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return speakers

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

  /* ================= ERROR FALLBACK UI ================= */

  if (error && speakers.length === 0) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="relative w-64 h-48 mb-6">
            <Image
              src="/no.png"
              alt="Error"
              fill
              className="object-contain"
            />
          </div>

          <h2 className="text-lg font-semibold text-red-600">
            Failed to load speakers
          </h2>

          <p className="text-gray-500 text-sm mt-2 max-w-md">
            Something went wrong while fetching speaker data.
            Please try refreshing the page.
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-5 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  /* ================= UI ================= */

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-[#252641]">
        Speakers
      </h1>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search speakers"
          className="pl-9 w-full border rounded-lg py-2 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* EMPTY STATE (Premium like your other pages) */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="relative w-64 h-48 mb-6">
            <Image
              src="/no.png"
              alt="No speakers"
              fill
              className="object-contain"
            />
          </div>

          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Users size={18} />
            <span className="text-sm font-medium">
              No speakers found
            </span>
          </div>

          <p className="text-gray-400 text-sm max-w-md">
            We couldn’t find any speakers matching your search.
            Try adjusting your keywords or check back later.
          </p>
        </div>
      ) : (
        <>
          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {paginatedSpeakers.map((speaker) => (
              <SpeakerCard
                key={speaker.id}
                speaker={speaker}
              />
            ))}
          </div>

          {/* Pagination */}
         <Pagination
  page={page}
  totalPages={totalPages}
  onChange={setPage}
/>
        </>
      )}
    </div>
  )
}
