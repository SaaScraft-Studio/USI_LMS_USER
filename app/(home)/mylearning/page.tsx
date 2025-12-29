'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import {
  Search,
  CalendarDays,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { apiRequest } from '@/lib/apiRequest'
import SkeletonLoading from '@/components/SkeletonLoading'

/* ================= TYPES ================= */

interface Course {
  _id: string
  courseName: string
  courseImage: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
}

type Registration = {
  id: string
  course: Course
  registeredOn: string
}

const PAGE_SIZE = 9

/* ================= PAGE ================= */

export default function MyLearningPage() {
  const [search, setSearch] = useState('')
  const [courses, setCourses] = useState<Registration[]>([])
  const [page, setPage] = useState(1)
  const [isFetching, setIsFetching] = useState(true)

  const router = useRouter()
  const user = useAuthStore((state) => state.user)

  /* ================= FETCH ================= */

  useEffect(() => {
    if (!user?.id) {
      setIsFetching(false)
      return
    }

    const fetchMyLearning = async () => {
      try {
        setIsFetching(true)

        const res = await apiRequest<null, any>({
          endpoint: `/api/course/registrations/${user.id}`,
          method: 'GET',
        })

        setCourses(res.data || [])
      } catch (error) {
        console.error('Failed to fetch registered courses', error)
        setCourses([])
      } finally {
        setIsFetching(false)
      }
    }

    fetchMyLearning()
  }, [user?.id])

  /* ================= SEARCH ================= */

  const filteredCourses = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return courses
    return courses.filter((item) =>
      item.course.courseName.toLowerCase().includes(q)
    )
  }, [search, courses])

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(filteredCourses.length / PAGE_SIZE)

  const paginatedCourses = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredCourses.slice(start, start + PAGE_SIZE)
  }, [filteredCourses, page])

  useEffect(() => {
    setPage(1)
  }, [search])

  /* ================= SKELETON ================= */

  if (isFetching) {
    return <SkeletonLoading />
  }

  /* ================= UI ================= */

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6 text-[#0d2540]">My Courses</h1>

      {/* Search */}
      <div className="relative mb-8 w-full max-w-sm">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title"
          className="
            pl-10 pr-5 py-2 w-full
            border rounded-lg
            focus:outline-none
            focus:ring-2 focus:ring-blue-500
          "
        />
      </div>

      {/* Cards */}
      {paginatedCourses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {paginatedCourses.map(({ id, course }) => (
            <Card
              key={id}
              className="
              p-0  
              group
                rounded-2xl
                overflow-hidden
                bg-white
                shadow-md
                hover:shadow-xl
                transition-all duration-300
                hover:-translate-y-1
                flex flex-col
              "
            >
              {/* Image */}
              <div className="relative h-44 w-full overflow-hidden">
                <Image
                  src={course.courseImage}
                  alt={course.courseName}
                  fill
                  className="
                    object-fit
                    transition-transform duration-500
                    group-hover:scale-110
                  "
                />
                <div
                  className="
                  absolute inset-0
                  bg-black/40
                  opacity-0
                  group-hover:opacity-100
                  transition-opacity
                  flex items-center justify-center
                "
                ></div>
              </div>

              <CardContent className="p-4 flex flex-col flex-grow">
                <div className="text-xs text-gray-600 space-y-2">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={14} />
                    {course.startDate} – {course.endDate}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    {course.startTime} – {course.endTime}
                  </div>
                </div>

                <h3 className="mt-3 font-semibold text-sm line-clamp-2">
                  {course.courseName}
                </h3>
              </CardContent>

              <CardFooter className="p-4 pt-0">
                <Button
                  onClick={() => router.push(`/elearnings/${course._id}/overview`)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Go to Course
                </Button>
              </CardFooter>
            </Card>
          ))}
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

      {filteredCourses.length === 0 && (
        <p className="text-center text-gray-500 mt-10">
          No registered courses found.
        </p>
      )}
    </div>
  )
}
