'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, Video } from 'lucide-react'

const SESSION_COLORS = [
  'bg-slate-50',
  'bg-zinc-50',
  'bg-neutral-50',
  'bg-stone-50',
  'bg-gray-50',
]

type Props = {
  session: any
  topics: any[]
  view: 'list' | 'collapse'
  index: number
}

export default function SessionCard({ session, topics, view, index }: Props) {
  const [open, setOpen] = useState(view === 'list')

  useEffect(() => {
    setOpen(view === 'list')
  }, [view])

  return (
    <div
      className={`rounded-lg border overflow-hidden ${
        SESSION_COLORS[index % 5]
      }`}
    >
      {/* SESSION HEADER */}
      <button
        className="w-full flex justify-between items-center px-4 py-3 font-semibold"
        onClick={() => view === 'collapse' && setOpen((o) => !o)}
      >
        <div className="text-left">
          <div className="text-sm text-muted-foreground">
            {session.startTime} – {session.endTime}
          </div>
          {session.sessionName}
        </div>

        {view === 'collapse' && (
          <div className="flex items-center gap-2">
            <span className="text-xs bg-orange-600 text-white px-2 py-1 rounded">
              {topics.length} Topics
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-300 ${
                open ? 'rotate-180' : ''
              }`}
            />
          </div>
        )}
      </button>

      {/* TOPICS */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          open ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4 space-y-4 bg-white">
          {topics.map((t) => (
            <div key={t._id} className="border rounded p-3 space-y-1">
              <div className="flex justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">
                    {t.startTime} – {t.endTime}
                  </div>
                  <div className="font-medium">{t.title}</div>
                </div>

                {t.videoLink && (
                  <a
                    href={t.videoLink}
                    target="_blank"
                    className="flex items-center gap-1 text-sm text-orange-600"
                  >
                    <Video className="h-4 w-4" />
                    Watch Video
                  </a>
                )}
              </div>

              {(t.topicType === 'Presentation' || t.topicType === 'Debate') && (
                <p className="text-sm">
                  <b>Speaker:</b>{' '}
                  {t.speakerId
                    .map((s: any) => `${s.prefix} ${s.speakerName}`)
                    .join(', ')}
                </p>
              )}

              {t.topicType === 'Panel Discussion' && (
                <>
                  <p className="text-sm">
                    <b>Moderator:</b> {t.moderator}
                  </p>
                  <p className="text-sm">
                    <b>Panelists:</b> {t.panelist.join(', ')}
                  </p>
                </>
              )}

              {t.topicType === 'Quiz' && (
                <>
                  <p className="text-sm">
                    <b>Quiz Master:</b> {t.quizMaster}
                  </p>
                  <p className="text-sm">
                    <b>Team:</b> {t.teamMember.join(', ')}
                  </p>
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
      <div className="h-10 bg-gray-300 rounded" />
      <div className="h-24 bg-gray-200 rounded" />
    </div>
  )
}
