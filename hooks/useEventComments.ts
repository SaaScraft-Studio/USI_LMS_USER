'use client'

import { useEffect, useState } from 'react'
import { apiRequest } from '@/lib/apiRequest'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'

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
  const { user, isHydrated } = useAuthStore()

  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [posting, setPosting] = useState(false)

  /* ---------- Fetch comments ---------- */
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

  /* ---------- Add comment (optimistic) ---------- */
  const addComment = async () => {
    if (!commentText.trim() || !eventId || !userId) return

    const tempId = `temp-${Date.now()}`

    const optimistic: Comment = {
      id: tempId,
      author: user?.name || 'You',
      profile: isHydrated ? user?.profilePicture : undefined,
      text: commentText,
      date: new Date().toISOString(),
    }

    setComments((prev) => [optimistic, ...prev])
    setCommentText('')

    try {
      setPosting(true)

      const res = await apiRequest({
        endpoint: `/webinars/${eventId}/comments`,
        method: 'POST',
        body: { userId, comment: optimistic.text },
      })

      toast.success('Comment added')

      setComments((prev) =>
        prev.map((c) =>
          c.id === tempId
            ? { ...c, id: res.data._id, date: res.data.createdAt }
            : c
        )
      )
    } catch (err: any) {
      setComments((prev) => prev.filter((c) => c.id !== tempId))
      toast.error(err.message || 'Failed to add comment')
    } finally {
      setPosting(false)
    }
  }

  /* ---------- Upgrade avatar after hydration ---------- */
  useEffect(() => {
    if (!isHydrated || !user?.profilePicture) return

    setComments((prev) =>
      prev.map((c) =>
        c.author === user.name && !c.profile
          ? { ...c, profile: user.profilePicture }
          : c
      )
    )
  }, [isHydrated, user?.profilePicture, user?.name])

  return {
    comments,
    commentText,
    setCommentText,
    addComment,
    posting,
  }
}
