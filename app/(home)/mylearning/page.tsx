'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Search,
  CalendarDays,
  Clock,
  BookOpen,
  MapPin,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import SkeletonLoading from '@/components/SkeletonLoading'

import { useAuthStore } from '@/stores/authStore'
import { fetcher } from '@/lib/fetcher'
import useSWR from 'swr'
import Pagination from '@/components/Pagination'

/* ================= TYPES ================= */

type RegistrationItem = {
  registrationId: string
  type: 'course' | 'webinar' | 'conference'
  details: any
  registeredOn: string
}

type RegistrationsResponse = {
  success: boolean
  total: number
  coursesCount: number
  webinarsCount: number
  conferencesCount: number
  data: RegistrationItem[]
}

const PAGE_SIZE = 20

/* ================= PAGE ================= */

export default function MyLearningPage() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL!

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { user, isLoading } = useAuthStore()

  /* ================= FETCH ================= */

  const { data, isLoading: isFetching } = useSWR<RegistrationsResponse>(
    !isLoading && user?.id
      ? `${API_BASE}/api/users/registrations`
      : null,
    fetcher
  )

  const rawItems: RegistrationItem[] = Array.isArray(data?.data)
    ? data!.data
    : []

  /* ================= REMOVE BROKEN RECORDS ================= */

  const items = useMemo(() => {
    return rawItems.filter((item) => item?.details?._id)
  }, [rawItems])

  /* ================= SEARCH ================= */

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items

    return items.filter((item) => {
      const title =
        item.type === 'course'
          ? item.details?.courseName
          : item.details?.name

      return title?.toLowerCase().includes(q)
    })
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

  /* ================= ACTION CONFIG ================= */

  const getActionConfig = (item: RegistrationItem) => {
    const id = item?.details?._id
    if (!id) return null

    if (item.type === 'course') {
      return {
        label: 'Go To Course',
        href: `/elearnings/${id}/overview`,
      }
    }

    if (item.type === 'webinar') {
      switch (item.details?.webinarType) {
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

    if (item.type === 'conference') {
      return {
        label: 'Go To Conference',
        href: `/conference/${id}`,
      }
    }

    return null
  }

  /* ================= SKELETON ================= */

  if (isFetching) {
    return <SkeletonLoading />
  }

  /* ================= EMPTY STATE ================= */

  if (filteredItems.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6 text-[#0d2540]">
          My Learning
        </h1>

        <div className="relative mb-8 w-full max-w-sm">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title"
            className="pl-10 pr-5 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="relative w-64 h-48 mb-6">
            <Image
              src="/no.png"
              alt="No learning content"
              fill
              className="object-contain"
            />
          </div>

          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <BookOpen size={18} />
            <span className="text-sm font-medium">
              {search
                ? 'No matching results found'
                : 'No learning content yet'}
            </span>
          </div>

          <p className="text-gray-400 text-sm max-w-md">
            {search
              ? 'Try adjusting your search keyword or clear the filter.'
              : 'You haven’t registered for any courses, webinars, or conferences yet.'}
          </p>

          {search && (
            <Button
              onClick={() => setSearch('')}
              className="mt-6 bg-blue-600 hover:bg-blue-700"
            >
              Clear Search
            </Button>
          )}
        </div>
      </div>
    )
  }

  /* ================= UI ================= */

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6 text-[#0d2540]">
        My Learning
      </h1>

      <div className="relative mb-8 w-full max-w-sm">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title"
          className="pl-10 pr-5 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {paginatedItems.map((item) => {
          const { details } = item
          const action = getActionConfig(item)

          return (
            <Card
              key={item.registrationId}
              className="p-0 group rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition hover:-translate-y-1 flex flex-col"
            >
              <div className="relative h-[250px] w-full overflow-hidden">
                <Image
                  src={details?.image || '/avatar.png'}
                  alt={details?.courseName || details?.name || 'Learning'}
                  fill
                  className="object-fit transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              <CardContent className="flex-grow">
                <div className="text-xs text-gray-600 space-y-2">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={14} />
                    {details?.startDate} – {details?.endDate}
                  </div>

                  {/* Show time only if exists */}
                  {details?.startTime && (
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      {details?.startTime} – {details?.endTime}
                    </div>
                  )}

                  {/* Show venue for conference */}
                  {item.type === 'conference' && details?.venueName && (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} />
                      {details?.venueName}
                    </div>
                  )}
                </div>

                <h3 className="mt-3 font-semibold text-sm line-clamp-2">
                  {details?.courseName || details?.name}
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

      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={setPage}
      />
    </div>
  )
}