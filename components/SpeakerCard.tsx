'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Building, MapPin, Video, Film } from 'lucide-react'
import { Card } from '@/components/ui/card'

export type SpeakerCardItem = {
  id: string
  name: string
  photo: string
  institute: string
  location: string
  topicVideos: number
  webinarVideos: number
  totalVideos: number
}

export default function SpeakerCard({
  speaker,
}: {
  speaker: SpeakerCardItem
}) {
  return (
    <Link href={`/speakers/${speaker.id}`} className="block">
      <Card
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

        {/* TOP ROW: IMAGE + NAME */}
        <div className="relative z-10 flex items-center gap-4">
          {/* Profile Image */}
          <div
            className="
              relative
              w-16
              h-16
              sm:w-18
              sm:h-18
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
            <Image
              src={speaker.photo || '/avatar.png'}
              alt={speaker.name || 'user'}
              fill
              className="object-cover object-center group-hover:scale-105 transition duration-300"
            />
          </div>

          {/* Name + Institute */}
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-[#1F5C9E] leading-tight line-clamp-2">
              {speaker.name}
            </h3>

            <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
              <Building size={16} className="text-gray-400" />
              <span className="line-clamp-1">
                {speaker.institute || '—'}
              </span>
            </div>

            {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={16} className="text-gray-400" />
            <span className="line-clamp-1">
              {speaker.location || '—'}
            </span>
          </div>
          </div>
        </div>

        {/* BELOW CONTENT (FULL WIDTH) */}
        <div className="relative z-10 mt-4 space-y-3">

          {/* VIDEO STATS (Modern Pills) */}
          <div className="grid grid-cols-3 gap-2">
            {/* Conference Faculty */}
            <div className="rounded-lg bg-blue-50 px-3 py-2 text-center transition group-hover:bg-blue-100">
              <div className="flex items-center justify-center gap-1 text-blue-600">
                <Film size={14} />
                <span className="text-xs font-medium">Faculty</span>
              </div>
              <p className="text-sm font-semibold text-blue-900 mt-0.5">
                {speaker.topicVideos}
              </p>
            </div>

            {/* Program Videos */}
            <div className="rounded-lg bg-purple-50 px-3 py-2 text-center transition group-hover:bg-purple-100">
              <div className="flex items-center justify-center gap-1 text-purple-600">
                <Video size={14} />
                <span className="text-xs font-medium">Programs</span>
              </div>
              <p className="text-sm font-semibold text-purple-900 mt-0.5">
                {speaker.webinarVideos}
              </p>
            </div>

            {/* Total Videos */}
            <div className="rounded-lg bg-gray-50 px-3 py-2 text-center transition group-hover:bg-gray-100">
              <div className="flex items-center justify-center gap-1 text-gray-700">
                <Video size={14} />
                <span className="text-xs font-medium">Total</span>
              </div>
              <p className="text-sm font-bold text-gray-900 mt-0.5">
                {speaker.totalVideos}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
