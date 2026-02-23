'use client'

import { useMemo, useState } from 'react'
import useSWR, { mutate } from 'swr'
import Image from 'next/image'
import Link from 'next/link'
import { CalendarDays, Clock } from 'lucide-react'
import { toast } from 'sonner'

import { fetcher } from '@/lib/fetcher'
import { apiRequest } from '@/lib/apiRequest'
import { useAuthStore } from '@/stores/authStore'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import SkeletonLoading from '@/components/SkeletonLoading'
import CountdownTimer from '@/components/CountdownTimer'
import StatusBadge from '@/components/StatusBadge'
import Pagination from '@/components/Pagination'

/* ---------------- DATE HELPERS ---------------- */

const parseDDMMYYYY = (dateStr: string): Date => {
  if (!dateStr) return new Date(0)
  const [day, month, year] = dateStr.split('/').map(Number)
  if (!day || !month || !year) return new Date(0)
  return new Date(year, month - 1, day)
}

/* ---------------- CONSTANTS ---------------- */

const PAGE_SIZE = 20

/* ---------------- TYPES ---------------- */

type WebinarType =
  | 'USI Webinar'
  | 'Smart Learning Program'
  | 'Live Operative Workshops'

interface Webinar {
  _id: string
  name: string
  image: string
  webinarType: WebinarType
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  timeZone: string
  dynamicStatus: 'Upcoming' | 'Ongoing' | 'Completed'
}

/* ---------------- HELPERS ---------------- */

const getWebinarRoute = (type: WebinarType, id: string) => {
  switch (type) {
    case 'USI Webinar':
      return `/webinar/${id}`
    case 'Smart Learning Program':
      return `/program/${id}`
    case 'Live Operative Workshops':
      return `/workshop/${id}`
    default:
      return `/webinar/${id}`
  }
}

/* ---------------- COMPONENT ---------------- */

export default function UpcomingWebinars() {
  const user = useAuthStore((state) => state.user)

  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)

  const API_BASE = process.env.NEXT_PUBLIC_API_URL

  /* ---------------- FETCH WEBINARS ---------------- */

  const {
    data: webinarRes,
    isLoading: webinarsLoading,
  } = useSWR<{ data: Webinar[] }>(
    `${API_BASE}/api/webinars/upcoming`,
    fetcher
  )

  const webinars = webinarRes?.data ?? []

  /* ---------------- FETCH REGISTRATIONS ---------------- */

  const { data: registrationRes } = useSWR<{ data: any[] }>(
    user?.id
      ? `${API_BASE}/api/webinar/registrations/${user.id}`
      : null,
    fetcher
  )

  // ✅ SAFE FALLBACK FIX
  const registeredIds = useMemo(() => {
    if (!Array.isArray(registrationRes?.data)) return []

    return registrationRes.data
      .map((r) => r?.webinar?._id)
      .filter((id): id is string => typeof id === 'string')
  }, [registrationRes])

  /* ---------------- SEARCH + SORT ---------------- */

  const filteredWebinars = useMemo(() => {
    let list = webinars

    if (q.trim()) {
      list = list.filter((w) =>
        w.name.toLowerCase().includes(q.toLowerCase())
      )
    }

    return [...list].sort((a, b) => {
      const dateA = parseDDMMYYYY(a.startDate)
      const dateB = parseDDMMYYYY(b.startDate)
      return dateA.getTime() - dateB.getTime()
    })
  }, [webinars, q])

  /* ---------------- PAGINATION ---------------- */

  const totalPages = Math.ceil(filteredWebinars.length / PAGE_SIZE)

  const paginatedWebinars = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredWebinars.slice(start, start + PAGE_SIZE)
  }, [filteredWebinars, page])

  /* ---------------- REGISTER ---------------- */

  const [open, setOpen] = useState(false)
  const [selectedWebinar, setSelectedWebinar] =
    useState<Webinar | null>(null)
  const [identifier, setIdentifier] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const buildRegisterPayload = () => {
    if (/^\d{10}$/.test(identifier)) return { mobile: identifier }
    if (identifier.includes('@')) return { email: identifier }
    return { membershipNumber: identifier }
  }

  const handleRegister = async () => {
    if (submitting) return
    if (!selectedWebinar || !identifier || !user?.id) return

    setSubmitting(true)

    try {
      await apiRequest({
        endpoint: '/api/webinar/register',
        method: 'POST',
        body: {
          webinarId: selectedWebinar._id,
          userId: user.id,
          ...buildRegisterPayload(),
        },
      })

      toast.success('You have successfully registered 🎉')

      mutate(`${API_BASE}/api/webinar/registrations/${user.id}`)

      setOpen(false)
      setIdentifier('')
    } catch (err: any) {
      toast.error(err.message || 'Registration failed')
      setSubmitting(false)
    }
  }

  /* ---------------- UI STATES ---------------- */

  if (webinarsLoading) {
    return <SkeletonLoading />
  }

  /* ---------------- EMPTY STATE ---------------- */

  if (!filteredWebinars.length) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-[#252641] mb-6">
          Upcoming Programs
        </h1>

        <div className="mb-6">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search program..."
            className="w-full sm:w-80 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#1F5C9E]"
          />
        </div>

        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="relative w-64 h-48 mb-6">
            <Image
              src="/no.png"
              alt="No programs"
              fill
              className="object-contain"
            />
          </div>

          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <CalendarDays size={18} />
            <span className="text-sm font-medium">
              {q
                ? 'No matching programs found'
                : 'No upcoming programs'}
            </span>
          </div>

          <p className="text-gray-400 text-sm max-w-md">
            {q
              ? 'Try adjusting your search keyword or clear the filter.'
              : 'We’re preparing exciting new programs for you. Please check back soon.'}
          </p>

          {q && (
            <Button
              onClick={() => setQ('')}
              className="mt-6 bg-blue-600 hover:bg-blue-700"
            >
              Clear Search
            </Button>
          )}
        </div>
      </div>
    )
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-[#252641] mb-6">
        Upcoming Programs
      </h1>

      <div className="mb-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search program..."
          className="w-full sm:w-80 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#1F5C9E]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {paginatedWebinars.map((w) => {
          const isRegistered = registeredIds.includes(w._id)

          return (
            <Card
              key={w._id}
              className="p-0 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition hover:-translate-y-1 flex flex-col"
            >
              <div className="relative h-[250px]">
                <Image
                  src={w.image}
                  alt={w.name}
                  fill
                  className="object-fit"
                />
              </div>

              <CardContent className="flex flex-col flex-grow">
                <StatusBadge status={w.dynamicStatus} />
                <h3 className="font-semibold text-sm line-clamp-2">
                  {w.name}
                </h3>

                {w.dynamicStatus === 'Upcoming' && (
                  <CountdownTimer
                    startDate={w.startDate}
                    startTime={w.startTime}
                  />
                )}

                <div className="mt-3 text-xs text-gray-600 space-y-2">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={14} />
                    {w.startDate} – {w.endDate}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    {w.startTime} – {w.endTime}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0">
                {isRegistered ? (
                  <Link
                    href={getWebinarRoute(w.webinarType, w._id)}
                    className="w-full"
                  >
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      View Details
                    </Button>
                  </Link>
                ) : (
                  <Button
                    disabled={!user || submitting}
                    onClick={() => {
                      setSelectedWebinar(w)
                      setOpen(true)
                    }}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Register Free
                  </Button>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>

       {/* PAGINATION COMPONENT */}
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
            />
      
            {/* REGISTER DIALOG */}
            <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
              { (
                <div className="space-y-4">
                  <h2 className="text-center text-lg font-semibold text-blue-600">
                    Register for FREE
                  </h2>
      
                  <input
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    disabled={submitting}
                    placeholder="USI No | Email | Mobile"
                    className="w-full border rounded px-4 py-2"
                  />
      
                  <Button
                    onClick={handleRegister}
                    disabled={submitting}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {submitting ? 'Submitting...' : 'Submit'}
                  </Button>
      
                  <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
                </div>
              )}
            </AlertDialogContent>
          </AlertDialog>
    </div>
  )
}
