'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Volume2, Mic, MicOff, RotateCcw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { SiteHeader } from "@/components/sidebar/site-header"

interface Sentence {
  id: number
  english: string
  telugu: string
}

interface AttemptResult {
  target: string
  recognized: string
  score: number
  message: string
}

const sampleSentences: Sentence[] = [
  { id: 1, english: "Hello, how are you?", telugu: "హలో, మీరు ఎలా ఉన్నారు?" },
  { id: 2, english: "Thank you very much", telugu: "చాలా ధన్యవాదాలు" },
  { id: 3, english: "Good morning", telugu: "శుభోదయం" },
  { id: 4, english: "What is your name?", telugu: "మీ పేరు ఏమిటి?" },
  { id: 5, english: "I am learning Telugu", telugu: "నేను తెలుగు నేర్చుకుంటున్నాను" }
]

export default function Speaking() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [result, setResult] = useState<AttemptResult | null>(null)
  const [progress, setProgress] = useState(0)
  const [recognition, setRecognition] = useState<any>(null)
  const [waveformData, setWaveformData] = useState<number[]>(new Array(32).fill(0))
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)

  const currentSentence = sampleSentences[currentIndex]

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      
      recognitionInstance.continuous = false
      recognitionInstance.interimResults = false
      recognitionInstance.lang = 'en-US'

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        const score = calculateSimilarity(currentSentence.english, transcript)
        const message = getScoreMessage(score)
        
        setResult({
          target: currentSentence.english,
          recognized: transcript,
          score,
          message
        })
        
        setIsListening(false)
        stopWaveform()
      }

      recognitionInstance.onerror = () => {
        setIsListening(false)
        stopWaveform()
      }

      recognitionInstance.onend = () => {
        setIsListening(false)
        stopWaveform()
      }

      setRecognition(recognitionInstance)
    }
  }, [currentSentence.english])

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

  const calculateSimilarity = (target: string, recognized: string): number => {
    const normalize = (str: string) => str.toLowerCase().replace(/[^\w\s]/g, '').trim()
    const normalizedTarget = normalize(target)
    const normalizedRecognized = normalize(recognized)
    
    if (normalizedTarget === normalizedRecognized) return 1
    
    const distance = levenshteinDistance(normalizedTarget, normalizedRecognized)
    const maxLength = Math.max(normalizedTarget.length, normalizedRecognized.length)
    
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

  const getScoreMessage = (score: number): string => {
    if (score >= 0.9) return "Excellent! Perfect pronunciation!"
    if (score >= 0.75) return "Great job! Very good pronunciation!"
    if (score >= 0.6) return "Good try! Keep practicing!"
    return "Keep practicing! You'll get better!"
  }

  const playAudio = () => {
    if ('speechSynthesis' in window) {
      setIsPlaying(true)
      const utterance = new SpeechSynthesisUtterance(currentSentence.english)
      utterance.rate = 0.8
      utterance.pitch = 1
      
      utterance.onend = () => setIsPlaying(false)
      utterance.onerror = () => setIsPlaying(false)
      
      speechSynthesis.speak(utterance)
    }
  }

  const startListening = () => {
    if (recognition) {
      setIsListening(true)
      setResult(null)
      startWaveform()
      recognition.start()
    }
  }

  const stopListening = () => {
    if (recognition) {
      recognition.stop()
      setIsListening(false)
      stopWaveform()
    }
  }

  const nextSentence = () => {
    if (currentIndex < sampleSentences.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setResult(null)
      setProgress(((currentIndex + 1) / sampleSentences.length) * 100)
    }
  }

  const resetProgress = () => {
    setCurrentIndex(0)
    setResult(null)
    setProgress(0)
  }

  const isRecognitionSupported = typeof window !== 'undefined' && 'webkitSpeechRecognition' in window

  return (
    <div className="sticky top-0 w-full h-full flex flex-col shadow-md md:rounded-s-[inherit] min-[1024px]:rounded-e-3xl bg-background">
      {/* Header */}
      <div className="py-5 sticky bg-background top-0 z-10 px-4 md:px-6 lg:px-8 before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-gradient-to-r before:from-black/[0.06] before:via-black/10 before:to-black/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SiteHeader />
            <Mic className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Learn to Speak</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto px-4 md:px-6 lg:px-8 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Progress */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Sentence {currentIndex + 1} of {sampleSentences.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetProgress}
                  className="text-xs"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Reset
                </Button>
              </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>

          {/* Sentence Card */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-center text-gray-800">Practice Sentence</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="text-center space-y-2">
                  <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide">English</h3>
                  <p className="text-2xl font-medium text-gray-800">{currentSentence.english}</p>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-sm font-semibold text-purple-600 uppercase tracking-wide">Telugu</h3>
                  <p className="text-2xl font-medium text-gray-800">{currentSentence.telugu}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  onClick={playAudio}
                  disabled={isPlaying}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-200"
                >
                  <Volume2 className="w-5 h-5 mr-2" />
                  {isPlaying ? 'Playing...' : 'Play Voice'}
                </Button>

                {isRecognitionSupported ? (
                  <Button
                    onClick={isListening ? stopListening : startListening}
                    disabled={isPlaying}
                    className={`px-6 py-3 rounded-xl shadow-lg transition-all duration-200 ${
                      isListening 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {isListening ? <MicOff className="w-5 h-5 mr-2" /> : <Mic className="w-5 h-5 mr-2" />}
                    {isListening ? 'Stop Listening' : 'Speak Now'}
                  </Button>
                ) : (
                  <Button disabled className="px-6 py-3 rounded-xl">
                    <MicOff className="w-5 h-5 mr-2" />
                    Speech Recognition Not Supported
                  </Button>
                )}
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
                      <p className="text-sm font-medium text-gray-600">Listening...</p>
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

          {/* Result */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-center text-gray-800">Result</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="text-center space-y-2">
                      <Badge 
                        variant={result.score >= 0.75 ? "default" : "secondary"}
                        className="text-lg px-4 py-2"
                      >
                        {Math.round(result.score * 100)}% Accuracy
                      </Badge>
                      <p className="text-lg font-medium text-gray-700">{result.message}</p>
                    </div>
                    
                    <div className="grid gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm font-semibold text-blue-700 mb-1">Target:</p>
                        <p className="text-gray-800">{result.target}</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm font-semibold text-green-700 mb-1">You said:</p>
                        <p className="text-gray-800">{result.recognized}</p>
                      </div>
                    </div>

                    {currentIndex < sampleSentences.length - 1 && (
                      <div className="text-center pt-4">
                        <Button
                          onClick={nextSentence}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg"
                        >
                          Next Sentence
                        </Button>
                      </div>
                    )}
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
