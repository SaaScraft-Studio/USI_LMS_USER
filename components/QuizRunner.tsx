'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useQuizStore } from '@/stores/useQuizStore'
import { useAuthStore } from '@/stores/authStore'
import { apiRequest } from '@/lib/apiRequest'
import { toast } from 'sonner'
import QuizTimer from '@/components/QuizTimer'
import { useRouter } from 'next/navigation' // Add this import

type QuizQuestion = {
  _id: string
  questionName: string
  options: string[]
}

export default function QuizRunner({
  mode,
  webinarId,
  quiz,
  webinarTitle,
  quizIndex,
  onStart,
}: {
  mode: 'intro' | 'run'
  webinarId?: string
  quiz: {
    _id: string
    quizQuestions: QuizQuestion[]
    quizduration: string
  }
  webinarTitle?: string
  quizIndex?: number
  onStart?: () => void
}) {
  const router = useRouter() // Add router for refresh
  const user = useAuthStore((s) => s.user)
  const {
    startQuiz,
    answerQuestion,
    nextQuestion,
    submitQuiz,
    getAttempt,
    hasTimeExpired,
    expireQuiz,
  } = useQuizStore()

  const totalDuration = Number(quiz.quizduration)
  
  const attempt = user
    ? getAttempt(user.id, quiz._id)
    : null

  const currentIndex = attempt?.currentQuestionIndex ?? 0
  const question = quiz.quizQuestions[currentIndex]
  const isLastQuestion = currentIndex === quiz.quizQuestions.length - 1
  const isTimeExpired = user ? hasTimeExpired(user.id, quiz._id) : false

  const [selectedOption, setSelectedOption] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)

  /* ================= EFFECTS ================= */
  useEffect(() => {
    // Restore selected answer for current question
    if (attempt && question) {
      const savedAnswer = attempt.answers[question._id]
      setSelectedOption(savedAnswer || '')
    }
  }, [attempt, question?._id])

  /* ================= HANDLERS ================= */
  const handleStartQuiz = useCallback(async () => {
    if (!user || !webinarId || quizStarted) return
    
    try {
      setQuizStarted(true)
      
      // Start quiz in store
      startQuiz(
        user.id,
        quiz._id,
        webinarId,
        totalDuration
      )
      
      // Notify parent component
      if (onStart) {
        onStart()
      }
      
      toast.success('Quiz started! Timer is running.')
      
      // Force immediate re-render by updating a state
      setQuizStarted(false)
      setTimeout(() => setQuizStarted(true), 0)
      
    } catch (error) {
      setQuizStarted(false)
      toast.error('Failed to start quiz')
    }
  }, [user, webinarId, quiz._id, totalDuration, startQuiz, onStart, quizStarted])

  const handleOptionChange = useCallback((value: string) => {
    if (isTimeExpired && isLastQuestion) return
    
    setSelectedOption(value)
    if (user && question) {
      answerQuestion(user.id, quiz._id, question._id, value)
    }
  }, [user, quiz._id, question?._id, isTimeExpired, isLastQuestion, answerQuestion])

  const handleSubmit = useCallback(async () => {
    if (!user || submitting) return
    
    setSubmitting(true)
    try {
      // Submit to store
      submitQuiz(user.id, quiz._id)
      
      // Submit to API
      await apiRequest({
        endpoint: `/api/webinars/${webinarId}/quizzes/${quiz._id}/submit`,
        method: 'POST',
        body: {
          userId: user.id,
          answers: Object.entries(attempt?.answers || {}).map(
            ([qid, opt]) => ({
              questionId: qid,
              selectedOption: opt,
            })
          ),
        },
      })
      
      toast.success('Quiz submitted successfully!')
      
      // Force the parent to re-render and show results
      // Multiple strategies to ensure it works:
      
      // 1. Call onStart callback if provided
      if (onStart) {
        onStart()
      }
      
      // 2. Force a small state change
      setTimeout(() => {
        setSubmitting(false)
      }, 100)
      
      // 3. Use router to trigger re-evaluation
      router.refresh()
      
    } catch {
      toast.error('Failed to submit quiz')
      setSubmitting(false)
    }
  }, [user, quiz._id, webinarId, attempt?.answers, submitQuiz, onStart, router, submitting])

  const handleNext = useCallback(() => {
    if (!user || isTimeExpired) return
    
    if (isLastQuestion) {
      handleSubmit()
    } else {
      nextQuestion(user.id, quiz._id)
      setSelectedOption('') // Reset for next question
    }
  }, [user, isTimeExpired, isLastQuestion, handleSubmit, nextQuestion, quiz._id])

  const handleTimeExpire = useCallback(() => {
    if (user && !attempt?.submitted) {
      expireQuiz(user.id, quiz._id)
      toast.error('Time is up! Quiz submitted automatically.')
      
      // Force refresh to show results
      setTimeout(() => {
        router.refresh()
      }, 100)
    }
  }, [user, attempt?.submitted, expireQuiz, quiz._id, router])

  /* ================= INTRO SCREEN ================= */
  if (mode === 'intro') {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">{webinarTitle}</h2>
          <p className="text-lg text-muted-foreground">
            Quiz {quizIndex}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Questions:</span>
              <span className="font-semibold">{quiz.quizQuestions.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Time:</span>
              <span className="font-semibold">{totalDuration} seconds</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Instructions:</span>
              <span className="font-semibold text-sm">No going back to previous questions</span>
            </div>
          </div>
          
          <Button
            className="w-full h-12 text-lg"
            onClick={handleStartQuiz}
            disabled={quizStarted || !user}
          >
            {quizStarted ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Starting Quiz...
              </span>
            ) : (
              'START QUIZ NOW'
            )}
          </Button>
          
          <p className="text-sm text-muted-foreground text-center">
            Timer will start immediately when you begin
          </p>
        </CardContent>
      </Card>
    )
  }

  /* ================= RENDER QUIZ ================= */
  if (!attempt || !question) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Loading quiz...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* TIMER */}
      <QuizTimer 
        expiresAt={attempt.expiresAt} 
        onTimeExpire={handleTimeExpire}
      />

      {/* QUIZ CARD */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-lg font-semibold">
                Question {currentIndex + 1} of {quiz.quizQuestions.length}
              </span>
            </div>
            <div className={`text-sm font-medium ${isTimeExpired ? 'text-destructive' : 'text-muted-foreground'}`}>
              {isTimeExpired ? 'Time Expired' : 'Time Active'}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-8">
          {/* QUESTION */}
          <div>
            <h3 className="text-xl font-semibold mb-2">Question:</h3>
            <p className="text-lg">{question.questionName}</p>
          </div>

          {/* OPTIONS */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Options:</h3>
            <RadioGroup
              value={selectedOption}
              onValueChange={handleOptionChange}
              disabled={isTimeExpired && isLastQuestion}
              className="space-y-3"
            >
              {question.options.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-4 rounded-lg border ${
                    selectedOption === option
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200'
                  } ${
                    isTimeExpired && isLastQuestion
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer hover:bg-gray-50'
                  }`}
                >
                  <RadioGroupItem 
                    value={option} 
                    id={`option-${index}`}
                    disabled={isTimeExpired && isLastQuestion}
                  />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex-1 cursor-pointer text-lg"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            
            {isTimeExpired && isLastQuestion && (
              <p className="text-sm text-destructive mt-2">
                Time is over. Radio selection is disabled.
              </p>
            )}
          </div>

          {/* NAVIGATION BUTTONS */}
          <div className="flex justify-between pt-4 border-t">
            {/* Left side - Next button (hidden on last question) */}
            <div>
              {!isLastQuestion && (
                <Button
                  onClick={handleNext}
                  disabled={isTimeExpired}
                  variant="outline"
                  className="min-w-[120px]"
                >
                  Next Question →
                </Button>
              )}
            </div>

            {/* Right side - Submit button */}
            <div>
              <Button
                onClick={handleSubmit}
                disabled={isTimeExpired || submitting}
                className="min-w-[120px] bg-green-600 hover:bg-green-700"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Submitting...
                  </span>
                ) : (
                  'Submit Quiz'
                )}
              </Button>
            </div>
          </div>

          {/* LAST QUESTION NOTE */}
          {isLastQuestion && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 font-medium">
                ⓘ This is the last question. After submitting, you cannot go back.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}