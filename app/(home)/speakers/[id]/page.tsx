'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { useAuthStore } from '@/stores/authStore'
import { apiRequest } from '@/lib/apiRequest'
import { toast } from 'sonner'
import { CalendarDays, Clock, Video, MapPin } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import CountdownTimer from '@/components/CountdownTimer'
import SponsorCard from '@/components/SponsorCard'
import SpeakerCard from '@/components/SpeakerCard'

/* ================= ROUTE MAP ================= */

const WEBINAR_ROUTE_MAP: Record<string, string> = {
  'USI Webinar': '/webinar',
  'Smart Learning Program': '/program',
  'Live Operative Workshops': '/workshop',
}

/* ================= PAGE ================= */

export default function SpeakerDetailsPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const router = useRouter()
  const user = useAuthStore((s) => s.user)

  const [loading, setLoading] = useState(true)
  const [speaker, setSpeaker] = useState<any>(null)
  const [topicVideos, setTopicVideos] = useState<any[]>([])
  const [webinars, setWebinars] = useState<any[]>([])

  const [registeredConferenceIds, setRegisteredConferenceIds] = useState<string[]>([])
  const [registeredWebinarIds, setRegisteredWebinarIds] = useState<string[]>([])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [registerType, setRegisterType] = useState<'conference' | 'webinar'>('webinar')
  const [identifier, setIdentifier] = useState('')
  const [submitting, setSubmitting] = useState(false)

  /* ================= FETCH REGISTRATIONS (SAFE FALLBACK) ================= */

  useEffect(() => {
    if (!user?.id) return

    apiRequest({
      endpoint: `/api/conference/registrations/${user.id}`,
      method: 'GET',
    })
      .then((res: any) => {
        const list = Array.isArray(res?.data) ? res.data : []
        setRegisteredConferenceIds(
          list
            .map((c: any) => c?.conference?._id)
            .filter(Boolean)
        )
      })
      .catch(() => setRegisteredConferenceIds([]))

    apiRequest({
      endpoint: `/api/webinar/registrations/${user.id}`,
      method: 'GET',
    })
      .then((res: any) => {
        const list = Array.isArray(res?.data) ? res.data : []
        setRegisteredWebinarIds(
          list
            .map((w: any) => w?.webinar?._id)
            .filter(Boolean)
        )
      })
      .catch(() => setRegisteredWebinarIds([]))
  }, [user?.id])

  /* ================= FETCH SPEAKER DATA (SAFE) ================= */

  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      try {
        const res: any = await apiRequest({
          endpoint: `/api/speakers/${id}/videos`,
          method: 'GET',
        })

        const s = res?.speaker

        // 🛡 SAFE FALLBACK
        setSpeaker(
          s
            ? {
                name: [s?.prefix, s?.speakerName].filter(Boolean).join(' ') || 'Unnamed Speaker',
                photo: s?.speakerProfilePicture || '/avatar.png',
                qualification: s?.affiliation || '—',
                location: [s?.state, s?.country].filter(Boolean).join(', ') || '—',
              }
            : null
        )

        setTopicVideos(Array.isArray(res?.topicVideos) ? res.topicVideos : [])
        setWebinars(Array.isArray(res?.webinarVideos) ? res.webinarVideos : [])
      } catch {
        setSpeaker(null)
        setTopicVideos([])
        setWebinars([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  /* ================= UNIQUE CONFERENCES (SAFE) ================= */

  const conferences = useMemo(() => {
    const map = new Map<string, any>()
    topicVideos.forEach((t: any) => {
      const c = t?.conferenceId
      if (c?._id && !map.has(c._id)) {
        map.set(c._id, c)
      }
    })
    return Array.from(map.values())
  }, [topicVideos])

  /* ================= REGISTER ================= */

  const buildPayload = () => {
    if (/^\d{10}$/.test(identifier)) return { mobile: identifier }
    if (identifier.includes('@')) return { email: identifier }
    return { membershipNumber: identifier }
  }

  const handleRegister = async () => {
    if (!user || !selectedItem?._id) return

    try {
      setSubmitting(true)

      if (registerType === 'conference') {
        await apiRequest({
          endpoint: '/api/conference/register',
          method: 'POST',
          body: {
            conferenceId: selectedItem._id,
            userId: user.id,
            ...buildPayload(),
          },
        })

        toast.success('Conference registered successfully 🎉')
        setRegisteredConferenceIds((prev) =>
          Array.from(new Set([...prev, selectedItem._id]))
        )
      } else {
        await apiRequest({
          endpoint: '/api/webinar/register',
          method: 'POST',
          body: {
            webinarId: selectedItem._id,
            userId: user.id,
            ...buildPayload(),
          },
        })

        toast.success('Webinar registered successfully 🎉')
        setRegisteredWebinarIds((prev) =>
          Array.from(new Set([...prev, selectedItem._id]))
        )
      }

      setDialogOpen(false)
      setIdentifier('')
    } catch (e: any) {
      toast.error(e?.message || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  const getWebinarDetailsUrl = (webinar: any) => {
    const base = WEBINAR_ROUTE_MAP[webinar?.webinarType]
    return base ? `${base}/${webinar._id}` : `/webinar/${webinar?._id}`
  }

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    )
  }

  if (!speaker) {
    return <div className="p-10 text-center">Speaker not found</div>
  }

  /* ================= UI ================= */

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="mb-6 text-sm text-gray-500">
        <Link href="/speakers" className="text-orange-600 font-medium">
          Speakers
        </Link>
        <span className="mx-2">{'>'}</span>
        <span className="font-semibold text-gray-700">{speaker.name}</span>
      </div>

     {/* ================= CENTERED SPEAKER CARD ================= */}
<div className="flex justify-center mb-8">
  <div className="w-full max-w-2xl">
    <SpeakerCard
      speaker={{
        id: id || '',
        name: speaker?.name || 'Unnamed Speaker',
        photo: speaker?.photo || '/avatar.png',
        institute: speaker?.qualification || '—',
        location: speaker?.location || '—',
        // 🛡 SAFE FALLBACK COUNTS (based on API arrays)
        topicVideos: Array.isArray(topicVideos) ? topicVideos.length : 0,
        webinarVideos: Array.isArray(webinars) ? webinars.length : 0,
        totalVideos:
          (Array.isArray(topicVideos) ? topicVideos.length : 0) +
          (Array.isArray(webinars) ? webinars.length : 0),
      }}
    />
  </div>
</div>


      {/* ================= CONFERENCES ================= */}
      {conferences.length > 0 && (
        <>
          <h2 className="mb-4 text-xl font-semibold">Conferences</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {conferences.map((c) => (
              <Card
                key={c?._id}
                className="group p-0 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative h-[220px] w-full">
                  <Image
                    src={c?.image || '/avatar.png'}
                    alt={c?.name || 'Conference'}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <CardContent>
                  <h3 className="font-semibold text-sm line-clamp-2">
                    {c?.name || 'Untitled Conference'}
                  </h3>

                  <div className="mt-2 text-xs text-gray-600 flex items-center gap-2">
                    <CalendarDays size={14} />
                    {c?.startDate} – {c?.endDate}
                  </div>

                  <div className="mt-2 text-xs flex items-center gap-2">
                    {c?.conferenceType === 'Virtual' ? (
                      <>
                        <Video size={14} className="text-blue-600" />
                        <span className="text-blue-600 font-medium">
                          Virtual
                        </span>
                      </>
                    ) : (
                      <>
                        <MapPin size={14} className="text-green-600" />
                        <span className="text-green-600 font-medium">
                          Physical
                        </span>
                      </>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="mb-4">
                  {registeredConferenceIds.includes(c?._id) ? (
                    <Button
                      onClick={() => router.push(`/conference/${c?._id}`)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      View Conference
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        setSelectedItem(c)
                        setRegisterType('conference')
                        setDialogOpen(true)
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      Register Free
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* ================= WEBINARS ================= */}
      {webinars.length > 0 && (
        <>
          <h2 className="mt-10 mb-4 text-xl font-semibold">Programs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {webinars.map((w) => (
              <Card
                key={w?._id}
                className="group p-0 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative h-[220px] w-full">
                  <Image
                    src={w?.image || '/avatar.png'}
                    alt={w?.name || 'Webinar'}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <CardContent>
                  <StatusBadge status={w?.dynamicStatus} />
                  <h3 className="font-semibold text-sm line-clamp-2">
                    {w?.name || 'Untitled Webinar'}
                  </h3>

                  {w?.dynamicStatus === 'Upcoming' && (
                    <CountdownTimer
                      startDate={w?.startDate}
                      startTime={w?.startTime}
                    />
                  )}

                  <div className="mt-2 text-xs text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={14} />
                      {w?.startDate} – {w?.endDate}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      {w?.startTime} – {w?.endTime}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="mb-4">
                  {registeredWebinarIds.includes(w?._id) ? (
                    <Button
                      onClick={() => router.push(getWebinarDetailsUrl(w))}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      View Details
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        setSelectedItem(w)
                        setRegisterType('webinar')
                        setDialogOpen(true)
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      Register Free
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* ================= CENTERED SPONSOR CARD (BOTTOM) ================= */}
      <div className="flex justify-center mt-14">
        <div className="w-full max-w-2xl">
          <SponsorCard />
        </div>
      </div>

      {/* ================= REGISTER DIALOG ================= */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <div className="space-y-4">
            <h2 className="text-center text-lg font-semibold">
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
              onClick={handleRegister}
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </Button>

            <AlertDialogCancel disabled={submitting}>
              Cancel
            </AlertDialogCancel>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
