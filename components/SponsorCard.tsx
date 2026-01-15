'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

const SLIDE_INTERVAL = 10000
const AUTO_RESUME_DELAY = 6000

const CONTENT = [
  {
    headline: 'Accelerating Access to Affordable and Innovative Medicines',
    description:
      'Our latest launches bring innovative solutions to patients worldwide.',
    image: '/1.webp',
  },
  {
    headline: 'Advancing Healthcare Through Science and Technology',
    description:
      'We invest in research to deliver high-quality treatments globally.',
    image: '/2.webp',
  },
  {
    headline: 'Committed to Patient-Centric Innovation',
    description: 'Every solution is designed to improve patient outcomes.',
    image: '/3.webp',
  },
  {
    headline: 'Global Reach with Local Impact',
    description: 'Serving millions with trusted and accessible healthcare.',
    image: '/4.webp',
  },
  {
    headline: 'Shaping the Future of Medicine',
    description: 'Driving sustainable healthcare innovation worldwide.',
    image: '/5.webp',
  },
]

export default function SponsorCard() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [progressKey, setProgressKey] = useState(0)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const resumeRef = useRef<NodeJS.Timeout | null>(null)
  const touchStartX = useRef<number | null>(null)

  const clearTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (resumeRef.current) clearTimeout(resumeRef.current)
  }

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % CONTENT.length)
    setProgressKey((k) => k + 1)
  }

  const userInteracted = (newIndex: number) => {
    clearTimers()
    setPaused(true)
    setIndex(newIndex)
    setProgressKey((k) => k + 1)

    resumeRef.current = setTimeout(() => {
      setPaused(false)
    }, AUTO_RESUME_DELAY)
  }

  useEffect(() => {
    if (paused) return

    timerRef.current = setTimeout(nextSlide, SLIDE_INTERVAL)
    return clearTimers
  }, [index, paused])

  /* Swipe Support */
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        userInteracted((index + 1) % CONTENT.length)
      } else {
        userInteracted((index - 1 + CONTENT.length) % CONTENT.length)
      }
    }

    touchStartX.current = null
  }

  return (
    <div className="sticky top-6">
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="
          relative overflow-hidden
          rounded-2xl bg-white p-6 text-center
          shadow-lg ring-1 ring-gray-200
        "
      >
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-blue-500/10" />

        <p className="mb-2 text-[11px] font-semibold tracking-widest text-gray-500">
          OFFICIAL EDUCATIONAL PARTNER
        </p>

        {/* Logo */}
        <div className="my-4 flex justify-center">
          <Image src="/logo.png" alt="Logo" width={180} height={100} />
        </div>

        {/* Image Slider */}
        <div className="relative h-32 overflow-hidden mb-4 rounded-lg">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {CONTENT.map((item, i) => (
              <div key={i} className="min-w-full flex justify-center">
                <Image
                  src={item.image}
                  alt="images"
                  width={260}
                  height={120}
                  className="object-fit"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Text Slider */}
        <div className="relative h-[90px] overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {CONTENT.map((item, i) => (
              <div key={i} className="min-w-full px-2">
                <h3 className="text-sm font-semibold text-gray-800">
                  {item.headline}
                </h3>
                <p className="mt-2 text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-1 w-full bg-gray-200 rounded overflow-hidden">
          <div
            key={progressKey}
            className="h-full bg-blue-600 animate-progress"
          />
        </div>

        {/* Dots */}
        <div className="mt-3 flex justify-center gap-2">
          {CONTENT.map((_, i) => (
            <button
              key={i}
              onClick={() => userInteracted(i)}
              className={`h-2 w-2 rounded-full ${
                index === i ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* CTA */}
        <a
          href="https://www.drreddys.com"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Explore Our Innovations
        </a>

        <p className="mt-3 text-xs text-gray-400">
          Committed to global healthcare advancement
        </p>
      </div>
    </div>
  )
}
