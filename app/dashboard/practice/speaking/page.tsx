'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { MicVocal, Volume2, Mic, MicOff, RotateCcw, Trophy, Play, Pause, MessageCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { SiteHeader } from "@/components/sidebar/site-header"

interface SpeakingExercise {
  id: number
  type: 'pronunciation' | 'conversation' | 'repeat_after_me'
  title: string
  description: string
  content: {
    text: string
    telugu?: string
    audio?: string
  }[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: string
}

const speakingExercises: SpeakingExercise[] = [
  {
    id: 1,
    type: 'pronunciation',
    title: 'Basic Greetings',
    description: 'Practice common Telugu greetings',
    content: [
      { text: "Hello", telugu: "నమస్కారం" },
      { text: "Good morning", telugu: "శుభోదయం" },
      { text: "Good evening", telugu: "శుభ సాయంత్రం" },
      { text: "Good night", telugu: "శుభరాత్రి" }
    ],
    difficulty: 'beginner',
    category: 'Greetings'
  },
  {
    id: 2,
    type: 'conversation',
    title: 'Introducing Yourself',
    description: 'Learn to introduce yourself in Telugu',
    content: [
      { text: "My name is...", telugu: "నా పేరు..." },
      { text: "I am from...", telugu: "నేను... నుండి వచ్చాను" },
      { text: "Nice to meet you", telugu: "మిమ్మల్ని కలవడం ఆనందంగా ఉంది" },
      { text: "How are you?", telugu: "మీరు ఎలా ఉన్నారు?" }
    ],
    difficulty: 'beginner',
    category: 'Introduction'
  },
  {
    id: 3,
    type: 'repeat_after_me',
    title: 'Family Members',
    description: 'Practice family relationship words',
    content: [
      { text: "Mother", telugu: "అమ్మ" },
      { text: "Father", telugu: "నాన్న" },
      { text: "Brother", telugu: "అన్న / తమ్ముడు" },
      { text: "Sister", telugu: "అక్క / చెల్లి" }
    ],
    difficulty: 'beginner',
    category: 'Family'
  },
  {
    id: 4,
    type: 'conversation',
    title: 'At the Market',
    description: 'Shopping conversation practice',
    content: [
      { text: "How much does this cost?", telugu: "ఇది ఎంత?" },
      { text: "Can you reduce the price?", telugu: "దామం తగ్గించగలరా?" },
      { text: "I want to buy this", telugu: "నేను దీన్ని కొనాలనుకుంటున్నాను" },
      { text: "Thank you", telugu: "ధన్యవాదాలు" }
    ],
    difficulty: 'intermediate',
    category: 'Shopping'
  }
]

export default function Speaking() {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  const [waveformData, setWaveformData] = useState<number[]>(new Array(32).fill(0))
  const [score, setScore] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [feedback, setFeedback] = useState<string>('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [exerciseCompleted, setExerciseCompleted] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const currentExercise = speakingExercises[currentExerciseIndex]
  const currentItem = currentExercise.content[currentItemIndex]
  const progress = ((currentItemIndex + 1) / currentExercise.content.length) * 100

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      
      recognitionInstance.continuous = false
      recognitionInstance.interimResults = false
      recognitionInstance.lang = 'en-US'
      recognitionInstance.maxAlternatives = 1

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        console.log('Speech recognition result:', transcript)
        
        // Clear timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
        
        // Use functional state updates to avoid stale closures
        setAttempts(prevAttempts => {
          const newAttempts = prevAttempts + 1
          
          // Calculate similarity
          const similarity = calculateSimilarity(currentItem.text, transcript)
          console.log('Similarity score:', similarity)
          
          if (similarity > 0.7) {
            setScore(prevScore => prevScore + 1)
            setFeedback("Great pronunciation! 🎉")
          } else if (similarity > 0.5) {
            setFeedback("Good attempt! Try again for better accuracy. 👍")
          } else {
            setFeedback("Keep practicing! Listen carefully and try again. 💪")
          }
          
          setShowFeedback(true)
          return newAttempts
        })
        
        setIsListening(false)
        stopWaveform()
      }

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        
        // Clear timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
        
        setIsListening(false)
        stopWaveform()
        
        let errorMessage = "Speech recognition error. Please try again."
        if (event.error === 'no-speech') {
          errorMessage = "No speech detected. Please speak clearly and try again."
        } else if (event.error === 'audio-capture') {
          errorMessage = "Microphone access denied. Please allow microphone access."
        } else if (event.error === 'not-allowed') {
          errorMessage = "Microphone permission denied. Please enable microphone access."
        } else if (event.error === 'aborted') {
          errorMessage = "Speech recognition was stopped."
        }
        
        setFeedback(errorMessage)
        setShowFeedback(true)
      }

      recognitionInstance.onstart = () => {
        console.log('Speech recognition started')
      }

      recognitionInstance.onend = () => {
        console.log('Speech recognition ended')
        setIsListening(false)
        stopWaveform()
      }

      setRecognition(recognitionInstance)
      
      // Cleanup function
      return () => {
        if (recognitionInstance) {
          recognitionInstance.stop()
        }
      }
    }
  }, []) // Remove dependencies to avoid recreation

  const calculateSimilarity = (target: string, spoken: string): number => {
    const normalize = (str: string) => str.toLowerCase().replace(/[^\w\s]/g, '').trim()
    const normalizedTarget = normalize(target)
    const normalizedSpoken = normalize(spoken)
    
    if (normalizedTarget === normalizedSpoken) return 1
    
    const distance = levenshteinDistance(normalizedTarget, normalizedSpoken)
    const maxLength = Math.max(normalizedTarget.length, normalizedSpoken.length)
    
    return Math.max(0, 1 - distance / maxLength)
  }

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        )
      }
    }
    
    return matrix[str2.length][str1.length]
  }

  // Waveform animation
  const startWaveform = () => {
    const animate = () => {
      setWaveformData(prev => 
        prev.map(() => Math.random() * 100)
      )
      animationRef.current = requestAnimationFrame(animate)
    }
    animate()
  }

  const stopWaveform = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    setWaveformData(new Array(32).fill(0))
  }

  // Draw waveform
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    const barWidth = canvas.width / waveformData.length
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#3b82f6')
    gradient.addColorStop(1, '#1d4ed8')
    
    ctx.fillStyle = gradient

    waveformData.forEach((height, index) => {
      const barHeight = (height / 100) * canvas.height
      const x = index * barWidth
      const y = canvas.height - barHeight
      
      ctx.fillRect(x, y, barWidth - 2, barHeight)
    })
  }, [waveformData])

  const playAudio = () => {
    if ('speechSynthesis' in window) {
      setIsPlaying(true)
      const utterance = new SpeechSynthesisUtterance(currentItem.telugu || currentItem.text)
      utterance.rate = 0.7
      utterance.pitch = 1
      
      utterance.onend = () => setIsPlaying(false)
      utterance.onerror = () => setIsPlaying(false)
      
      speechSynthesis.speak(utterance)
    }
  }

  const startListening = () => {
    if (recognition) {
      try {
        setIsListening(true)
        setShowFeedback(false)
        startWaveform()
        recognition.start()
        console.log('Starting speech recognition...')
        
        // Set a timeout to handle cases where recognition doesn't respond
        timeoutRef.current = setTimeout(() => {
          if (isListening) {
            setIsListening(false)
            stopWaveform()
            setFeedback("No speech detected. Please try speaking again.")
            setShowFeedback(true)
            if (recognition) {
              recognition.stop()
            }
          }
        }, 10000) // 10 second timeout
        
      } catch (error) {
        console.error('Error starting speech recognition:', error)
        setIsListening(false)
        stopWaveform()
        setFeedback("Failed to start speech recognition. Please try again.")
        setShowFeedback(true)
      }
    } else {
      setFeedback("Speech recognition not available. Please use Chrome or Edge browser.")
      setShowFeedback(true)
    }
  }

  const stopListening = () => {
    if (recognition) {
      recognition.stop()
      setIsListening(false)
      stopWaveform()
    }
    
    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const nextItem = () => {
    if (currentItemIndex < currentExercise.content.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1)
      setShowFeedback(false)
    } else {
      setExerciseCompleted(true)
    }
  }

  const nextExercise = () => {
    if (currentExerciseIndex < speakingExercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1)
      setCurrentItemIndex(0)
      setExerciseCompleted(false)
      setShowFeedback(false)
      setScore(0)
      setAttempts(0)
    }
  }

  const resetExercise = () => {
    setCurrentExerciseIndex(0)
    setCurrentItemIndex(0)
    setExerciseCompleted(false)
    setShowFeedback(false)
    setScore(0)
    setAttempts(0)
  }

  const isRecognitionSupported = typeof window !== 'undefined' && 'webkitSpeechRecognition' in window

  if (exerciseCompleted) {
    const accuracy = attempts > 0 ? Math.round((score / attempts) * 100) : 0
    
    return (
      <div className="sticky top-0 w-full h-full flex flex-col shadow-md md:rounded-s-[inherit] min-[1024px]:rounded-e-3xl bg-background">
        {/* Header */}
        <div className="py-5 sticky bg-background top-0 z-10 px-4 md:px-6 lg:px-8 before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-gradient-to-r before:from-black/[0.06] before:via-black/10 before:to-black/[0.06]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SiteHeader />
              <Trophy className="h-6 w-6 text-yellow-600" />
              <h1 className="text-xl font-semibold">Exercise Complete!</h1>
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
                  {currentExercise.title} Complete!
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 text-center space-y-6">
                <div className="grid grid-cols-3 gap-6">
                  <div className="p-6 bg-blue-50 rounded-xl">
                    <p className="text-3xl font-bold text-blue-600">{score}</p>
                    <p className="text-sm text-gray-600">Good Attempts</p>
                  </div>
                  <div className="p-6 bg-orange-50 rounded-xl">
                    <p className="text-3xl font-bold text-orange-600">{attempts}</p>
                    <p className="text-sm text-gray-600">Total Attempts</p>
                  </div>
                  <div className="p-6 bg-green-50 rounded-xl">
                    <p className="text-3xl font-bold text-green-600">{accuracy}%</p>
                    <p className="text-sm text-gray-600">Accuracy</p>
                  </div>
                </div>

                <div className="flex gap-4 justify-center pt-4">
                  {currentExerciseIndex < speakingExercises.length - 1 && (
                    <Button
                      onClick={nextExercise}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg"
                    >
                      Next Exercise
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={resetExercise}
                    className="px-8 py-3 rounded-xl"
                  >
                    Start Over
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
            <MicVocal className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Speaking Practice</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto px-4 md:px-6 lg:px-8 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Exercise Info */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    {currentExercise.difficulty}
                  </Badge>
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    {currentExercise.category}
                  </Badge>
                  <span className="text-sm font-medium text-gray-700">
                    {currentItemIndex + 1} of {currentExercise.content.length}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetExercise}
                  className="text-xs"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Reset
                </Button>
              </div>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">{currentExercise.title}</h2>
                <p className="text-sm text-gray-600">{currentExercise.description}</p>
              </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>

          {/* Practice Card */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-center text-gray-800 flex items-center justify-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Practice Phrase
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                  <p className="text-2xl font-bold text-gray-800 mb-2">{currentItem.text}</p>
                  {currentItem.telugu && (
                    <p className="text-xl text-purple-700 font-medium">{currentItem.telugu}</p>
                  )}
                </div>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button
                    onClick={playAudio}
                    disabled={isPlaying}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-200"
                  >
                    <Volume2 className="w-5 h-5 mr-2" />
                    {isPlaying ? 'Playing...' : 'Listen'}
                  </Button>

                  {isRecognitionSupported ? (
                    <Button
                      onClick={isListening ? stopListening : startListening}
                      disabled={isPlaying || !recognition}
                      className={`px-6 py-3 rounded-xl shadow-lg transition-all duration-200 ${
                        isListening 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {isListening ? <MicOff className="w-5 h-5 mr-2" /> : <Mic className="w-5 h-5 mr-2" />}
                      {isListening ? 'Stop Listening' : recognition ? 'Practice Speaking' : 'Initializing...'}
                    </Button>
                  ) : (
                    <div className="text-center">
                      <Button disabled className="px-6 py-3 rounded-xl mb-2">
                        <MicOff className="w-5 h-5 mr-2" />
                        Speech Recognition Not Supported
                      </Button>
                      <p className="text-xs text-gray-500">Please use Chrome or Edge browser</p>
                    </div>
                  )}

                  <Button
                    onClick={nextItem}
                    variant="outline"
                    className="px-6 py-3 rounded-xl"
                  >
                    Skip
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Waveform */}
          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex justify-center"
              >
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <p className="text-sm font-medium text-gray-600">Listening... Speak now!</p>
                      <canvas
                        ref={canvasRef}
                        width={300}
                        height={80}
                        className="rounded-lg bg-gray-50"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feedback */}
          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="border-0 shadow-lg bg-green-50/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-lg font-medium text-green-800">{feedback}</p>
                      <Button
                        onClick={nextItem}
                        className="mt-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg"
                      >
                        {currentItemIndex < currentExercise.content.length - 1 ? 'Next Phrase' : 'Complete Exercise'}
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
