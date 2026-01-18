'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DOMPurify from 'dompurify'
import { useAuthStore } from '@/stores/authStore'
import SponsorCard from '@/components/SponsorCard'
import getPaginationPages from '@/utils/getPaginationPages'

const COMMENTS_LIMIT = 50

export default function TopicDetailPage() {
  const router = useRouter()
  const { id: conferenceId, topicId } = useParams<{
    id: string
    topicId: string
  }>()

  const { user } = useAuthStore()

  const [topic, setTopic] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [totalComments, setTotalComments] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] =
    useState<'overview' | 'faculty'>('overview')
  const [commentText, setCommentText] = useState('')
  const [posting, setPosting] = useState(false)

  const totalPages = Math.ceil(totalComments / COMMENTS_LIMIT)

  /* ================= FETCH TOPIC ================= */

  useEffect(() => {
    if (!topicId) return

    const fetchTopic = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/topics/${topicId}`
      )
      const json = await res.json()
      setTopic(json.data)
      setLoading(false)
    }

    fetchTopic()
  }, [topicId])

  /* ================= FETCH COMMENTS ================= */

  const fetchComments = async (pageNo = 1) => {
    if (!topic) return

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/conferences/${conferenceId}/sessions/${topic.sessionId._id}/topics/${topic._id}/comments?page=${pageNo}&limit=${COMMENTS_LIMIT}`
    )

    const json = await res.json()
    setTotalComments(json.total || 0)
    setComments(pageNo === 1 ? json.data : [...json.data])
  }

  useEffect(() => {
    if (topic) fetchComments(1)
  }, [topic])

  /* ================= POST COMMENT ================= */

  const handlePostComment = async () => {
    if (!commentText.trim() || !user || !topic) return

    setPosting(true)

    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/conferences/${conferenceId}/sessions/${topic.sessionId._id}/topics/${topic._id}/comments`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          userId: user.id,
          comment: commentText,
        }),
      }
    )

    setCommentText('')
    setPage(1)
    await fetchComments(1)
    setPosting(false)
  }

  if (loading || !topic) {
    return (
      <div className="max-w-5xl mx-auto p-6 animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-10 bg-gray-200 rounded w-2/3" />
        <div className="h-64 bg-gray-200 rounded-xl" />
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
          <div className="flex gap-2 border-b">
            {['overview', 'faculty'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 font-semibold rounded-t-lg text-sm ${
                  activeTab === tab
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab === 'overview' ? 'Overview' : 'Faculty'}
              </button>
            ))}
          </div>

          {/* ===== OVERVIEW ===== */}
          {activeTab === 'overview' && (
            <div className="bg-white rounded-2xl border p-6 space-y-6">
              <div
                className="prose max-w-none"
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
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg text-sm"
                >
                  {posting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>

              {/* COMMENTS */}
              <div className="space-y-4">
                {comments.map((c) => (
                  <div key={c._id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={c.userId.profilePicture}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold">
                          {c.userId.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(c.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-sm">{c.comment}</p>
                  </div>
                ))}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-4">
                  {getPaginationPages(page, totalPages).map((p, i) =>
                    p === 'dots' ? (
                      <span key={i} className="px-3 py-1 text-gray-500">
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
          )}

          {/* ===== FACULTY ===== */}
          {activeTab === 'faculty' && (
            <div className="bg-white rounded-2xl border p-6 space-y-8">
              {topic.topicType === 'Presentation' &&
                topic.speakerId?.length === 1 && (
                  <FacultySection
                    title="Presenter Name"
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

/* ================= FACULTY SECTION ================= */

function FacultySection({ title, data }: any) {
  const router = useRouter()

  return (
    <div>
      <h3 className="font-semibold mb-4">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.map((sp: any) => (
          <div
            key={sp._id}
            onClick={() => router.push(`/speakers/${sp._id}`)}
            className="cursor-pointer border rounded-xl p-4 text-center hover:shadow transition"
          >
            <img
              src={sp.speakerProfilePicture}
              className="w-20 h-20 mx-auto rounded-full object-cover"
            />
            <p className="mt-2 font-semibold">
              {sp.prefix} {sp.speakerName}
            </p>
            <p className="text-xs text-gray-600">{sp.affiliation}</p>
            <p className="text-xs text-gray-500">{sp.country}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
