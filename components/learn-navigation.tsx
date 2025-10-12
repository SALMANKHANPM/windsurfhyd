'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mic, PenTool, Home } from 'lucide-react'

export function LearnNavigation() {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/',
      label: 'Home',
      icon: Home,
      description: 'Back to main page'
    },
    {
      href: '/learn/speak',
      label: 'Learn to Speak',
      icon: Mic,
      description: 'Practice pronunciation with voice recognition'
    },
    {
      href: '/learn/write',
      label: 'Learn to Write',
      icon: PenTool,
      description: 'Practice handwriting with OCR evaluation'
    }
  ]

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "outline"}
                  className={`w-full sm:w-auto h-auto p-4 flex flex-col items-center space-y-2 transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-center">
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                      {item.description}
                    </div>
                  </div>
                </Button>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
