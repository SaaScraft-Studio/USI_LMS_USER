'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CalendarDays, Clock } from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { useAuthStore } from '@/stores/authStore'
import { apiRequest } from '@/lib/apiRequest'
import { toast } from 'sonner'
import SkeletonLoading from '@/components/SkeletonLoading'

/* ---------------- CONSTANTS ---------------- */

const ITEMS_PER_PAGE = 9

/* ---------------- TYPES ---------------- */

type SortOrder = 'newest' | 'oldest'

interface Course {
  _id: string
  courseName: string
  image: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  registrationType: 'free' | 'paid'
  amount: number
  createdAt: string
}

/* ---------------- COMPONENT ---------------- */

export default function CourseList() {
  const user = useAuthStore((state) => state.user)

  const [q, setQ] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [page, setPage] = useState(1)

  const [courses, setCourses] = useState<Course[]>([])
  const [isFetching, setIsFetching] = useState(true)

  /* dialog */
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [identifier, setIdentifier] = useState('')
  const [submitting, setSubmitting] = useState(false)

  /* registered */
  const [registeredIds, setRegisteredIds] = useState<string[]>([])


  /* ---------------- FETCH REGISTRATIONS ---------------- */

  useEffect(() => {
    if (!user?.id) return

    const fetchRegistrations = async () => {
      try {
        const res = await apiRequest<null, any>({
          endpoint: `/api/course/registrations/${user.id}`,
          method: 'GET',
        })
        setRegisteredIds(res.data.map((r: any) => r.course._id))
      } catch {
        /* silent */
      }
    }

    fetchRegistrations()
  }, [user?.id])

  /* ---------------- FETCH COURSES ---------------- */

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsFetching(true)
        const res = await apiRequest<null, any>({
          endpoint: '/api/courses/active',
          method: 'GET',
        })
        setCourses(res.data || [])
      } catch {
        setCourses([])
      } finally {
        setIsFetching(false)
      }
    }

    fetchCourses()
  }, [])

  

  /* ---------------- FILTER (NO SORT HERE) ---------------- */

  const filtered = useMemo(() => {
    if (!q.trim()) return courses

    return courses.filter((c) =>
      c.courseName.toLowerCase().includes(q.trim().toLowerCase())
    )
  }, [courses, q])

  /* ---------------- RESET PAGE ONLY ON SEARCH ---------------- */

  useEffect(() => {
    setPage(1)
  }, [q])

  /* ---------------- PAGINATION FIRST ---------------- */

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)

  const pageSlice = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, page])

  /* ---------------- SORT ONLY CURRENT PAGE ---------------- */

  const paginatedCourses = useMemo(() => {
    return [...pageSlice].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()

      return sortOrder === 'newest'
        ? dateB - dateA
        : dateA - dateB
    })
  }, [pageSlice, sortOrder])

  /* ---------------- REGISTER ---------------- */

  const buildRegisterPayload = () => {
    if (/^\d{10}$/.test(identifier)) return { mobile: identifier }
    if (identifier.includes('@')) return { email: identifier }
    return { membershipNumber: identifier }
  }

  const handleRegister = async () => {
    if (!selectedCourse || !identifier || !user?.id) return

    try {
      setSubmitting(true)

      await apiRequest({
        endpoint: '/api/course/register',
        method: 'POST',
        body: {
          courseId: selectedCourse._id,
          userId: user.id,
          ...buildRegisterPayload(),
        },
      })

      toast.success('Successfully registered 🎉')
      setRegisteredIds((prev) => [...prev, selectedCourse._id])
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
      <h1 className="text-2xl font-semibold text-[#252641] mb-6">E-Learning</h1>

      {/* SEARCH + SORT */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search courses..."
          className="w-full sm:w-80 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#1F5C9E]"
        />

        <Select
          value={sortOrder}
          onValueChange={(v) => setSortOrder(v as SortOrder)}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {paginatedCourses.map((c) => (
          <Card
            key={c._id}
            className="p-0 group rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition hover:-translate-y-1 flex flex-col"
          >
            <div className="relative h-[250px] w-full overflow-hidden">
              <Image
                src={c.image || '/avatar.png'}
                alt={c.courseName}
                fill
                className="object-fit transition-transform duration-500 group-hover:scale-110"
              />
            </div>

            <CardContent className="p-3 flex-grow">
              <h3 className="font-semibold text-sm line-clamp-2">
                {c.courseName}
              </h3>

              <div className="mt-3 text-xs text-gray-600 space-y-2">
                <div className="flex items-center gap-2">
                  <CalendarDays size={14} />
                  {c.startDate} – {c.endDate}
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  {c.startTime} – {c.endTime}
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
              {registeredIds.includes(c._id) ? (
                <Link href={`/elearnings/${c._id}/overview`} className="w-full">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    View Details
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={() => {
                    setSelectedCourse(c)
                    setDialogOpen(true)
                  }}
                  className={`w-full ${
                    c.registrationType === 'free'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-orange-500 hover:bg-orange-600'
                  }`}
                >
                  {c.registrationType === 'free'
                    ? 'Register Free'
                    : `₹${c.amount} | Register`}
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
          {selectedCourse?.registrationType === 'paid' ? (
            <div className="space-y-4 text-center">
              <h2 className="text-lg font-semibold">
                Payment integration coming soon
              </h2>
              <AlertDialogCancel disabled={submitting}>Close</AlertDialogCancel>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-center text-lg font-semibold text-blue-600">
                Register for FREE
              </h2>

              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={submitting}
                placeholder="USI Number | Email | Mobile"
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
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
