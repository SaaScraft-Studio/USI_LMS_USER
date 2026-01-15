// components/events/EventCard.tsx

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { CalendarDays, Clock } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import CountdownTimer from '@/components/CountdownTimer'
import StatusBadge from '@/components/StatusBadge'
import { EventListItem, EventType } from '@/lib/events/eventTypes'
import { eventConfig } from '@/lib/events/eventConfig'

interface Props {
  event: EventListItem
  type: EventType
  isRegistered: boolean
  onRegister: () => void
}

export default function EventCard({
  event,
  type,
  isRegistered,
  onRegister,
}: Props) {
  const cfg = eventConfig[type]
  

  return (
    <Card className="p-0 group rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition hover:-translate-y-1 flex flex-col">
      <div className="relative h-[250px] w-full overflow-hidden">
        <Image
          src={event.image || '/avatar.png'}
          alt={event.name}
          fill
          className="object-fit transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      <CardContent className="flex flex-col flex-grow">
        <StatusBadge status={event.dynamicStatus} />

        <h3 className="font-semibold text-sm line-clamp-2">{event.name}</h3>

        {event.dynamicStatus === 'Upcoming' && (
          <CountdownTimer
            startDate={event.startDate}
            startTime={event.startTime}
          />
        )}

        <div className="mt-3 text-xs text-gray-600 space-y-2">
          <div className="flex items-center gap-2">
            <CalendarDays size={14} />
            {event.startDate} – {event.endDate}
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} />
            {event.startTime} – {event.endTime}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {isRegistered ? (
          <Link href={`${cfg.detailRoute}/${event._id}`} className="w-full">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              View Details
            </Button>
          </Link>
        ) : (
          <Button
            onClick={onRegister}
            className={`w-full ${
              event.registrationType === 'free'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            {event.registrationType === 'free'
              ? 'Register Free'
              : `₹${event.amount} | Register`}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
