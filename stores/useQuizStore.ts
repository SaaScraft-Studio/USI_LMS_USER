'use client'

import { create } from 'zustand'
import { persist, StateStorage } from 'zustand/middleware'

/* ================= TYPES ================= */

export type QuizAttempt = {
  userId: string
  quizId: string
  webinarId: string

  started: boolean
  submitted: boolean
  timeExpired: boolean

  currentQuestionIndex: number
  answers: Record<string, string>

  startedAt: number
  expiresAt: number
  submittedAt?: number
}

type QuizStore = {
  attempts: Record<string, QuizAttempt>
}

type QuizStoreActions = {
  startQuiz: (
    userId: string,
    quizId: string,
    webinarId: string,
    totalDurationSeconds: number
  ) => void

  answerQuestion: (
    userId: string,
    quizId: string,
    questionId: string,
    selectedOption: string
  ) => void

  nextQuestion: (userId: string, quizId: string) => void

  submitQuiz: (userId: string, quizId: string) => void

  expireQuiz: (userId: string, quizId: string) => void

  getAttempt: (userId: string, quizId: string) => QuizAttempt | null

  isSubmitted: (userId: string, quizId: string) => boolean

  hasTimeExpired: (userId: string, quizId: string) => boolean

  resetQuiz: (userId: string, quizId: string) => void

  forceRefresh: () => void
}

/* ================= HELPERS ================= */

const getKey = (userId: string, quizId: string) =>
  `${userId}_${quizId}`

/* ================= MIGRATION ================= */

const migrate = (persistedState: any, version: number): QuizStore & QuizStoreActions => {
  if (version === 0) {
    // Initial migration from version 0 to 1
    return {
      ...persistedState,
      attempts: persistedState.attempts || {},
    }
  }
  
  if (version === 1) {
    // Migration from version 1 to 2
    return {
      ...persistedState,
      attempts: persistedState.attempts || {},
    }
  }
  
  if (version === 2) {
    // Migration from version 2 to 3 (adding timeExpired field)
    const attempts = persistedState.attempts || {}
    const migratedAttempts = Object.keys(attempts).reduce((acc, key) => {
      const attempt = attempts[key]
      acc[key] = {
        ...attempt,
        timeExpired: false,
        submittedAt: attempt.submittedAt || undefined,
      }
      return acc
    }, {} as Record<string, any>)
    
    return {
      ...persistedState,
      attempts: migratedAttempts,
    }
  }
  
  // Already at version 3 or above
  return persistedState
}

/* ================= STORE ================= */

export const useQuizStore = create<QuizStore & QuizStoreActions>()(
  persist(
    (set, get) => ({
      attempts: {},

      startQuiz: (userId, quizId, webinarId, totalDurationSeconds) => {
        const key = getKey(userId, quizId)
        const existing = get().attempts[key]

        // Only prevent start if already submitted
        if (existing?.submitted) return

        const now = Date.now()

        set((state) => ({
          attempts: {
            ...state.attempts,
            [key]: {
              userId,
              quizId,
              webinarId,
              started: true,
              submitted: false,
              timeExpired: false,
              currentQuestionIndex: existing?.currentQuestionIndex || 0,
              answers: existing?.answers || {},
              startedAt: existing?.startedAt || now,
              expiresAt: existing?.expiresAt || (now + totalDurationSeconds * 1000),
            },
          },
        }))
      },

      answerQuestion: (userId, quizId, questionId, selectedOption) => {
        const key = getKey(userId, quizId)
        const attempt = get().attempts[key]
        if (!attempt || attempt.submitted || attempt.timeExpired) return

        set((state) => ({
          attempts: {
            ...state.attempts,
            [key]: {
              ...attempt,
              answers: {
                ...attempt.answers,
                [questionId]: selectedOption,
              },
            },
          },
        }))
      },

      nextQuestion: (userId, quizId) => {
        const key = getKey(userId, quizId)
        const attempt = get().attempts[key]
        if (!attempt || attempt.submitted || attempt.timeExpired) return

        set((state) => ({
          attempts: {
            ...state.attempts,
            [key]: {
              ...attempt,
              currentQuestionIndex: attempt.currentQuestionIndex + 1,
            },
          },
        }))
      },

      submitQuiz: (userId, quizId) => {
        const key = getKey(userId, quizId)
        const attempt = get().attempts[key]
        if (!attempt || attempt.submitted) return

        const now = Date.now()

        set((state) => ({
          attempts: {
            ...state.attempts,
            [key]: {
              ...attempt,
              submitted: true,
              submittedAt: now,
            },
          },
        }))
      },

      expireQuiz: (userId, quizId) => {
        const key = getKey(userId, quizId)
        const attempt = get().attempts[key]
        if (!attempt || attempt.submitted) return

        const now = Date.now()

        set((state) => ({
          attempts: {
            ...state.attempts,
            [key]: {
              ...attempt,
              timeExpired: true,
              submitted: true,
              submittedAt: now,
            },
          },
        }))
      },

      getAttempt: (userId, quizId) => {
        const key = getKey(userId, quizId)
        return get().attempts[key] ?? null
      },

      isSubmitted: (userId, quizId) => {
        const key = getKey(userId, quizId)
        const attempt = get().attempts[key]
        return Boolean(attempt?.submitted)
      },

      hasTimeExpired: (userId, quizId) => {
        const key = getKey(userId, quizId)
        const attempt = get().attempts[key]
        if (!attempt) return false
        
        if (attempt.timeExpired) return true
        
        const now = Date.now()
        const isExpired = now > attempt.expiresAt
        
        if (isExpired && !attempt.submitted) {
          setTimeout(() => {
            get().expireQuiz(userId, quizId)
          }, 0)
        }
        
        return isExpired
      },

      resetQuiz: (userId, quizId) => {
        const key = getKey(userId, quizId)
        set((state) => {
          const copy = { ...state.attempts }
          delete copy[key]
          return { attempts: copy }
        })
      },

      forceRefresh: () => {
        // This triggers a re-render by creating a new state object
        set((state) => ({ ...state }))
      },
    }),
    {
      name: 'usi-quiz-attempts',
      version: 3,
      migrate: migrate, // Add migration function
    }
  )
)