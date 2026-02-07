'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CalendarDays, Hotel } from 'lucide-react'
import { Monitor, MapPin } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'
import { apiRequest } from '@/lib/apiRequest'
import { toast } from 'sonner'
import SkeletonLoading from '@/components/SkeletonLoading'

/* ---------------- CONSTANTS ---------------- */

const PAGE_SIZE = 20

type ConferenceTypeFilter = 'Virtual' | 'Physical' | 'All'

/* ---------------- TYPES ---------------- */

interface Conference {
  _id: string
  name: string
  venueName: string
  image: string
  description: string
  conferenceType: 'Virtual' | 'Physical'
  startDate: string
  endDate: string
  timeZone: string
  registrationType: 'free' | 'paid'
  amount: number
}

/* ---------------- COMPONENT ---------------- */

export default function ConferenceList() {
  const user = useAuthStore((state) => state.user)

  const [q, setQ] = useState('')
  const [typeFilter, setTypeFilter] = useState<ConferenceTypeFilter>('All')
  const [page, setPage] = useState(1)

  const [conferences, setConferences] = useState<Conference[]>([])
  const [isFetching, setIsFetching] = useState(true)

  /* dialog */
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedConference, setSelectedConference] =
    useState<Conference | null>(null)
  const [identifier, setIdentifier] = useState('')
  const [submitting, setSubmitting] = useState(false)

  /* registered */
  const [registeredIds, setRegisteredIds] = useState<string[]>([])

  /* ---------------- FETCH CONFERENCES ---------------- */

  useEffect(() => {
    const fetchConferences = async () => {
      try {
        setIsFetching(true)
        const res = await apiRequest<null, any>({
          endpoint: '/api/conferences/active',
          method: 'GET',
        })
        setConferences(res.data || [])
      } catch {
        setConferences([])
      } finally {
        setIsFetching(false)
      }
    }

    fetchConferences()
  }, [])

  /* ---------------- FETCH REGISTRATIONS ---------------- */

  useEffect(() => {
    if (!user?.id) return

    const fetchRegistrations = async () => {
      try {
        const res = await apiRequest<null, any>({
          endpoint: `/api/conference/registrations/${user.id}`,
          method: 'GET',
        })
        setRegisteredIds(res.data.map((r: any) => r.conference._id))
      } catch {
        /* silent */
      }
    }

    fetchRegistrations()
  }, [user?.id])

  /* ---------------- FILTER ---------------- */

  const filtered = useMemo(() => {
    let list = conferences

    if (typeFilter !== 'All') {
      list = list.filter((c) => c.conferenceType === typeFilter)
    }

    if (!q.trim()) return list

    return list.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()))
  }, [conferences, q, typeFilter])

  /* ---------------- RESET PAGE ---------------- */

  useEffect(() => {
    setPage(1)
  }, [q, typeFilter])

  /* ---------------- PAGINATION ---------------- */

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  const paginatedConferences = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, page])

  /* ---------------- REGISTER ---------------- */

  const buildRegisterPayload = () => {
    if (/^\d{10}$/.test(identifier)) return { mobile: identifier }
    if (identifier.includes('@')) return { email: identifier }
    return { membershipNumber: identifier }
  }

  const handleRegister = async () => {
    if (!selectedConference || !identifier || !user?.id) return

    try {
      setSubmitting(true)

      await apiRequest({
        endpoint: '/conference/register',
        method: 'POST',
        body: {
          conferenceId: selectedConference._id,
          userId: user.id,
          ...buildRegisterPayload(),
        },
      })

      toast.success('You have successfully registered 🎉')
      setRegisteredIds((prev) => [...prev, selectedConference._id])
      setDialogOpen(false)
      setIdentifier('')
    } catch (err: any) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  /* ---------------- SKELETON ---------------- */

  if (isFetching) {
    return <SkeletonLoading />
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-[#252641] mb-6">
        USI Conferences
      </h1>

      {/* SEARCH + TYPE FILTER */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search conferences..."
          className="w-full sm:w-80 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#1F5C9E]"
        />

        <Select
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v as ConferenceTypeFilter)}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Conference Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Virtual">Virtual</SelectItem>
            <SelectItem value="Physical">Physical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {paginatedConferences.map((c) => (
          <Card
            key={c._id}
            className="p-0 group rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition hover:-translate-y-1 flex flex-col"
          >
            <div className="relative h-[250px]">
              <Image
                src={c.image}
                alt={c.name}
                fill
                className="object-fit group-hover:scale-110 transition"
              />
            </div>

            <CardContent className="flex flex-col flex-grow gap-2">
              <div
                className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium w-fit ${
                  c.conferenceType === 'Virtual'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {c.conferenceType === 'Virtual' ? (
                  <Monitor size={14} />
                ) : (
                  <MapPin size={14} />
                )}
                {c.conferenceType}
              </div>

              <h3 className="font-semibold text-sm line-clamp-2">{c.name}</h3>
              <div className="text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Hotel size={14} />
                  {c.venueName || 'N/A'}
                </div>
              </div>

              <div className="text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <CalendarDays size={14} />
                  {c.startDate} – {c.endDate}
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
              {registeredIds.includes(c._id) ? (
                <Link href={`/conference/${c._id}`} className="w-full">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    View Details
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={() => {
                    setSelectedConference(c)
                    setDialogOpen(true)
                  }}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Register Free
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          <Button
            size="sm"
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </Button>

          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1
            return (
              <Button
                key={p}
                size="sm"
                variant={page === p ? 'default' : 'outline'}
                className={page === p ? 'bg-blue-600 text-white' : ''}
                onClick={() => setPage(p)}
              >
                {p}
              </Button>
            )
          })}

          <Button
            size="sm"
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

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

            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
