'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CalendarDays } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { useAuthStore } from '@/stores/authStore'
import { apiRequest } from '@/lib/apiRequest'
import { toast } from 'sonner'
import SkeletonLoading from '@/components/SkeletonLoading'
import CountdownTimer from '@/components/CountdownTimer'

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

  const [webinars, setWebinars] = useState<Webinar[]>([])
  const [isFetching, setIsFetching] = useState(true)

  /* dialog */
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedWebinar, setSelectedWebinar] = useState<Webinar | null>(null)
  const [identifier, setIdentifier] = useState('')
  const [submitting, setSubmitting] = useState(false)

  /* registered webinar ids */
  const [registeredIds, setRegisteredIds] = useState<string[]>([])

   /* ---------------- FETCH REGISTRATIONS ---------------- */

  const fetchRegistrations = async () => {
    if (!user?.id) return

    try {
      const res = await apiRequest<null, any>({
        endpoint: `/webinar/registrations/${user.id}`,
        method: 'GET',
      })

      // backend returns { webinar: {...} }
      setRegisteredIds(res.data.map((r: any) => r.webinar._id))
    } catch {
      setRegisteredIds([])
    }
  }

  useEffect(() => {
    fetchRegistrations()
  }, [user?.id])


  /* ---------------- FETCH WEBINARS ---------------- */

  useEffect(() => {
    const fetchWebinars = async () => {
      try {
        setIsFetching(true)
        const res = await apiRequest<null, any>({
          endpoint: '/webinars/upcoming',
          method: 'GET',
        })
        setWebinars(res.data || [])
      } catch {
        setWebinars([])
      } finally {
        setIsFetching(false)
      }
    }

    fetchWebinars()
  }, [])

 
  /* ---------------- SEARCH ---------------- */

  const filteredWebinars = useMemo(() => {
    if (!q.trim()) return webinars
    return webinars.filter((w) =>
      w.name.toLowerCase().includes(q.toLowerCase())
    )
  }, [webinars, q])

  useEffect(() => {
    setPage(1)
  }, [q])

  /* ---------------- PAGINATION ---------------- */

  const totalPages = Math.ceil(filteredWebinars.length / PAGE_SIZE)

  const paginatedWebinars = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredWebinars.slice(start, start + PAGE_SIZE)
  }, [filteredWebinars, page])

  /* ---------------- REGISTER ---------------- */

  const buildRegisterPayload = () => {
    if (/^\d{10}$/.test(identifier)) return { mobile: identifier }
    if (identifier.includes('@')) return { email: identifier }
    return { membershipNumber: identifier }
  }

  const handleRegister = async () => {
    if (!selectedWebinar || !identifier || !user?.id) return

    try {
      setSubmitting(true)

      await apiRequest({
        endpoint: '/webinar/register',
        method: 'POST',
        body: {
          webinarId: selectedWebinar._id,
          userId: user.id,
          ...buildRegisterPayload(),
        },
      })

      toast.success('You have successfully registered 🎉')

      // 🔥 re-fetch registrations immediately
      await fetchRegistrations()

      setDialogOpen(false)
      setIdentifier('')
    } catch (err: any) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  /* ---------------- LOADING ---------------- */

  if (isFetching) {
    return <SkeletonLoading />
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-[#252641] mb-6">
        Upcoming Programs
      </h1>

      {/* SEARCH */}
      <div className="mb-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search program..."
          className="w-full sm:w-80 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#1F5C9E]"
        />
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  className="object-cover"
                />
              </div>

              <CardContent className="flex flex-col gap-3 flex-grow">
                <span className="text-xs font-medium px-2 py-1 rounded bg-blue-100 text-blue-700 w-fit">
                  {w.webinarType}
                </span>

                <h3 className="font-semibold text-sm line-clamp-2">
                  {w.name}
                </h3>

                <div className="text-xs text-gray-600 flex items-center gap-2">
                  <CalendarDays size={14} />
                  {w.startDate} – {w.endDate}
                </div>

                {w.dynamicStatus === 'Upcoming' && (
                  <CountdownTimer
                    startDate={w.startDate}
                    startTime={w.startTime}
                  />
                )}
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
                      setDialogOpen(true)
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

      {/* REGISTER DIALOG */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
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

            <AlertDialogCancel disabled={submitting}>
              Cancel
            </AlertDialogCancel>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
