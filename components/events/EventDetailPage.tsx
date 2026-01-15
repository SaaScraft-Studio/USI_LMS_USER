// components/events/EventDetailPage.tsx

'use client'

import { JSX, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DOMPurify from 'dompurify'
import {
  CalendarDays,
  Clock,
  CheckCircle,
  Lock,
  MessageSquarePlus,
} from 'lucide-react'

import Overview from '@/components/Overview'
import Faculty from '@/components/Faculty'
import FAQ from '@/components/FAQ'
import Feedback from '@/components/Feedback'
import QuizTab from '@/components/QuizTab'
import AskQuestion from '@/components/AskQuestion'
import SponsorCard from '@/components/SponsorCard'
import WebinarSkeleton from '@/components/WebinarSkeleton'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'
import { EventType } from '@/lib/events/eventTypes'
import { eventConfig } from '@/lib/events/eventConfig'

import { useEventAccess } from '@/hooks/useEventAccess'
import { useEventSettings } from '@/hooks/useEventSettings'
import { useEventMeeting } from '@/hooks/useEventMeeting'
import { useEventComments } from '@/hooks/useEventComments'
import { apiRequest } from '@/lib/apiRequest'

type TabType = 'overview' | 'faculty' | 'faq' | 'feedback' | 'quiz' | 'question'

interface Props {
  type: EventType
}

export default function EventDetailPage({ type }: Props) {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const cfg = eventConfig[type]

  const { event, hasAccess, loading } = useEventAccess(id, user?.id)

  const settings = useEventSettings(id, hasAccess)
  const meeting = useEventMeeting(id, settings?.meeting)
  const { comments, addComment, posting } = useEventComments(
    id,
    hasAccess,
    user?.id
  )

  const [tab, setTab] = useState<TabType>('overview')
  const [commentText, setCommentText] = useState('')

  const availableTabs = useMemo<TabType[]>(() => {
    const t: TabType[] = ['overview']
    if (settings?.faculty) t.push('faculty')
    if (settings?.faq) t.push('faq')
    if (settings?.feedback) t.push('feedback')
    if (settings?.quiz) t.push('quiz')
    if (settings?.question) t.push('question')
    return t
  }, [settings])

  const tabPanels = useMemo<Record<TabType, JSX.Element>>(() => {
    if (!event) return {} as any

    return {
      overview: (
        <Overview
          description={DOMPurify.sanitize(event.description)}
          comments={comments}
          commentText={commentText}
          setCommentText={setCommentText}
          onAddComment={() => addComment(commentText)}
          posting={posting}
        />
      ),
      faculty: <Faculty webinarId={id} />,
      faq: <FAQ webinarId={id} />,
      feedback: <Feedback webinarId={id} />,
      quiz: <QuizTab webinarId={id} webinarTitle={event.name} />,
      question: <AskQuestion webinarId={id} />,
    }
  }, [event, comments, commentText, posting, id])

  // ✅ PLACE HERE — BEFORE RETURNS
  useEffect(() => {
    if (!hasAccess || !id) return

    const captureAttendance = async () => {
      try {
        await apiRequest({
          endpoint: `/api/webinar/${id}/attend`,
          method: 'POST',
        })
      } catch {
        // silent fail (already attended / outside window)
      }
    }

    captureAttendance()
  }, [hasAccess, id])

  if (loading) return <WebinarSkeleton />

  if (!hasAccess) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Lock size={48} className="text-red-500" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <Button onClick={() => router.push(cfg.backRoute)}>Go Back</Button>
      </div>
    )
  }

  if (!event) {
    return <div className="p-8 text-center">{cfg.notFoundText}</div>
  }


  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        <div className="space-y-6">
          {/* VIDEO */}
          <Card className="p-0">
            <CardContent className="p-0">
              <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                <iframe
                  src={event.streamLink}
                  title={event.name}
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                />
              </div>
            </CardContent>
          </Card>

          {/* META */}
          <Card>
            <CardHeader>
              <h1 className="text-xl font-semibold">{event.name}</h1>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex gap-2">
                <CalendarDays size={14} />
                {event.startDate} – {event.endDate}
              </div>
              <div className="flex gap-2">
                <Clock size={14} />
                {event.startTime} – {event.endTime}
              </div>

              {settings?.meeting && meeting && (
                <Button
                  asChild
                  className="bg-orange-600 hover:bg-orange-700 text-white w-full"
                >
                  <a
                    href={meeting.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Join Meeting
                  </a>
                </Button>
              )}

              <Button disabled className="w-full gap-2 bg-green-900">
                <CheckCircle size={16} />
                Registered
              </Button>
            </CardContent>
          </Card>

          {/* TABS */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-3 border-b pb-3 overflow-x-auto">
                {availableTabs.map((t) =>
                  t === 'question' ? (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`flex gap-2 px-4 py-1.5 rounded-full border ${
                        tab === t
                          ? 'bg-orange-600 text-white'
                          : 'border-orange-600 text-orange-600'
                      }`}
                    >
                      <MessageSquarePlus size={16} />
                      Ask Question
                    </button>
                  ) : (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`capitalize px-3 py-1.5 rounded-md ${
                        tab === t
                          ? 'bg-[#E8F3FF] text-orange-600 font-bold'
                          : 'text-gray-600'
                      }`}
                    >
                      {t}
                    </button>
                  )
                )}
              </div>

              <div className="mt-6">{tabPanels[tab]}</div>
            </CardContent>
          </Card>
        </div>

        <SponsorCard />
      </div>
    </div>
  )
}
