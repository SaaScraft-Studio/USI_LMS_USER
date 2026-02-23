// lib/events/eventTypes.ts

export type EventType = 'webinar' | 'program' | 'workshop'

export type EventStatus = 'Live' | 'Upcoming' | 'Past'

export interface EventListItem {
  _id: string
  name: string
  image: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  registrationType: 'free' | 'paid'
  amount: number
  dynamicStatus: EventStatus
}

export interface EventDetail {
  _id: string
  name: string
  streamLink: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  description: string
}

export type EventSettings = {
  faculty: boolean
  faq: boolean
  feedback: boolean
  quiz: boolean
  meeting: boolean
  question: boolean
  summary: boolean
}

export type MeetingData = {
  meetingName: string
  meetingLink: string
}
