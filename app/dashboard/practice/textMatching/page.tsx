'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { LanguagesIcon, CheckCircle, XCircle, RotateCcw, Trophy } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { SiteHeader } from "@/components/sidebar/site-header"

interface WordPair {
  id: number
  english: string
  telugu: string
  category: string
}

interface Match {
  englishId: number
  teluguId: number
  isCorrect: boolean
}

const wordPairs: WordPair[] = [
  { id: 1, english: "Hello", telugu: "నమస్కారం", category: "Greetings" },
  { id: 2, english: "Thank you", telugu: "ధన్యవాదాలు", category: "Greetings" },
  { id: 3, english: "Water", telugu: "నీరు", category: "Basic Needs" },
  { id: 4, english: "Food", telugu: "ఆహారం", category: "Basic Needs" },
  { id: 5, english: "House", telugu: "ఇల్లు", category: "Places" },
  { id: 6, english: "School", telugu: "పాఠశాల", category: "Places" },
  { id: 7, english: "Mother", telugu: "అమ్మ", category: "Family" },
  { id: 8, english: "Father", telugu: "నాన్న", category: "Family" },
  { id: 9, english: "Book", telugu: "పుస్తకం", category: "Objects" },
  { id: 10, english: "Sun", telugu: "సూర్యుడు", category: "Nature" }
]

export default function TextMatching() {
  const [currentLevel, setCurrentLevel] = useState(1)
  const [currentPairs, setCurrentPairs] = useState<WordPair[]>([])
  const [shuffledEnglish, setShuffledEnglish] = useState<WordPair[]>([])
  const [shuffledTelugu, setShuffledTelugu] = useState<WordPair[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [selectedEnglish, setSelectedEnglish] = useState<number | null>(null)
  const [selectedTelugu, setSelectedTelugu] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [totalAttempts, setTotalAttempts] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showResult, setShowResult] = useState(false)

  const wordsPerLevel = 4

  useEffect(() => {
    initializeLevel()
  }, [currentLevel])

  const initializeLevel = () => {
    const startIndex = (currentLevel - 1) * wordsPerLevel
    const levelPairs = wordPairs.slice(startIndex, startIndex + wordsPerLevel)
    
    setCurrentPairs(levelPairs)
    setShuffledEnglish([...levelPairs].sort(() => Math.random() - 0.5))
    setShuffledTelugu([...levelPairs].sort(() => Math.random() - 0.5))
    setMatches([])
    setSelectedEnglish(null)
    setSelectedTelugu(null)
    setIsCompleted(false)
    setShowResult(false)
  }

  const handleEnglishClick = (id: number) => {
    if (matches.find(m => m.englishId === id)) return
    setSelectedEnglish(selectedEnglish === id ? null : id)
  }

  const handleTeluguClick = (id: number) => {
    if (matches.find(m => m.teluguId === id)) return
    
    if (selectedEnglish !== null) {
      const isCorrect = selectedEnglish === id
      const newMatch: Match = {
        englishId: selectedEnglish,
        teluguId: id,
        isCorrect
      }
      
      setMatches([...matches, newMatch])
      setTotalAttempts(totalAttempts + 1)
      
      if (isCorrect) {
        setScore(score + 1)
      }
      
      setSelectedEnglish(null)
      setSelectedTelugu(null)
      
      // Check if level is completed
      if (matches.length + 1 === currentPairs.length) {
        setIsCompleted(true)
        setShowResult(true)
      }
    } else {
      setSelectedTelugu(selectedTelugu === id ? null : id)
    }
  }

  const getWordStatus = (id: number, type: 'english' | 'telugu') => {
    const match = matches.find(m => 
      type === 'english' ? m.englishId === id : m.teluguId === id
    )
    
    if (match) {
      return match.isCorrect ? 'correct' : 'incorrect'
    }
    
    if (type === 'english' && selectedEnglish === id) return 'selected'
    if (type === 'telugu' && selectedTelugu === id) return 'selected'
    
    return 'default'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'correct': return 'bg-green-100 border-green-500 text-green-800'
      case 'incorrect': return 'bg-red-100 border-red-500 text-red-800'
      case 'selected': return 'bg-blue-100 border-blue-500 text-blue-800'
      default: return 'bg-white hover:bg-gray-50 border-gray-200'
    }
  }

  const nextLevel = () => {
    if (currentLevel < Math.ceil(wordPairs.length / wordsPerLevel)) {
      setCurrentLevel(currentLevel + 1)
    }
  }

  const resetGame = () => {
    setCurrentLevel(1)
    setScore(0)
    setTotalAttempts(0)
  }

  const accuracy = totalAttempts > 0 ? Math.round((score / totalAttempts) * 100) : 0

  return (
    <div className="sticky top-0 w-full h-full flex flex-col shadow-md md:rounded-s-[inherit] min-[1024px]:rounded-e-3xl bg-background">
      {/* Header */}
      <div className="py-5 sticky bg-background top-0 z-10 px-4 md:px-6 lg:px-8 before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-gradient-to-r before:from-black/[0.06] before:via-black/10 before:to-black/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SiteHeader />
            <LanguagesIcon className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Text Matching</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto px-4 md:px-6 lg:px-8 py-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Stats */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    Level {currentLevel}
                  </Badge>
                  <span className="text-sm font-medium text-gray-700">
                    Score: {score}/{totalAttempts}
                  </span>
                  {totalAttempts > 0 && (
                    <Badge variant={accuracy >= 80 ? "default" : "secondary"}>
                      {accuracy}% Accuracy
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetGame}
                  className="text-xs"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Reset
                </Button>
              </div>
              <Progress 
                value={(matches.length / currentPairs.length) * 100} 
                className="h-2" 
              />
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="border-0 shadow-lg bg-blue-50/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="text-sm text-blue-800 text-center">
                Click an English word, then click its Telugu translation to match them.
              </p>
            </CardContent>
          </Card>

          {/* Matching Game */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* English Words */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-center text-gray-800 flex items-center justify-center gap-2">
                  <span className="text-blue-600">🇺🇸</span>
                  English
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {shuffledEnglish.map((word) => {
                    const status = getWordStatus(word.id, 'english')
                    return (
                      <motion.button
                        key={word.id}
                        onClick={() => handleEnglishClick(word.id)}
                        className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left font-medium ${getStatusColor(status)}`}
                        whileHover={{ scale: status === 'default' ? 1.02 : 1 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={matches.find(m => m.englishId === word.id) !== undefined}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-lg">{word.english}</span>
                          {status === 'correct' && <CheckCircle className="w-5 h-5 text-green-600" />}
                          {status === 'incorrect' && <XCircle className="w-5 h-5 text-red-600" />}
                        </div>
                        <span className="text-xs text-gray-500">{word.category}</span>
                      </motion.button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Telugu Words */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-center text-gray-800 flex items-center justify-center gap-2">
                  <span className="text-orange-600">🇮🇳</span>
                  Telugu
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {shuffledTelugu.map((word) => {
                    const status = getWordStatus(word.id, 'telugu')
                    return (
                      <motion.button
                        key={word.id}
                        onClick={() => handleTeluguClick(word.id)}
                        className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left font-medium ${getStatusColor(status)}`}
                        whileHover={{ scale: status === 'default' ? 1.02 : 1 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={matches.find(m => m.teluguId === word.id) !== undefined}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-lg">{word.telugu}</span>
                          {status === 'correct' && <CheckCircle className="w-5 h-5 text-green-600" />}
                          {status === 'incorrect' && <XCircle className="w-5 h-5 text-red-600" />}
                        </div>
                        <span className="text-xs text-gray-500">{word.category}</span>
                      </motion.button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <AnimatePresence>
            {showResult && isCompleted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-center text-gray-800 flex items-center justify-center gap-2">
                      <Trophy className="w-6 h-6 text-yellow-600" />
                      Level Complete!
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{score}</p>
                        <p className="text-sm text-gray-600">Correct</p>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{totalAttempts - score}</p>
                        <p className="text-sm text-gray-600">Incorrect</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{accuracy}%</p>
                        <p className="text-sm text-gray-600">Accuracy</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 justify-center pt-4">
                      {currentLevel < Math.ceil(wordPairs.length / wordsPerLevel) && (
                        <Button
                          onClick={nextLevel}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg"
                        >
                          Next Level
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        onClick={initializeLevel}
                        className="px-8 py-3 rounded-xl"
                      >
                        Try Again
                      </Button>
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
