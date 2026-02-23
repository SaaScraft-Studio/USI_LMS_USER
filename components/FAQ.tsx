'use client'

import { useEffect, useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { apiRequest } from '@/lib/apiRequest'

/* ================= TYPES ================= */
type FAQItem = {
  id: string
  q: string
  a: string
}

export default function FAQ({ webinarId }: { webinarId: string }) {
  const [faq, setFaq] = useState<FAQItem[]>([])
  const [loading, setLoading] = useState(true)

  /* ================= FETCH FAQ ================= */
  useEffect(() => {
    if (!webinarId) return

    const fetchFAQ = async () => {
      try {
        const res = await apiRequest({
          endpoint: `/api/webinars/${webinarId}/qna`,
          method: 'GET',
        })

        const mapped: FAQItem[] =
          res?.data?.questionsAndAnswers?.map((q: any) => ({
            id: q._id,
            q: q.question,
            a: q.answer,
          })) || []

        setFaq(mapped)
      } catch {
        setFaq([])
      } finally {
        setLoading(false)
      }
    }

    fetchFAQ()
  }, [webinarId])

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-14 rounded-lg" />
        <Skeleton className="h-14 rounded-lg" />
      </div>
    )
  }

  /* ================= EMPTY ================= */
  if (!faq.length) {
    return (
      <p className="text-muted-foreground">
        No FAQs available for this webinar.
      </p>
    )
  }

  /* ================= UI ================= */
  return (
    <div className="w-full max-w-full min-w-0">
      <h2 className="text-xl md:text-2xl font-semibold mb-6">
        Frequently Asked Questions
      </h2>

      <Card className="p-0">
        <Accordion type="single" collapsible className="w-full divide-y">
          {faq.map((item, index) => (
            <AccordionItem
              key={item.id}
              value={`faq-${index}`}
              className="px-4 md:px-6"
            >
              <AccordionTrigger className="text-left text-sm md:text-base font-medium hover:no-underline">
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="mt-2 inline-block w-2.5 h-2.5 rounded-full bg-[#C7D8EE] shrink-0"
                  />
                  <span className="flex-1">{item.q}</span>
                </div>
              </AccordionTrigger>

              <AccordionContent className="pl-6 md:pl-8 pr-2 pb-4 text-sm text-muted-foreground leading-relaxed">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>
    </div>
  )
}
