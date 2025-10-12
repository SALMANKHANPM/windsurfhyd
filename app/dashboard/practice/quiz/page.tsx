'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { PenBoxIcon, CheckCircle, XCircle, RotateCcw, Clock, Trophy, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { SiteHeader } from "@/components/sidebar/site-header"

interface QuizQuestion {
  id: number
  question: string
  type: 'translate_to_telugu' | 'translate_to_english' | 'multiple_choice' | 'fill_blank'
  options: string[]
  correctAnswer: number
  explanation?: string
  category: string
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "What is the Telugu word for 'Hello'?",
    type: 'multiple_choice',
    options: ["నమస్కారం", "ధన్యవాదాలు", "వీడ్కోలు", "క్షమించండి"],
    correctAnswer: 0,
    explanation: "నమస్కారం is the common greeting in Telugu, similar to 'Hello' in English.",
    category: "Greetings"
  },
  {
    id: 2,
    question: "How do you say 'Thank you' in Telugu?",
    type: 'multiple_choice',
    options: ["నమస్కారం", "ధన్యవాదాలు", "క్షమించండి", "మీరు ఎలా ఉన్నారు"],
    correctAnswer: 1,
    explanation: "ధన్యవాదాలు means 'Thank you' and is used to express gratitude.",
    category: "Greetings"
  },
  {
    id: 3,
    question: "What does 'నీరు' mean in English?",
    type: 'multiple_choice',
    options: ["Food", "Water", "House", "Book"],
    correctAnswer: 1,
    explanation: "నీరు means 'Water' - an essential word for basic needs.",
    category: "Basic Needs"
  },
  {
    id: 4,
    question: "Choose the Telugu word for 'Mother':",
    type: 'multiple_choice',
    options: ["నాన్న", "అమ్మ", "అన్న", "చెల్లి"],
    correctAnswer: 1,
    explanation: "అమ్మ means 'Mother' in Telugu. నాన్న means 'Father'.",
    category: "Family"
  },
  {
    id: 5,
    question: "What is 'పాఠశాల' in English?",
    type: 'multiple_choice',
    options: ["Hospital", "School", "Market", "Temple"],
    correctAnswer: 1,
    explanation: "పాఠశాల means 'School' - a place of learning.",
    category: "Places"
  },
  {
    id: 6,
    question: "Fill in the blank: 'Good morning' in Telugu is '_______'",
    type: 'multiple_choice',
    options: ["శుభరాత్రి", "శుభోదయం", "శుభ సాయంత్రం", "నమస్కారం"],
    correctAnswer: 1,
    explanation: "శుభోదయం means 'Good morning'. శుభరాత్రి means 'Good night'.",
    category: "Greetings"
  },
  {
    id: 7,
    question: "What does 'ఆహారం' mean?",
    type: 'multiple_choice',
    options: ["Water", "Food", "Clothes", "Money"],
    correctAnswer: 1,
    explanation: "ఆహారం means 'Food' - another essential word for daily life.",
    category: "Basic Needs"
  },
  {
    id: 8,
    question: "Choose the correct Telugu word for 'Sun':",
    type: 'multiple_choice',
    options: ["చంద్రుడు", "సూర్యుడు", "నక్షత్రం", "మేఘం"],
    correctAnswer: 1,
    explanation: "సూర్యుడు means 'Sun'. చంద్రుడు means 'Moon'.",
    category: "Nature"
  }
]

export default function Quiz() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>(new Array(quizQuestions.length).fill(false))
  const [userAnswers, setUserAnswers] = useState<number[]>(new Array(quizQuestions.length).fill(-1))
  const [timeLeft, setTimeLeft] = useState(30)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  const currentQuestion = quizQuestions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100

  useEffect(() => {
    if (timeLeft > 0 && !showResult && !quizCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !showResult) {
      handleTimeUp()
    }
  }, [timeLeft, showResult, quizCompleted])

  const handleTimeUp = () => {
    if (selectedAnswer !== null) {
      submitAnswer()
    } else {
      // Auto-submit with no answer
      const newAnsweredQuestions = [...answeredQuestions]
      const newUserAnswers = [...userAnswers]
      newAnsweredQuestions[currentQuestionIndex] = true
      newUserAnswers[currentQuestionIndex] = -1
      setAnsweredQuestions(newAnsweredQuestions)
      setUserAnswers(newUserAnswers)
      setShowResult(true)
    }
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (!showResult) {
      setSelectedAnswer(answerIndex)
    }
  }

  const submitAnswer = () => {
    if (selectedAnswer === null) return

    const newAnsweredQuestions = [...answeredQuestions]
    const newUserAnswers = [...userAnswers]
    
    newAnsweredQuestions[currentQuestionIndex] = true
    newUserAnswers[currentQuestionIndex] = selectedAnswer
    
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore(score + 1)
    }
    
    setAnsweredQuestions(newAnsweredQuestions)
    setUserAnswers(newUserAnswers)
    setShowResult(true)
    setShowExplanation(true)
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setShowResult(false)
      setShowExplanation(false)
      setTimeLeft(30)
    } else {
      setQuizCompleted(true)
    }
  }

  const resetQuiz = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setAnsweredQuestions(new Array(quizQuestions.length).fill(false))
    setUserAnswers(new Array(quizQuestions.length).fill(-1))
    setTimeLeft(30)
    setQuizCompleted(false)
    setShowExplanation(false)
  }

  const getOptionStyle = (index: number) => {
    if (!showResult) {
      return selectedAnswer === index 
        ? 'bg-blue-100 border-blue-500 text-blue-800' 
        : 'bg-white hover:bg-gray-50 border-gray-200'
    }
    
    if (index === currentQuestion.correctAnswer) {
      return 'bg-green-100 border-green-500 text-green-800'
    }
    
    if (selectedAnswer === index && index !== currentQuestion.correctAnswer) {
      return 'bg-red-100 border-red-500 text-red-800'
    }
    
    return 'bg-gray-50 border-gray-200 text-gray-600'
  }

  const accuracy = answeredQuestions.filter(Boolean).length > 0 
    ? Math.round((score / answeredQuestions.filter(Boolean).length) * 100) 
    : 0

  if (quizCompleted) {
    return (
      <div className="sticky top-0 w-full h-full flex flex-col shadow-md md:rounded-s-[inherit] min-[1024px]:rounded-e-3xl bg-background">
        {/* Header */}
        <div className="py-5 sticky bg-background top-0 z-10 px-4 md:px-6 lg:px-8 before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-gradient-to-r before:from-black/[0.06] before:via-black/10 before:to-black/[0.06]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SiteHeader />
              <Trophy className="h-6 w-6 text-yellow-600" />
              <h1 className="text-xl font-semibold">Quiz Complete!</h1>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-auto px-4 md:px-6 lg:px-8 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-center text-gray-800 flex items-center justify-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                  Final Results
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 text-center space-y-6">
                <div className="grid grid-cols-3 gap-6">
                  <div className="p-6 bg-blue-50 rounded-xl">
                    <p className="text-3xl font-bold text-blue-600">{score}</p>
                    <p className="text-sm text-gray-600">Correct Answers</p>
                  </div>
                  <div className="p-6 bg-red-50 rounded-xl">
                    <p className="text-3xl font-bold text-red-600">{quizQuestions.length - score}</p>
                    <p className="text-sm text-gray-600">Incorrect</p>
                  </div>
                  <div className="p-6 bg-green-50 rounded-xl">
                    <p className="text-3xl font-bold text-green-600">{accuracy}%</p>
                    <p className="text-sm text-gray-600">Accuracy</p>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={resetQuiz}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg"
                  >
                    Take Quiz Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="sticky top-0 w-full h-full flex flex-col shadow-md md:rounded-s-[inherit] min-[1024px]:rounded-e-3xl bg-background">
      {/* Header */}
      <div className="py-5 sticky bg-background top-0 z-10 px-4 md:px-6 lg:px-8 before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-gradient-to-r before:from-black/[0.06] before:via-black/10 before:to-black/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SiteHeader />
            <PenBoxIcon className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Telugu Quiz</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto px-4 md:px-6 lg:px-8 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Progress & Stats */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    Question {currentQuestionIndex + 1} of {quizQuestions.length}
                  </Badge>
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    {currentQuestion.category}
                  </Badge>
                  <span className="text-sm font-medium text-gray-700">
                    Score: {score}/{answeredQuestions.filter(Boolean).length}
                  </span>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span className={`text-sm font-medium ${timeLeft <= 10 ? 'text-red-600' : 'text-gray-700'}`}>
                      {timeLeft}s
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetQuiz}
                  className="text-xs"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Reset
                </Button>
              </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>

          {/* Question */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-center text-gray-800 text-xl">
                {currentQuestion.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left font-medium ${getOptionStyle(index)}`}
                    whileHover={{ scale: !showResult ? 1.02 : 1 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={showResult}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{option}</span>
                      {showResult && index === currentQuestion.correctAnswer && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                      {showResult && selectedAnswer === index && index !== currentQuestion.correctAnswer && (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4 mt-6">
                {!showResult ? (
                  <Button
                    onClick={submitAnswer}
                    disabled={selectedAnswer === null}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl shadow-lg"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <Button
                    onClick={nextQuestion}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl shadow-lg"
                  >
                    {currentQuestionIndex < quizQuestions.length - 1 ? (
                      <>
                        Next Question
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      'View Results'
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Explanation */}
          <AnimatePresence>
            {showExplanation && currentQuestion.explanation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="border-0 shadow-lg bg-blue-50/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-bold text-sm">💡</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-800 mb-2">Explanation</h4>
                        <p className="text-blue-700">{currentQuestion.explanation}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
