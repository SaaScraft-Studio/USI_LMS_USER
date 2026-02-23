'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Briefcase,
  Building2,
  MapPin,
  Award,
  Users,
  GraduationCap,
  Mic,
  UserCheck,
} from 'lucide-react'

import { apiRequest } from '@/lib/apiRequest'
import { Skeleton } from '@/components/ui/skeleton'

/* ================= FACULTY TYPES ================= */

export const facultyType = [
  { value: 'Convenor', label: 'Convenor', icon: Award },
  { value: 'Co-Convenor', label: 'Co-Convenor', icon: Users },
  { value: 'Faculty', label: 'Faculty', icon: GraduationCap },
  { value: 'Moderator', label: 'Moderator', icon: Mic },
  { value: 'Panelist', label: 'Panelist', icon: UserCheck },
] as const

type FacultyTypeValue = typeof facultyType[number]['value']

/* ================= TYPES ================= */

type FacultyItem = {
  id: string
  facultyType: FacultyTypeValue
  name: string
  title?: string
  institution?: string
  location?: string
  photo?: string
}

export default function Faculty({ webinarId }: { webinarId: string }) {
  const [faculty, setFaculty] = useState<FacultyItem[]>([])
  const [loading, setLoading] = useState(true)

  /* ================= FETCH ================= */

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await apiRequest<any, any>({
          endpoint: `/api/assign-speakers/${webinarId}`,
          method: 'GET',
        })

        const rawData = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : []

        const mapped: FacultyItem[] = rawData.map((item: any) => {
          const s = item.speakerId

          return {
            id: s._id,
            facultyType: item.facultyType,
            name: `${s.prefix} ${s.speakerName}`,
            title: s.specialization || s.degree,
            institution: s.affiliation,
            location: [s.city, s.state, s.country].filter(Boolean).join(', '),
            photo: s.speakerProfilePicture,
          }
        })

        setFaculty(mapped)
      } catch (error) {
        console.error('Failed to fetch faculty:', error)
        setFaculty([])
      } finally {
        setLoading(false)
      }
    }

    fetchFaculty()
  }, [webinarId])

  /* ================= GROUP BY TYPE ================= */

  const groupedFaculty = faculty.reduce<Record<FacultyTypeValue, FacultyItem[]>>(
    (acc, curr) => {
      acc[curr.facultyType] ||= []
      acc[curr.facultyType].push(curr)
      return acc
    },
    {} as Record<FacultyTypeValue, FacultyItem[]>
  )

  /* ================= CARD ================= */
function Card({ f }: { f: FacultyItem }) {
  return (
    <Link href={`/speakers/${f.id}`} className="block">
      <div
        className="
          group
          relative
          overflow-hidden
          rounded-2xl
          border
          bg-white
          p-5
          shadow-sm
          transition-all
          duration-300
          hover:shadow-2xl
          hover:-translate-y-1
          hover:border-blue-200
        "
      >
        {/* Gradient Hover Glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 bg-gradient-to-br from-blue-50 via-transparent to-blue-100 pointer-events-none" />

        <div className="relative z-10 flex gap-4">
          {/* Profile Image */}
          <div
            className="
              relative
              w-20
              h-20
              rounded-full
              overflow-hidden
              border-2
              border-blue-100
              ring-2
              ring-transparent
              group-hover:ring-blue-200
              transition-all
              duration-300
              flex-shrink-0
            "
          >
            {f.photo ? (
              <Image
                src={f.photo}
                alt={f.name}
                fill
                className="object-cover object-center group-hover:scale-105 transition duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-600 font-semibold text-lg">
                {f.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="min-w-0 space-y-2">
            <h3 className="text-base font-semibold text-[#1F5C9E] leading-tight line-clamp-2">
              {f.name}
            </h3>

            {f.title && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Briefcase size={14} className="text-gray-400" />
                <span className="line-clamp-1">{f.title}</span>
              </div>
            )}

            {f.institution && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building2 size={14} className="text-gray-400" />
                <span className="line-clamp-1">{f.institution}</span>
              </div>
            )}

            {f.location && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin size={14} className="text-gray-400" />
                <span className="line-clamp-1">{f.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

  /* ================= SECTION ================= */

  function Section({
    title,
    icon: Icon,
    items,
  }: {
    title: string
    icon: React.ComponentType<{ className?: string }>
    items: FacultyItem[]
  }) {
    if (!items?.length) return null

    return (
      <div className="mb-10">
        <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
          <Icon className="w-5 h-5 text-[#1F5C9E]" />
          {title}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((f) => (
            <Card key={f.id} f={f} />
          ))}
        </div>
      </div>
    )
  }

  /* ================= UI STATES ================= */

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    )
  }

  if (!faculty.length) {
    return (
      <p className="text-gray-500">
        No faculty information available.
      </p>
    )
  }

  /* ================= RENDER ALL TYPES ================= */

  return (
    <div>
      {facultyType.map(({ value, label, icon }) => (
        <Section
          key={value}
          title={label}
          icon={icon}
          items={groupedFaculty[value] || []}
        />
      ))}
    </div>
  )
}
