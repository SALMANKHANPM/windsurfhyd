'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mic, PenTool, ArrowRight, Volume2, FileImage } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LearnPage() {
  const features = [
    {
      title: 'Learn to Speak',
      description: 'Practice pronunciation with real-time voice recognition and feedback',
      href: '/learn/speak',
      icon: Mic,
      gradient: 'from-blue-600 to-purple-600',
      bgGradient: 'from-blue-50 to-purple-50',
      features: [
        { icon: Volume2, text: 'Text-to-Speech playback' },
        { icon: Mic, text: 'Voice recognition & scoring' },
        { icon: ArrowRight, text: 'Real-time waveform visualization' }
      ]
    },
    {
      title: 'Learn to Write',
      description: 'Practice handwriting with OCR evaluation and instant feedback',
      href: '/learn/write',
      icon: PenTool,
      gradient: 'from-green-600 to-blue-600',
      bgGradient: 'from-green-50 to-blue-50',
      features: [
        { icon: FileImage, text: 'Image upload & OCR processing' },
        { icon: PenTool, text: 'Handwriting evaluation' },
        { icon: ArrowRight, text: 'Accuracy scoring & feedback' }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 py-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent"
          >
            Telugu Language Learning
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Master Telugu through interactive speaking and writing exercises with AI-powered feedback
          </motion.p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm hover:shadow-3xl transition-all duration-300 h-full">
                  <CardHeader className="pb-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.bgGradient} flex items-center justify-center mb-4 mx-auto`}>
                      <Icon className={`w-8 h-8 bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`} />
                    </div>
                    <CardTitle className="text-2xl font-bold text-center text-gray-800">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-gray-600 text-center text-lg leading-relaxed">
                      {feature.description}
                    </p>
                    
                    {/* Feature List */}
                    <div className="space-y-3">
                      {feature.features.map((item, idx) => {
                        const ItemIcon = item.icon
                        return (
                          <div key={idx} className="flex items-center space-x-3 text-gray-700">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${feature.bgGradient} flex items-center justify-center`}>
                              <ItemIcon className="w-4 h-4 text-gray-600" />
                            </div>
                            <span className="text-sm font-medium">{item.text}</span>
                          </div>
                        )
                      })}
                    </div>

                    {/* CTA Button */}
                    <div className="pt-4">
                      <Link href={feature.href} className="block">
                        <Button 
                          className={`w-full bg-gradient-to-r ${feature.gradient} hover:opacity-90 text-white py-6 text-lg font-semibold rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl`}
                        >
                          Start Learning
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center py-8"
        >
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                AI-Powered Learning Experience
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Our platform uses cutting-edge speech recognition and optical character recognition 
                technology to provide real-time feedback on your pronunciation and handwriting. 
                Track your progress as you master both spoken and written Telugu.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
