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

  useEffect(() => {
    setOpen(view === 'list')
  }, [view])

  const router = useRouter()

  const handleNavigateToTopic = (topicId: string) => {
    router.push(`/conference/${conferenceId}/topic/${topicId}`)
  }


  return (
    <div className="rounded-lg overflow-hidden">
      {/* ===== SESSION HEADER ===== */}
      <button
        className="w-full flex justify-between items-center px-4 py-3 font-bold bg-gray-100"
        onClick={() => view === 'collapse' && setOpen((o) => !o)}
      >
        <div className="text-left font-bold text-green-800 hover:text-green-900">
          <div className="text-sm text-muted-foreground">
            {session.startTime} – {session.endTime}
          </div>
          {session.sessionName}
        </div>

        {view === 'collapse' && (
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-300 ${open ? 'rotate-180' : ''
              }`}
          />
        )}
      </button>

      {/* ===== TOPICS ===== */}
      <div
        className={`transition-all duration-300 overflow-hidden ${open ? 'max-h-[2000px]' : 'max-h-0'
          }`}
      >
        <div className="p-4 space-y-3 bg-white">
          {topics.map((t) => (
            <div
              key={t._id}
              className={`rounded-lg p-3  ${HALL_LIGHT_COLORS[hallIndex % 10]
                }`}
            >
              <div className="flex justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">
                    {t.startTime} – {t.endTime}
                  </div>
                  <div className="font-medium">{t.title}</div>
                </div>

                {t.videoLink && (
                  <button
                    onClick={() => handleNavigateToTopic(t._id)}
                    className="flex items-center gap-1 text-sm text-orange-600 hover:underline"
                  >
                    <Video className="h-4 w-4" />
                    Watch Video
                  </button>
                )}

              </div>

              {/* ===== ROLES ===== */}
              {(t.topicType === 'Presentation' ||
                t.topicType === 'Debate') && (
                  <p className="text-sm mt-1">
                    <b>Speaker:</b>{' '}
                    {t.speakerId
                      .map(
                        (s: any) =>
                          `${s.prefix} ${s.speakerName}`
                      )
                      .join(', ')}
                  </p>
                )}

              {t.topicType === 'Panel Discussion' && (
                <>
                  <p className="text-sm mt-1">
                    <b>Moderator:</b>{' '}
                    {t.moderator?.prefix}{' '}
                    {t.moderator?.speakerName}
                  </p>
                  <p className="text-sm">
                    <b>Panelists:</b>{' '}
                    {t.panelist
                      .map(
                        (p: any) =>
                          `${p.prefix} ${p.speakerName}`
                      )
                      .join(', ')}
                  </p>
                </>
              )}

              {t.topicType === 'Quiz' && (
                <>
                  <p className="text-sm mt-1">
                    <b>Quiz Master:</b>{' '}
                    {t.quizMaster?.prefix}{' '}
                    {t.quizMaster?.speakerName}
                  </p>
                  <p className="text-sm">
                    <b>Team:</b>{' '}
                    {t.teamMember
                      .map(
                        (m: any) =>
                          `${m.prefix} ${m.speakerName}`
                      )
                      .join(', ')}
                  </p>
                </>
              )}
            </div>
          ))}

          {/* ===== CHAIRPERSONS (SESSION LEVEL) ===== */}
          {session.chairperson?.length > 0 && (
            <div
              className={`pt-3 px-3 pb-3 rounded-lg
      ${HALL_LIGHT_COLORS[hallIndex % 10]}`}
            >
              <p className="text-sm font-bold mb-2 text-orange-600">
                Chairpersons:
              </p>

              <div className="flex flex-wrap gap-2">
                {session.chairperson.map((c: any) => (
                  <span
                    key={c._id}
                    className="px-3 py-1 font-semibold rounded-full text-sm bg-white/70 text-gray-800"
                  >
                    {c.prefix} {c.speakerName}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

SessionCard.Skeleton = function Skeleton() {
  return (
    <div className="animate-pulse space-y-2">
      <div className="h-10 bg-gray-300 rounded" />
      <div className="h-24 bg-gray-200 rounded" />
    </div>
  )
}
