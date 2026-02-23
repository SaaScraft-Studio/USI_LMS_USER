'use client'

import { useMemo } from 'react'
import useSWR from 'swr'
import { CalendarDays } from 'lucide-react'
import { FaRobot } from 'react-icons/fa'
import { fetcher } from '@/lib/fetcher'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'

/* ================= TYPES ================= */
type SummaryItem = {
  _id: string
  webinarId: {
    _id: string
    name: string
    webinarType: string
    startDate?: string
    endDate?: string
    startTime?: string
    endTime?: string
  } | null
  summary: string
}

/* ================= COMPONENT ================= */
export default function Summary({ webinarId }: { webinarId: string }) {
  if (!webinarId || Array.isArray(webinarId)) return null

  const { data } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/summaries/${webinarId}`,
    fetcher
  )

  const summaryItem: SummaryItem | null = useMemo(() => {
    const raw = data?.data ?? null
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      if (raw?.webinarId?._id === webinarId) return raw as SummaryItem
    }
    return null
  }, [data, webinarId])

  if (!summaryItem) {
    return (
      <div className="p-6 text-center text-gray-500">
        No AI summary available for this program.
      </div>
    )
  }

  const webinar = summaryItem.webinarId

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-muted-foreground">
            {webinar?.name || 'Untitled Program'}
          </CardTitle>

          <p className="text-md text-gray-500 mt-2">
            {webinar?.webinarType || 'Program'}
          </p>

          {(webinar?.startDate || webinar?.endDate) && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-3">
              <CalendarDays size={16} />
              <div className="flex flex-col leading-tight">
                <span>
                  {webinar?.startDate} – {webinar?.endDate}
                </span>
                <span>
                  {webinar?.startTime} - {webinar?.endTime}
                </span>
              </div>
            </div>
          )}

          <div className="border-t my-6" />

          <h3 className="font-semibold text-xl text-orange-700 flex items-center justify-center gap-2">
            <FaRobot size={20} />
            Program AI Summary
          </h3>
        </CardHeader>

        <CardContent className="overflow-y-auto flex-1 px-8 pb-8">
          <div
            className="
              prose
              max-w-none
              prose-lg
              text-gray-700
              break-words
              [&_ol]:list-decimal
              [&_ul]:list-disc
              [&_ol]:pl-6
              [&_ul]:pl-6
              [&_li]:ml-1
            "
            dangerouslySetInnerHTML={{
              __html: summaryItem.summary || '<p>No summary available.</p>',
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
