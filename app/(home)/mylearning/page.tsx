'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Search,
  CalendarDays,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { useAuthStore } from '@/stores/authStore'
import { apiRequest } from '@/lib/apiRequest'
import SkeletonLoading from '@/components/SkeletonLoading'

/* ================= TYPES ================= */

type RegistrationItem = {
  registrationId: string
  type: 'course' | 'webinar'
  details: any
  registeredOn: string
}

const PAGE_SIZE = 20

/* ================= PAGE ================= */

export default function MyLearningPage() {
  const [search, setSearch] = useState('')
  const [items, setItems] = useState<RegistrationItem[]>([])
  const [page, setPage] = useState(1)
  const [isFetching, setIsFetching] = useState(true)

  const user = useAuthStore((state) => state.user)
const hydrateUser = useAuthStore((state) => state.hydrateUser)
const isHydrated = useAuthStore((state) => state.isHydrated)

useEffect(() => {
  if (!isHydrated) {
    hydrateUser()
  }
}, [isHydrated, hydrateUser])


  /* ================= FETCH ================= */
useEffect(() => {
  if (!isHydrated) return

  if (!user?.id) {
    setIsFetching(false)
    return
  }

  const fetchMyLearning = async () => {
    try {
      setIsFetching(true)

      const res = await apiRequest({
        endpoint: '/api/users/registrations',
        method: 'GET',
      })

      console.log('REGISTRATIONS RESPONSE', res)

      const registrations =
        res?.data?.registrations ||
        res?.registrations ||
        res?.data ||
        []

      setItems(registrations)
    } catch (error) {
      console.error('Failed to fetch registrations', error)
      setItems([])
    } finally {
      setIsFetching(false)
    }
  }

  fetchMyLearning()
}, [isHydrated, user?.id])



  /* ================= SEARCH ================= */

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items

    return items.filter((item) =>
      (item.type === 'course'
        ? item.details.courseName
        : item.details.name
      )
        ?.toLowerCase()
        .includes(q)
    )
  }, [search, items])

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(filteredItems.length / PAGE_SIZE)

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredItems.slice(start, start + PAGE_SIZE)
  }, [filteredItems, page])

  useEffect(() => {
    setPage(1)
  }, [search])

  /* ================= HELPERS ================= */

  const getActionConfig = (item: RegistrationItem) => {
    const id = item.details._id

    if (item.type === 'course') {
      return {
        label: 'Go To Course',
        href: `/elearnings/${id}/overview`,
      }
    }

    if (item.type === 'webinar') {
      switch (item.details.webinarType) {
        case 'Live Operative Workshops':
          return { label: 'Go To Workshop', href: `/workshop/${id}` }
        case 'Smart Learning Program':
          return { label: 'Go To Program', href: `/program/${id}` }
        case 'USI Webinar':
          return { label: 'Go To Webinar', href: `/webinar/${id}` }
        default:
          return null
      }
    }

    return null
  }

  /* ================= SKELETON ================= */

  if (isFetching) {
    return <SkeletonLoading />
  }

  /* ================= UI ================= */

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6 text-[#0d2540]">
        My Learning
      </h1>

      {/* Search */}
      <div className="relative mb-8 w-full max-w-sm">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title"
          className="pl-10 pr-5 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Cards */}
      {paginatedItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {paginatedItems.map((item) => {
            const { details } = item
            const action = getActionConfig(item)

            return (
              <Card
                key={item.registrationId}
                className="p-0 group rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition hover:-translate-y-1 flex flex-col"
              >
                {/* Image */}
                <div className="relative h-[250px] w-full overflow-hidden">
                  <Image
                    src={details.image || '/avatar.png'}

                    alt={details.courseName || details.name}
                    fill
                    className="object-fit transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                <CardContent className="flex-grow">
                  <div className="text-xs text-gray-600 space-y-2">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={14} />
                      {details.startDate} – {details.endDate}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      {details.startTime} – {details.endTime}
                    </div>
                  </div>

                  <h3 className="mt-3 font-semibold text-sm line-clamp-2">
                    {details.courseName || details.name}
                  </h3>
                </CardContent>

                {action && (
                  <CardFooter className="p-4 pt-0">
                    <Link href={action.href} className="w-full">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        {action.label}
                      </Button>
                    </Link>
                  </CardFooter>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-10">
          <Button
            variant="outline"
            size="icon"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
          >
            <ChevronLeft size={18} />
          </Button>

          <span className="text-sm font-medium">
            Page {page} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="icon"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          >
            <ChevronRight size={18} />
          </Button>
        </div>
      )}

      {filteredItems.length === 0 && (
        <p className="text-center text-gray-500 mt-10">
          No registrations found.
        </p>
      )}
    </div>
  )
}
