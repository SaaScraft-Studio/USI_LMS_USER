'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DOMPurify from 'dompurify'
import { useAuthStore } from '@/stores/authStore'
import SponsorCard from '@/components/SponsorCard'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { apiRequest } from '@/lib/apiRequest'
import Image from 'next/image'
import { Building, MapPin, Film, GraduationCap } from 'lucide-react'
import { Card } from '@/components/ui/card'
import Pagination from '@/components/Pagination'

const COMMENTS_LIMIT = 50

export default function TopicDetailPage() {
  const router = useRouter()

  const { id: conferenceId, topicId } = useParams<{
    id: string
    topicId: string
  }>()

  const { user } = useAuthStore()

  const [page, setPage] = useState(1)
  const [activeTab, setActiveTab] =
    useState<'overview' | 'faculty'>('overview')
  const [commentText, setCommentText] = useState('')
  const [posting, setPosting] = useState(false)

  /* ================= FETCH TOPIC ================= */

  const {
    data: topicRes,
    isLoading: topicLoading,
    error: topicError,
  } = useSWR(
    topicId
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/topics/${topicId}`
      : null,
    fetcher
  )

  const topic = topicRes?.data

  /* ================= FETCH COMMENTS ================= */

  const {
    data: commentsRes,
    isLoading: commentsLoading,
    mutate: mutateComments,
  } = useSWR(
    topic
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/conferences/${conferenceId}/sessions/${topic.sessionId._id}/topics/${topic._id}/comments?page=${page}&limit=${COMMENTS_LIMIT}`
      : null,
    fetcher
  )

  const comments = commentsRes?.data ?? []
  const totalComments = commentsRes?.total ?? 0
  const totalPages = Math.ceil(totalComments / COMMENTS_LIMIT)

  /* ================= POST COMMENT ================= */

  const handlePostComment = async () => {
    if (!commentText.trim() || !user || !topic || posting) return

    try {
      setPosting(true)

      await apiRequest<
        { userId: string; comment: string },
        any
      >({
        endpoint: `/api/conferences/${conferenceId}/sessions/${topic.sessionId._id}/topics/${topic._id}/comments`,
        method: 'POST',
        body: {
          userId: user.id,
          comment: commentText,
        },
        showToast: false,
      })

      setCommentText('')
      setPage(1)
      await mutateComments() // ✅ revalidate comments
    } finally {
      setPosting(false)
    }
  }

  /* ================= LOADING / ERROR ================= */

  if (topicLoading || !topic) {
    return (
      <div className="max-w-5xl mx-auto p-6 animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-10 bg-gray-200 rounded w-2/3" />
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    )
  }

  if (topicError) {
    return (
      <div className="max-w-5xl mx-auto p-6 text-red-600">
        Failed to load topic
      </div>
    )
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">

        {/* ================= MAIN CONTENT ================= */}
        <div className="space-y-6">

          {/* ===== BREADCRUMB ===== */}
          <nav className="text-sm flex items-center gap-2 text-gray-600">
            <button
              onClick={() =>
                router.push(`/conference/${topic.conferenceId._id}`)
              }
              className="text-orange-600 hover:underline font-medium"
            >
              {topic.conferenceId.name}
            </button>
            <span className="text-gray-400">›</span>
            <span className="text-gray-700 font-medium">Topic Details</span>
          </nav>

          {/* ===== HEADER ===== */}
          <div className="bg-white rounded-2xl border p-6">
            <p className="text-sm text-gray-500">{topic.topicType}</p>
            <h1 className="text-2xl font-bold">{topic.title}</h1>
            <p className="text-sm text-gray-600">
              {topic.startTime} – {topic.endTime}
            </p>
          </div>

          {/* ===== VIDEO ===== */}
          {topic.videoLink && (
            <div className="bg-white rounded-2xl border p-4">
              <div className="aspect-video overflow-hidden rounded-xl">
                <iframe
                  src={topic.videoLink}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            </div>
          )}

         {/* ===== TABS ===== */}
<div className="flex gap-3 border-b pb-3 overflow-x-auto">
  {['overview', 'faculty'].map((tab) => (
    <button
      key={tab}
      onClick={() => setActiveTab(tab as any)}
      className={`capitalize px-4 py-1.5 rounded-md text-sm transition-colors ${
        activeTab === tab
          ? 'bg-[#E8F3FF] text-orange-600 font-semibold'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {tab}
    </button>
  ))}
</div>

          {/* ===== OVERVIEW ===== */}
          {activeTab === 'overview' && (
            <div className="bg-white rounded-2xl border p-6 space-y-6">
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
                  __html: DOMPurify.sanitize(topic.description),
                }}
              />

              {/* COMMENT BOX */}
              <div className="space-y-3">
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
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg text-sm"
                >
                  {posting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>

              {/* COMMENTS */}
              <div className="space-y-4">
                {comments.map((c: any) => (
                  <div key={c._id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3">

                      {/* SAFE AVATAR */}
                      <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                        <Image
                          src={c?.userId?.profilePicture || '/avatar.png'}
                          alt={c?.userId?.name || 'User'}
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      </div>

                      <div>
                        <p className="text-sm font-semibold">
                          {c?.userId?.name || 'Anonymous User'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {c?.createdAt
                            ? new Date(c.createdAt).toLocaleString()
                            : ''}
                        </p>
                      </div>
                    </div>

                    <p className="mt-2 text-sm">{c?.comment}</p>
                  </div>
                ))}
              </div>

              {/* PAGINATION */}
              <Pagination
  page={page}
  totalPages={totalPages}
  onChange={setPage}
/>
            </div>
          )}

          {/* ===== FACULTY ===== */}
          {activeTab === 'faculty' && (
            <div className="bg-white rounded-2xl border p-6 space-y-8">

              {/* ===== CHAIRPERSONS (TOP) ===== */}
              {topic?.sessionId?.chairperson?.length > 0 && (
                <FacultySection
                  title="Chairpersons"
                  data={topic.sessionId.chairperson}
                />
              )}

              {topic.topicType === 'Presentation' &&
                topic.speakerId?.length === 1 && (
                  <FacultySection
                    title="Speaker"
                    data={[topic.speakerId[0]]}
                  />
                )}

              {topic.topicType === 'Debate' &&
                topic.speakerId?.length > 0 && (
                  <FacultySection
                    title="Debate Speakers"
                    data={topic.speakerId}
                  />
                )}

              {topic.topicType === 'Panel Discussion' && (
                <>
                  {topic.moderator && (
                    <FacultySection
                      title="Moderator"
                      data={[topic.moderator]}
                    />
                  )}
                  {topic.panelist?.length > 0 && (
                    <FacultySection
                      title="Panelists"
                      data={topic.panelist}
                    />
                  )}
                </>
              )}

              {topic.topicType === 'Quiz' && (
                <>
                  {topic.quizMaster && (
                    <FacultySection
                      title="Quiz Master"
                      data={[topic.quizMaster]}
                    />
                  )}
                  {topic.teamMember?.length > 0 && (
                    <FacultySection
                      title="Team Members"
                      data={topic.teamMember}
                    />
                  )}
                </>
              )}
            </div>
          )}
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

/* ================= FACULTY SECTION (PREMIUM UI - SAME AS SPEAKER CARD) ================= */



function FacultySection({ title, data }: any) {
  const router = useRouter()

  if (!Array.isArray(data) || data.length === 0) return null

  return (
    <div>
      <h3 className="font-semibold mb-4">{title}</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-5">
        {data.map((sp: any) => {
          const name =
            [sp?.prefix, sp?.speakerName].filter(Boolean).join(' ') ||
            'Unnamed Speaker'

          const institute = sp?.affiliation || '—'
          const location =
            [sp?.state, sp?.country].filter(Boolean).join(', ') ||
            sp?.country ||
            '—'

          return (
            <Card
              key={sp?._id}
              onClick={() =>
                sp?._id && router.push(`/speakers/${sp._id}`)
              }
              className="
                group
                relative
                overflow-hidden
                rounded-2xl
                border
                bg-white
                p-5
                shadow-sm
                transition-all
                duration-300
                hover:shadow-2xl
                hover:-translate-y-1
                hover:border-blue-200
                cursor-pointer
              "
            >
              {/* Gradient Hover Glow (SAME AS SPEAKER CARD) */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 bg-gradient-to-br from-blue-50 via-transparent to-blue-100 pointer-events-none" />

              {/* TOP ROW: IMAGE + NAME */}
              <div className="relative z-10 flex items-center gap-4">
                {/* Profile Image */}
                <div
                  className="
                    relative
                    w-16
                    h-16
                    sm:w-18
                    sm:h-18
                    rounded-full
                    overflow-hidden
                    border-2
                    border-blue-100
                    ring-2
                    ring-transparent
                    group-hover:ring-blue-200
                    transition-all
                    duration-300
                    flex-shrink-0
                    bg-gray-100
                  "
                >
                  <Image
                    src={sp?.speakerProfilePicture || '/avatar.png'}
                    alt={name}
                    fill
                    sizes="64px"
                    className="object-cover object-center group-hover:scale-105 transition duration-300"
                  />
                </div>

                {/* Name + Institute */}
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-[#1F5C9E] leading-tight line-clamp-2">
                    {name}
                  </h3>

                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                    <Building size={16} className="text-gray-400" />
                    <span className="line-clamp-1">
                      {institute}
                    </span>
                  </div>

                  {/* Location */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="line-clamp-1">
                    {location}
                  </span>
                </div>
                </div>
              </div>

              {/* BELOW CONTENT (FULL WIDTH) */}
              <div className="relative z-10 mt-1 space-y-3">

                {/* ROLE BADGE (Since faculty has no stats) */}
                <div className="rounded-lg bg-blue-50 px-3 py-2 text-center transition group-hover:bg-blue-100">
                  <div className="flex items-center justify-center gap-1 text-blue-600">
                    <GraduationCap size={14} />
                    <span className="text-sm font-medium">
                      {title}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

