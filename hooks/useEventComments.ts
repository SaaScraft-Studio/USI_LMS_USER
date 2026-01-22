'use client'

import useSWR from 'swr'
import { useState } from 'react'
import { apiRequest } from '@/lib/apiRequest'
import { fetcher } from '@/lib/fetcher'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'

export type Comment = {
  id: string
  author: string
  profile?: string
  text: string
  date?: string
}

const DEFAULT_AVATAR = '/default-avatar.png'

export function useEventComments(
  eventId?: string,
  enabled?: boolean,
  userId?: string
) {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL!
  const { user, isLoading } = useAuthStore()

  const [commentText, setCommentText] = useState('')
  const [posting, setPosting] = useState(false)

  /* ---------------- FETCH COMMENTS (GET → fetcher) ---------------- */

  const { data, mutate } = useSWR<{ data: any[] }>(
    eventId && enabled
      ? `${API_BASE}/api/webinars/${eventId}/comments`
      : null,
    fetcher
  )

  const comments: Comment[] =
    data?.data?.map((c) => ({
      id: c._id,
      author: c.userId?.name || 'Anonymous',
      profile: c.userId?.profilePicture || DEFAULT_AVATAR,
      text: c.comment,
      date: c.createdAt,
    })) ?? []

  /* ---------------- ADD COMMENT (POST → apiRequest) ---------------- */

  const addComment = async () => {
    if (posting) return
    if (!commentText.trim() || !eventId || !userId) return

    setPosting(true)

    const tempId = `temp-${Date.now()}`

    const optimistic: Comment = {
      id: tempId,
      author: user?.name || 'You',
      profile: user?.profilePicture || DEFAULT_AVATAR,
      text: commentText,
      date: new Date().toISOString(),
    }

    setCommentText('')

    try {
      await apiRequest({
        endpoint: `/api/webinars/${eventId}/comments`,
        method: 'POST',
        body: {
          userId,
          comment: optimistic.text,
        },
      })

      toast.success('Comment added')

      // ✅ revalidate comments
      mutate()
    } catch (err: any) {
      toast.error(err.message || 'Failed to add comment')
    } finally {
      setPosting(false)
    }
  }

  return {
    comments,
    commentText,
    setCommentText,
    addComment,
    posting,
  }
}
