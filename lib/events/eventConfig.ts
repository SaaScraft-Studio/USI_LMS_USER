// lib/events/eventConfig.ts

import { EventType } from './eventTypes'

export const eventConfig: Record<
  EventType,
  {
    title: string
    listEndpoint: string
    backRoute: string
    notFoundText: string
    detailRoute: string
  }
> = {
  webinar: {
    title: 'USI Webinars',
    listEndpoint: '/webinars/usi/active',
    backRoute: '/webinar',
    notFoundText: 'Webinar not found',
    detailRoute: '/webinar',
  },
  program: {
    title: 'Smart Learning Program',
    listEndpoint: '/webinars/smart-learning/active',
    backRoute: '/program',
    notFoundText: 'Program not found',
    detailRoute: '/program',
  },
  workshop: {
    title: 'Live Workshops',
    listEndpoint: '/webinars/live-workshops/active',
    backRoute: '/workshop',
    notFoundText: 'Workshop not found',
    detailRoute: '/workshop',
  },
}
