'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import DOMPurify from 'dompurify'
import { useAuthStore } from '@/stores/authStore'
import { Download, ExternalLink } from 'lucide-react'
import SponsorCard from '@/components/SponsorCard'
import getPaginationPages from '@/utils/getPaginationPages'

/* ================= CONSTANTS ================= */

const COMMENTS_LIMIT = 50

/* ================= TYPES ================= */

type Module = {
  _id: string
  topicName: string
  aboutTopic: string
  contentType: 'video' | 'document' | 'image'
  contentUrl: string
  videoDuration?: string
  description: string
  additionalResources?: string[]
  weekCategoryId: {
    _id: string
    weekCategoryName: string
  }
  courseId: {
    _id: string
    courseName: string
  }
}

type Comment = {
  _id: string
  comment: string
  createdAt: string
  userId: {
    name: string
    profilePicture?: string
  }
}

/* ================= PAGE ================= */

export default function ModuleLecturePage() {
  const { courseId, moduleId } = useParams<{
    courseId: string
    moduleId: string
  }>()

  const router = useRouter()
  const { user, isHydrated } = useAuthStore()

  const [module, setModule] = useState<Module | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [totalComments, setTotalComments] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [posting, setPosting] = useState(false)

  const totalPages = Math.ceil(totalComments / COMMENTS_LIMIT)

  /* ================= FETCH MODULE ================= */

  useEffect(() => {
    const fetchModule = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/modules/${moduleId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        )
        const json = await res.json()
        setModule(json.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    fetchModule()
  }, [moduleId])

  /* ================= FETCH COMMENTS ================= */

  const fetchComments = async (pageNo = 1) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/courses/${courseId}/modules/${moduleId}/comments?page=${pageNo}&limit=${COMMENTS_LIMIT}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    )

    const json = await res.json()
    setTotalComments(json.total || 0)
    setComments(json.data || [])
  }

  useEffect(() => {
    if (module) fetchComments(1)
  }, [module])

  /* ================= POST COMMENT ================= */

  const handlePostComment = async () => {
    if (!commentText.trim() || !user || !module) return

    setPosting(true)

    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/courses/${courseId}/modules/${moduleId}/comments`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          comment: commentText,
          userId: user.id,
          courseModuleId: module._id,
          weekCategoryId: module.weekCategoryId._id,
        }),
      }
    )

    setCommentText('')
    setPage(1)
    await fetchComments(1)
    setPosting(false)
  }

  /* ================= SKELETON ================= */

  if (!isHydrated || loading) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-4 animate-pulse">
        <div className="h-4 w-1/4 bg-gray-200 rounded" />
        <div className="h-8 w-2/3 bg-gray-200 rounded" />
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    )
  }

  if (!module) return null

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">

        {/* ================= MAIN CONTENT ================= */}
        <div className="space-y-6">

          {/* Breadcrumb */}
          <div className="text-sm flex gap-2">
            <button
              onClick={() => router.back()}
              className="text-orange-600 hover:underline"
            >
              Courses
            </button>
            <span className="text-gray-400">›</span>
            <span className="font-medium text-gray-700">
              {module.courseId.courseName}
            </span>
          </div>

          {/* Header */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-2">
            <p className="text-sm text-gray-500">
              {module.weekCategoryId.weekCategoryName}
            </p>
            <h1 className="text-2xl font-semibold">{module.topicName}</h1>
            <p className="text-gray-600 text-sm">{module.aboutTopic}</p>
          </div>

          {/* Video */}
          {module.contentType === 'video' && (
            <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
              <div className="aspect-video rounded-xl overflow-hidden">
                <iframe
                  src={module.contentUrl}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>

              {/* DESCRIPTION (NEW) */}
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(module.description),
                }}
              />

              {/* Resources */}
              {module.additionalResources?.length ? (
                <div className="flex flex-wrap gap-3">
                  {module.additionalResources.map((link, i) => (
                    <a
                      key={i}
                      href={link}
                      target="_blank"
                      className="px-4 py-2 text-sm rounded-lg border bg-gray-50 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <ExternalLink size={14} /> Resource {i + 1}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          )}

          {/* Document / Image */}
          {module.contentType !== 'video' && (
            <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(module.description),
                }}
              />

              <div className="flex flex-wrap gap-4">
                <a
                  href={module.contentUrl}
                  download
                  className="px-5 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-sm flex items-center gap-2"
                >
                  <Download size={16} /> Download
                </a>

                <a
                  href={module.contentUrl}
                  target="_blank"
                  className="px-5 py-2 rounded-lg border text-sm flex items-center gap-2"
                >
                  <ExternalLink size={16} /> View
                </a>
              </div>
            </div>
          )}

          {/* COMMENTS */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
            <textarea
              rows={4}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write your comment..."
              className="w-full border rounded-lg p-3 text-sm"
            />

            <button
              onClick={handlePostComment}
              disabled={posting}
              className="px-6 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-sm"
            >
              {posting ? 'Posting...' : 'Post Comment'}
            </button>

            {comments.map((c) => (
              <div key={c._id} className="border rounded-xl p-4">
                <div className="flex items-center gap-3">
                  {c.userId.profilePicture && (
                    <Image
                      src={c.userId.profilePicture}
                      alt={c.userId.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-medium text-sm">{c.userId.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(c.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-sm">{c.comment}</p>
              </div>
            ))}

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-4">
                {getPaginationPages(page, totalPages).map((p, i) =>
                  p === 'dots' ? (
                    <span key={i} className="px-3 py-1 text-gray-400">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => {
                        setPage(p)
                        fetchComments(p)
                      }}
                      className={`px-3 py-1 rounded-md text-sm ${
                        p === page
                          ? 'bg-orange-600 text-white'
                          : 'border hover:bg-gray-100'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* ================= SPONSOR (DESKTOP) ================= */}
        <div className="hidden lg:block sticky top-24 h-fit">
          <SponsorCard />
        </div>
      </div>

      {/* ================= SPONSOR (MOBILE / TABLET) ================= */}
      <div className="lg:hidden px-4 pb-8">
        <SponsorCard />
      </div>
    </div>
  )
}
