// components/events/EventRegisterDialog.tsx

'use client'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useState } from 'react'
import { apiRequest } from '@/lib/apiRequest'
import { EventListItem } from '@/lib/events/eventTypes'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  event: EventListItem | null
  userId?: string
  onSuccess: (eventId: string) => void
}

export default function EventRegisterDialog({
  open,
  onOpenChange,
  event,
  userId,
  onSuccess,
}: Props) {
  const [identifier, setIdentifier] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const buildPayload = () => {
    if (/^\d{10}$/.test(identifier)) return { mobile: identifier }
    if (identifier.includes('@')) return { email: identifier }
    return { membershipNumber: identifier }
  }

  const handleSubmit = async () => {
    if (!event || !identifier || !userId) return

    try {
      setSubmitting(true)

      await apiRequest({
        endpoint: '/api/webinar/register',
        method: 'POST',
        body: {
          webinarId: event._id,
          userId,
          ...buildPayload(),
        },
      })

      toast.success('You have successfully registered 🎉')
      onSuccess(event._id)
      onOpenChange(false)
      setIdentifier('')
    } catch (err: any) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        {event?.registrationType === 'paid' ? (
          <div className="space-y-4 text-center">
            <h2 className="text-lg font-semibold">
              Payment integration coming soon
            </h2>
            <AlertDialogCancel disabled={submitting}>Close</AlertDialogCancel>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-center text-lg font-semibold text-blue-600">
              Register for FREE
            </h2>

            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={submitting}
              placeholder="USI No | Email | Mobile"
              className="w-full border rounded px-4 py-2"
            />

            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </Button>

            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
          </div>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
