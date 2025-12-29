'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Clock } from 'lucide-react'

interface QuizTimerProps {
  expiresAt: number
  onTimeExpire?: () => void
}

export default function QuizTimer({ expiresAt, onTimeExpire }: QuizTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now()
      const remaining = Math.max(0, expiresAt - now)
      
      setTimeLeft(Math.floor(remaining / 1000))
      
      if (remaining <= 0 && !isExpired) {
        setIsExpired(true)
        if (onTimeExpire) onTimeExpire()
      }
    }

    // Update immediately
    updateTimer()

    // Update every second
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [expiresAt, isExpired, onTimeExpire])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getTimeColor = () => {
    if (timeLeft < 60) return 'text-red-600'
    if (timeLeft < 300) return 'text-amber-600'
    return 'text-green-600'
  }

  return (
    <Card className="border-destructive/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">Time Remaining</span>
          </div>
          <div className={`text-lg font-bold ${getTimeColor()}`}>
            {isExpired ? '00:00' : formatTime(timeLeft)}
          </div>
        </div>
        {isExpired && (
          <p className="text-xs text-destructive mt-2 text-center">
            Time's up! Quiz will be submitted automatically.
          </p>
        )}
      </CardContent>
    </Card>
  )
}