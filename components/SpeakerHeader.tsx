'use client'

import Image from 'next/image'
import { Building, MapPin, BadgeCheck } from 'lucide-react'
import { Card } from '@/components/ui/card'

export type Speaker = {
  id?: string
  name?: string
  qualification?: string // affiliation
  institute?: string
  location?: string
  photo?: string
  videos?: number
}

export default function SpeakerHeader({
  speaker,
}: {
  speaker: Speaker
}) {
  // 🛡 SAFE FALLBACK NORMALIZATION (prevents null crash)
  const name = speaker?.name || 'Unnamed Speaker'
  const photo = speaker?.photo || '/avatar.png'
  const institute =
    speaker?.qualification || speaker?.institute || '—'
  const location = speaker?.location || '—'

  return (
    <div className="flex justify-center w-full">
      <Card
        className="
          group
          relative
          w-full
          max-w-2xl
          overflow-hidden
          rounded-3xl
          border
          bg-white
          p-6
          shadow-md
          transition-all
          duration-300
          hover:shadow-2xl
          hover:-translate-y-1
          hover:border-blue-200
        "
      >
        {/* Gradient Hover Glow (matches SpeakerCard UI) */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 bg-gradient-to-br from-blue-50 via-transparent to-blue-100 pointer-events-none" />

        {/* ================= TOP ROW: IMAGE + NAME ================= */}
        <div className="relative z-10 flex items-center gap-5">
          {/* Profile Image */}
          <div
            className="
              relative
              w-20
              h-20
              sm:w-24
              sm:h-24
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
              bg-gray-100
            "
          >
            <Image
              src={photo}
              alt={name}
              fill
              sizes="96px"
              className="object-cover object-center group-hover:scale-105 transition duration-300"
              priority
            />
          </div>

          {/* Name + Institute */}
          <div className="min-w-0">
            {/* Name */}
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#1F5C9E] leading-tight line-clamp-2">
                {name}
              </h1>
              <BadgeCheck className="h-5 w-5 text-blue-600 shrink-0" />
            </div>

            {/* Institute / Affiliation */}
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
              <Building size={16} className="text-gray-400" />
              <span className="line-clamp-1">
                {institute}
              </span>
            </div>
          </div>
        </div>

        {/* ================= BELOW CONTENT (FULL WIDTH) ================= */}
        <div className="relative z-10 mt-5 space-y-3">
          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={16} className="text-gray-400" />
            <span className="line-clamp-1">
              {location}
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}
