'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Video } from 'lucide-react'
import { HALL_LIGHT_COLORS } from '@/app/(home)/conference/[id]/page'

type Props = {
  conferenceId: string
  session: any
  topics: any[]
  view: 'list' | 'collapse'
  hallIndex: number
}

export default function SessionCard({
  conferenceId,
  session,
  topics,
  view,
  hallIndex,
}: Props) {
  const [open, setOpen] = useState(view === 'list')
  const router = useRouter()

  useEffect(() => {
    setOpen(view === 'list')
  }, [view])

  const handleNavigateToTopic = (topicId?: string) => {
    if (!topicId) return
    router.push(`/conference/${conferenceId}/topic/${topicId}`)
  }

  const chairpersons = Array.isArray(session?.chairperson)
    ? session.chairperson
    : []

  return (
    <div className="rounded-lg overflow-hidden border bg-white shadow-sm">
      {/* ===== SESSION HEADER (WITH CHAIRPERSONS MERGED) ===== */}
      <button
        className="w-full px-4 py-4 text-left bg-gray-100 hover:bg-gray-200 transition"
        onClick={() => view === 'collapse' && setOpen((o) => !o)}
      >
        <div className="flex justify-between items-start gap-4">
          {/* Left Content */}
          <div className="space-y-1">
            {/* Time */}
            <div className="text-xs text-muted-foreground font-medium">
              {session?.startTime || '—'} – {session?.endTime || '—'}
            </div>

            {/* Session Name */}
            <div className="font-bold text-green-800 text-sm sm:text-base">
              {session?.sessionName || 'Untitled Session'}
            </div>

            {/* Chairpersons (NOW INSIDE HEADER) */}
            {chairpersons.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-sm font-semibold text-orange-600 mr-1">
                  Chairpersons:
                </span>
                {chairpersons.map((c: any) => (
                  <span
                    key={c?._id || `${c?.prefix}-${c?.speakerName}`}
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200"
                  >
                    {c?.prefix} {c?.speakerName}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Collapse Icon */}
          {view === 'collapse' && (
            <ChevronDown
              className={`h-4 w-4 mt-1 shrink-0 transition-transform duration-300 ${
                open ? 'rotate-180' : ''
              }`}
            />
          )}
        </div>
      </button>

      {/* ===== TOPICS ===== */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          open ? 'max-h-[2000px]' : 'max-h-0'
        }`}
      >
        <div className="p-4 space-y-3 bg-white">
          {(topics || []).map((t: any) => (
            <div
              key={t?._id}
              className={`rounded-lg p-3 ${
                HALL_LIGHT_COLORS[hallIndex % 10]
              }`}
            >
              {/* Top Row */}
              <div className="flex justify-between items-start gap-3">
                {/* Topic Info */}
                <div className="min-w-0">
                  <div className="text-sm text-muted-foreground">
                    {t?.startTime || '—'} – {t?.endTime || '—'}
                  </div>
                  <div className="font-medium line-clamp-2">
                    {t?.title || 'Untitled Topic'}
                  </div>
                </div>

                {/* WATCH VIDEO BUTTON (ICON INSIDE BUTTON) */}
                {t?.videoLink && (
                  <button
                    onClick={() => handleNavigateToTopic(t?._id)}
                    className="
                      flex items-center gap-2
                      px-3 py-1.5
                      text-xs font-semibold
                      bg-orange-600 text-white
                      rounded-md
                      hover:bg-orange-700
                      transition
                      whitespace-nowrap
                      shadow-sm
                    "
                  >
                    <Video className="h-4 w-4" />
                    Watch Video
                  </button>
                )}
              </div>

              {/* ===== ROLES ===== */}
              {(t?.topicType === 'Presentation' ||
                t?.topicType === 'Debate') &&
                Array.isArray(t?.speakerId) &&
                t.speakerId.length > 0 && (
                  <p className="text-sm mt-1">
                    <b>Speaker:</b>{' '}
                    {t.speakerId
                      .map(
                        (s: any) =>
                          `${s?.prefix || ''} ${s?.speakerName || ''}`.trim()
                      )
                      .join(', ')}
                  </p>
                )}

              {t?.topicType === 'Panel Discussion' && (
                <>
                  {t?.moderator && (
                    <p className="text-sm mt-1">
                      <b>Moderator:</b>{' '}
                      {t?.moderator?.prefix}{' '}
                      {t?.moderator?.speakerName}
                    </p>
                  )}
                  {Array.isArray(t?.panelist) &&
                    t.panelist.length > 0 && (
                      <p className="text-sm">
                        <b>Panelists:</b>{' '}
                        {t.panelist
                          .map(
                            (p: any) =>
                              `${p?.prefix || ''} ${p?.speakerName || ''}`.trim()
                          )
                          .join(', ')}
                      </p>
                    )}
                </>
              )}

              {t?.topicType === 'Quiz' && (
                <>
                  {t?.quizMaster && (
                    <p className="text-sm mt-1">
                      <b>Quiz Master:</b>{' '}
                      {t?.quizMaster?.prefix}{' '}
                      {t?.quizMaster?.speakerName}
                    </p>
                  )}
                  {Array.isArray(t?.teamMember) &&
                    t.teamMember.length > 0 && (
                      <p className="text-sm">
                        <b>Team:</b>{' '}
                        {t.teamMember
                          .map(
                            (m: any) =>
                              `${m?.prefix || ''} ${m?.speakerName || ''}`.trim()
                          )
                          .join(', ')}
                      </p>
                    )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

SessionCard.Skeleton = function Skeleton() {
  return (
    <div className="animate-pulse space-y-2">
      <div className="h-12 bg-gray-300 rounded" />
      <div className="h-24 bg-gray-200 rounded" />
    </div>
  )
}
