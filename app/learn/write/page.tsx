'use client'

import { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Upload, X, RotateCcw, FileImage, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { LearnNavigation } from '@/components/learn-navigation'

interface WritingPrompt {
  id: number
  text: string
  language: 'english' | 'telugu'
}

interface OCRResult {
  target: string
  extracted: string
  score: number
  message: string
}

const samplePrompts: WritingPrompt[] = [
  { id: 1, text: "Hello World", language: 'english' },
  { id: 2, text: "Good Morning", language: 'english' },
  { id: 3, text: "Thank you", language: 'english' },
  { id: 4, text: "నమస్కారం", language: 'telugu' },
  { id: 5, text: "ధన్యవాదాలు", language: 'telugu' }
]

export default function LearnToWritePage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<OCRResult | null>(null)
  const [progress, setProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentPrompt = samplePrompts[currentIndex]

  const calculateSimilarity = (target: string, extracted: string): number => {
    const normalize = (str: string) => {
      // For Telugu text, normalize Unicode and remove zero-width characters
      if (/[\u0C00-\u0C7F]/.test(str)) {
        return str.normalize('NFC').replace(/[\u200C\u200D]/g, '').trim()
      }
      // For English text, lowercase and remove punctuation
      return str.toLowerCase().replace(/[^\w\s]/g, '').trim()
    }

    const normalizedTarget = normalize(target)
    const normalizedExtracted = normalize(extracted)
    
    if (normalizedTarget === normalizedExtracted) return 1
    
    const distance = levenshteinDistance(normalizedTarget, normalizedExtracted)
    const maxLength = Math.max(normalizedTarget.length, normalizedExtracted.length)
    
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
    if (score >= 0.9) return "Perfect! Excellent handwriting!"
    if (score >= 0.75) return "Great job! Very clear writing!"
    if (score >= 0.6) return "Good effort! Keep practicing!"
    return "Keep practicing! Your handwriting will improve!"
  }

  const processImage = async (imageFile: File) => {
    setIsProcessing(true)
    setResult(null)

    try {
      // Simulate OCR processing with a delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // For demo purposes, simulate OCR results based on the current prompt
      // In a real implementation, this would use tesseract.js
      const simulatedResults: Record<string, string> = {
        'Hello World': 'Hello World',
        'Good Morning': 'Good Morning',
        'Thank you': 'Thank you',
        'నమస్కారం': 'నమస్కారం',
        'ధన్యవాదాలు': 'ధన్యవాదాలు'
      }
      
      // Add some variation to simulate real OCR
      const variations = [
        currentPrompt.text, // Perfect match
        currentPrompt.text.toLowerCase(), // Case variation
        currentPrompt.text + ' ', // Extra space
        currentPrompt.text.slice(0, -1), // Missing last character
      ]
      
      const extractedText = variations[Math.floor(Math.random() * variations.length)]
      
      // Calculate similarity
      const score = calculateSimilarity(currentPrompt.text, extractedText)
      const message = getScoreMessage(score)

      setResult({
        target: currentPrompt.text,
        extracted: extractedText.trim(),
        score,
        message
      })

    } catch (error) {
      console.error('OCR Error:', error)
      setResult({
        target: currentPrompt.text,
        extracted: 'Error processing image',
        score: 0,
        message: 'Failed to process image. Please try again.'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setUploadedImage(result)
        processImage(file)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const clearImage = () => {
    setUploadedImage(null)
    setResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const nextPrompt = () => {
    if (currentIndex < samplePrompts.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setUploadedImage(null)
      setResult(null)
      setProgress(((currentIndex + 1) / samplePrompts.length) * 100)
    }
  }

  const resetProgress = () => {
    setCurrentIndex(0)
    setUploadedImage(null)
    setResult(null)
    setProgress(0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation */}
        <LearnNavigation />
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Learn to Write
          </h1>
          <p className="text-gray-600">Practice handwriting with OCR evaluation</p>
        </div>

        {/* Progress */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Prompt {currentIndex + 1} of {samplePrompts.length}
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

        {/* Writing Prompt */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-gray-800">Write This Text</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <Badge 
                variant="outline" 
                className="text-sm px-3 py-1"
              >
                {currentPrompt.language === 'english' ? 'English' : 'Telugu'}
              </Badge>
              <div className="p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <p className="text-3xl font-medium text-gray-800 font-mono">
                  {currentPrompt.text}
                </p>
              </div>
              <p className="text-sm text-gray-600">
                Write this text on paper and upload a photo
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Upload Area */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : uploadedImage 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {uploadedImage ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <img
                      src={uploadedImage}
                      alt="Uploaded handwriting"
                      className="max-w-full max-h-64 rounded-lg shadow-md"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={clearImage}
                      className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  {isProcessing && (
                    <div className="flex items-center justify-center space-x-2 text-blue-600">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing image...</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <FileImage className="w-16 h-16 mx-auto text-gray-400" />
                  <div>
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      Drop your image here or click to upload
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports JPG, PNG, JPEG, WebP
                    </p>
                  </div>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>

        {/* Result */}
        <AnimatePresence>
          {result && !isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-center text-gray-800">OCR Result</CardTitle>
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
                      <p className="text-sm font-semibold text-blue-700 mb-1">Target Text:</p>
                      <p className="text-lg font-mono text-gray-800">{result.target}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm font-semibold text-green-700 mb-1">Extracted Text:</p>
                      <p className="text-lg font-mono text-gray-800">
                        {result.extracted || 'No text detected'}
                      </p>
                    </div>
                  </div>

                  {currentIndex < samplePrompts.length - 1 && (
                    <div className="text-center pt-4">
                      <Button
                        onClick={nextPrompt}
                        className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl shadow-lg"
                      >
                        Next Prompt
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
  )
}
