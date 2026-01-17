'use client'

import Image from 'next/image'
import { MapPin, BadgeCheck, University } from 'lucide-react'

export type Speaker = {
  id?: string
  name: string
  qualification: string
  institute?: string
  location: string
  photo?: string
  videos?: number
}

export default function SpeakerHeader({ speaker }: { speaker: Speaker }) {
  return (
    <div className="flex items-center justify-center">
      <div
        className="
          w-full max-w-sm
          rounded-2xl bg-white p-6
          shadow-md ring-1 ring-gray-200
          transition-all duration-300
          hover:shadow-xl
        "
      >
        {/* ================= AVATAR ================= */}
        <div className="flex justify-center">
          <div className="relative h-28 w-28 rounded-full overflow-hidden border-4 border-white shadow-sm bg-gray-100">
            <Image
              src={speaker.photo || '/avatar.png'}
              alt={speaker.name}
              fill
              sizes="112px"
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* ================= NAME ================= */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <h1 className="text-lg font-semibold text-[#1F5C9E] text-center">
            {speaker.name}
          </h1>
          <BadgeCheck className="h-4 w-4 text-blue-600 shrink-0" />
        </div>

        {/* ================= QUALIFICATION ================= */}
        {speaker.qualification && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-700">
            <University className="h-4 w-4 text-[#1F5C9E]" />
            <span className="text-center">{speaker.qualification}</span>
          </div>
        )}

        {/* ================= LOCATION ================= */}
        {speaker.location && (
          <div className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-700">
            <MapPin className="h-4 w-4 text-[#1F5C9E]" />
            <span className="text-center">{speaker.location}</span>
          </div>
        )}
      </div>
    </div>
  )
}
