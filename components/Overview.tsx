'use client'

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'

/* ================= TYPES ================= */
type Props = {
  description?: string
}

/* ================= COMPONENT ================= */
export default function Overview({ description }: Props) {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <CardTitle>About Webinar</CardTitle>
            </CardHeader>

            {/* Scrollable Content */}
            <CardContent className="overflow-y-auto flex-1">
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
                  __html:
                    description || '<p>No overview available.</p>',
                }}
              />
            </CardContent>
          </Card>

        </div>
  )
}
