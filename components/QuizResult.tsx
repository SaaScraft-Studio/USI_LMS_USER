'use client'

import { useEffect, useState } from 'react'
import { apiRequest } from '@/lib/apiRequest'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { CheckCircle, XCircle, Circle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

type QuizQuestion = {
  _id: string
  questionName: string
  options: string[]
  correctAnswer: string
}

type QuizResultItem = {
  questionId: string
  questionName: string
  selectedOption: string
  correctAnswer: string
  isCorrect: boolean
}

type QuizData = {
  quizId: string
  totalQuestions: number
  correctAnswers: number
  scorePercentage: number
  result: QuizResultItem[]
}

type QuizWithQuestions = {
  _id: string
  quizQuestions: QuizQuestion[]
}

export default function QuizResult({ quizId }: { quizId: string }) {
  const [resultData, setResultData] = useState<QuizData | null>(null)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both result and quiz questions in parallel
        const [resultRes, quizRes] = await Promise.all([
          apiRequest({
            endpoint: `/api/quizzes/${quizId}/result`,
            method: 'GET',
          }),
          apiRequest({
            endpoint: `/api/quizzes/${quizId}`,
            method: 'GET',
          })
        ])

        setResultData(resultRes.data)
        setQuizQuestions(quizRes.data?.quizQuestions || [])
      } catch (error) {
        console.error('Failed to fetch quiz result:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [quizId])

  if (loading) {
    return <Skeleton className="h-96 w-full" />
  }

  if (!resultData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Result not available yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  const { correctAnswers, totalQuestions, scorePercentage, result } = resultData
  
  // Data for pie chart
  const pieData = [
    { name: 'Correct', value: correctAnswers, color: '#10b981' },
    { name: 'Incorrect', value: totalQuestions - correctAnswers, color: '#ef4444' }
  ]

  // Function to get options for a specific question
  const getQuestionOptions = (questionId: string) => {
    const question = quizQuestions.find(q => q._id === questionId)
    return question?.options || []
  }

  // Function to get full question details
  const getQuestionDetails = (questionId: string) => {
    return quizQuestions.find(q => q._id === questionId)
  }

  return (
    <div className="space-y-6">
      {/* SCORE SUMMARY */}
      <Card className="border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Quiz Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pie Chart */}
            <div className="md:col-span-1">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Score Stats */}
            <div className="md:col-span-2 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-4xl font-bold text-green-700">
                      {correctAnswers}
                    </div>
                    <div className="text-green-600">Correct Answers</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-4xl font-bold text-red-700">
                      {totalQuestions - correctAnswers}
                    </div>
                    <div className="text-red-600">Incorrect Answers</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Questions:</span>
                      <span className="font-semibold">{totalQuestions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Your Score:</span>
                      <span className="font-semibold">{correctAnswers}/{totalQuestions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Percentage:</span>
                      <span className="font-semibold text-2xl text-primary">
                        {scorePercentage}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className={`font-semibold ${
                        scorePercentage >= 70 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {scorePercentage >= 70 ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DETAILED RESULTS */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {result.map((r: QuizResultItem, index: number) => {
            const options = getQuestionOptions(r.questionId)
            const questionDetails = getQuestionDetails(r.questionId)
            
            return (
              <Card 
                key={r.questionId} 
                className={`border ${r.isCorrect ? 'border-green-200' : 'border-red-200'}`}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Question {index + 1}</span>
                      {r.isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      r.isCorrect 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {r.isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  
                  {/* QUESTION TEXT */}
                  <div className="mb-4">
                    <p className="font-medium text-lg mb-2">Question:</p>
                    <p className="text-gray-700 text-lg">{r.questionName}</p>
                  </div>
                  
                  {/* OPTIONS AS RADIO GROUP (READ-ONLY) */}
                  {options.length > 0 && (
                    <div className="mb-6">
                      <p className="font-medium text-lg mb-3">Options:</p>
                      <RadioGroup value={r.selectedOption} className="space-y-3">
                        {options.map((option: string, optIndex: number) => {
                          const isSelected = option === r.selectedOption
                          const isCorrect = option === r.correctAnswer
                          
                          let bgClass = 'bg-gray-50 border-gray-200'
                          let textClass = 'text-gray-700'
                          
                          if (isSelected && isCorrect) {
                            bgClass = 'bg-green-50 border-green-300'
                            textClass = 'text-green-700'
                          } else if (isSelected && !isCorrect) {
                            bgClass = 'bg-red-50 border-red-300'
                            textClass = 'text-red-700'
                          } else if (isCorrect) {
                            bgClass = 'bg-blue-50 border-blue-300'
                            textClass = 'text-blue-700'
                          }
                          
                          return (
                            <div
                              key={optIndex}
                              className={`flex items-center space-x-3 p-4 rounded-lg border ${bgClass}`}
                            >
                              <div className="flex items-center space-x-3">
                                {isSelected ? (
                                  <div className={`h-4 w-4 rounded-full border-4 ${
                                    isCorrect 
                                      ? 'border-green-600 bg-green-100' 
                                      : 'border-red-600 bg-red-100'
                                  }`} />
                                ) : (
                                  <Circle className={`h-4 w-4 ${
                                    isCorrect ? 'text-blue-600' : 'text-gray-400'
                                  }`} />
                                )}
                                <Label className={`flex-1 cursor-default text-lg ${textClass}`}>
                                  {String.fromCharCode(65 + optIndex)}. {option}
                                </Label>
                              </div>
                              <div className="flex gap-2">
                                {isSelected && (
                                  <Badge variant="outline" className="text-xs">
                                    Your Choice
                                  </Badge>
                                )}
                                {isCorrect && (
                                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 text-xs">
                                    Correct Answer
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </RadioGroup>
                    </div>
                  )}
                  
                  {/* ANSWER SUMMARY */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg ${
                      r.isCorrect 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <p className="font-medium mb-2">Your Answer:</p>
                      <div className="flex items-center gap-2">
                        <p className={`text-lg font-semibold ${
                          r.isCorrect ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {r.selectedOption || 'Not Answered'}
                        </p>
                        {!r.selectedOption && (
                          <Badge variant="outline" className="text-xs">
                            Skipped
                          </Badge>
                        )}
                      </div>
                      {!r.selectedOption && (
                        <p className="text-sm text-gray-500 mt-1">You skipped this question</p>
                      )}
                    </div>
                    
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <p className="font-medium mb-2">Correct Answer:</p>
                      <p className="text-lg text-blue-700 font-semibold">{r.correctAnswer}</p>
                    </div>
                  </div>
                  
                </CardContent>
              </Card>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}