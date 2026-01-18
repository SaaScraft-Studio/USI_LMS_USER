// hooks/useEventComments.ts

'use client'

import { useEffect, useState } from 'react'
import { apiRequest } from '@/lib/apiRequest'
import { toast } from 'sonner'

export type Comment = {
  id: string
  author: string
  profile?: string
  text: string
  date?: string
}

export function useEventComments(
  eventId?: string,
  enabled?: boolean,
  userId?: string
) {
  const [comments, setComments] = useState<Comment[]>([])
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    if (!eventId || !enabled) return

    const fetchComments = async () => {
      try {
        const res = await apiRequest({
          endpoint: `/webinars/${eventId}/comments`,
          method: 'GET',
        })

        setComments(
          res.data.map((c: any) => ({
            id: c._id,
            author: c.userId?.name || 'Anonymous',
            profile: c.userId?.profilePicture,
            text: c.comment,
            date: c.createdAt,
          }))
        )
      } catch {
        setComments([])
      }
    }

    fetchComments()
  }, [eventId, enabled])

  const addComment = async (text: string) => {
    if (!text.trim() || !eventId || !userId) return

    try {
      setPosting(true)
      await apiRequest({
        endpoint: `/webinars/${eventId}/comments`,
        method: 'POST',
        body: { userId, comment: text },
      })
      toast.success('Comment added')
    } catch (err: any) {
      toast.error(err.message || 'Failed to add comment')
    } finally {
      setPosting(false)
    }
  }

  return { comments, addComment, posting }
}
