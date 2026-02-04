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
      <div className="border rounded-xl p-4 flex gap-4 bg-white">
        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shrink-0">
          {f.photo ? (
            <Image
              src={f.photo}
              alt={f.name}
              width={80}
              height={80}
              className="object-cover"
            />
          ) : (
            <span className="text-xl font-semibold text-gray-600">
              {f.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </span>
          )}
        </div>

        <div className="space-y-1">
          <Link href={`/speakers/${f.id}`}>
            <h3 className="text-[#1F5C9E] font-semibold hover:underline">
              {f.name}
            </h3>
          </Link>

          {f.title && (
            <div className="flex items-center gap-2 text-sm">
              <Briefcase size={14} />
              <span>{f.title}</span>
            </div>
          )}

          {f.institution && (
            <div className="flex items-center gap-2 text-sm">
              <Building2 size={14} />
              <span>{f.institution}</span>
            </div>
          )}

          {f.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin size={14} />
              <span>{f.location}</span>
            </div>
          )}
        </div>
      </div>
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
