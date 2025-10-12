"use client";
import { SiteHeader } from "@/components/sidebar/site-header";
import { LayoutDashboard, MessageSquare, Mic, BookOpen, PenTool, User, Award, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

function Feature() {
  return (
    <div className="w-full py-10 lg:py-10">
      <div className="container mx-auto">
        <div className="flex flex-col gap-10">
          {/* Welcome Section */}
          <div className="flex gap-4 flex-col items-start">
            <div>
              <Badge>Dashboard</Badge>
            </div>
            <div className="flex gap-2 flex-col">
              <h2 className="text-3xl md:text-5xl tracking-tighter max-w-xl font-regular text-left">
                Welcome back, Learner! 👋
              </h2>
              <p className="text-lg max-w-xl lg:max-w-lg leading-relaxed tracking-tight text-muted-foreground text-left">
                Continue your Telugu learning journey. Practice speaking, writing, and chatting to improve your skills.
              </p>
            </div>
          </div>

          {/* Profile Card */}
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                  <AvatarFallback>LN</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl">Your Progress</CardTitle>
                  <CardDescription>Keep up the great work!</CardDescription>
                </div>
                <Link href="/dashboard/profile">
                  <Button variant="outline">View Profile</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Level 5</span>
                  </div>
                  <Progress value={65} className="h-2" />
                  <span className="text-xs text-muted-foreground">65% to next level</span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">12 Day Streak</span>
                  </div>
                  <Progress value={80} className="h-2" />
                  <span className="text-xs text-muted-foreground">Keep it going!</span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">48 Lessons</span>
                  </div>
                  <Progress value={45} className="h-2" />
                  <span className="text-xs text-muted-foreground">45% completed</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature CTAs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Chat Assistant */}
            <Link href="/dashboard/chat" className="group">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg h-full lg:col-span-2 p-6 aspect-square lg:aspect-auto flex justify-between flex-col transition-all hover:shadow-lg hover:scale-[1.02]">
                <MessageSquare className="w-10 h-10 stroke-1 text-blue-600 dark:text-blue-400" />
                <div className="flex flex-col gap-2">
                  <h3 className="text-2xl tracking-tight font-semibold">
                    AI Chat Assistant
                  </h3>
                  <p className="text-muted-foreground max-w-md text-base">
                    Practice conversations in Telugu and English with our intelligent AI assistant. Get instant translations and contextual help.
                  </p>
                  <Button variant="outline" className="w-fit mt-2 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    Start Chatting →
                  </Button>
                </div>
              </div>
            </Link>

            {/* Speaking Practice */}
            <Link href="/dashboard/learn/speak" className="group">
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg aspect-square p-6 flex justify-between flex-col transition-all hover:shadow-lg hover:scale-[1.02]">
                <Mic className="w-10 h-10 stroke-1 text-green-600 dark:text-green-400" />
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl tracking-tight font-semibold">
                    Speaking Practice
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Improve pronunciation with real-time speech recognition and feedback.
                  </p>
                  <Button variant="outline" className="w-fit mt-2 group-hover:bg-green-600 group-hover:text-white transition-colors">
                    Practice Now →
                  </Button>
                </div>
              </div>
            </Link>

            {/* Writing Practice */}
            <Link href="/dashboard/learn/write" className="group">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg aspect-square p-6 flex justify-between flex-col transition-all hover:shadow-lg hover:scale-[1.02]">
                <PenTool className="w-10 h-10 stroke-1 text-purple-600 dark:text-purple-400" />
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl tracking-tight font-semibold">
                    Writing Practice
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Master Telugu script through interactive writing exercises and lessons.
                  </p>
                  <Button variant="outline" className="w-fit mt-2 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    Start Writing →
                  </Button>
                </div>
              </div>
            </Link>

            {/* Interactive Lessons */}
            <Link href="/dashboard/practice/quiz" className="group">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-lg h-full lg:col-span-2 p-6 aspect-square lg:aspect-auto flex justify-between flex-col transition-all hover:shadow-lg hover:scale-[1.02]">
                <BookOpen className="w-10 h-10 stroke-1 text-orange-600 dark:text-orange-400" />
                <div className="flex flex-col gap-2">
                  <h3 className="text-2xl tracking-tight font-semibold">
                    Interactive Lessons
                  </h3>
                  <p className="text-muted-foreground max-w-md text-base">
                    Test your knowledge with quizzes, text matching, and speaking exercises. Learn at your own pace with structured lessons.
                  </p>
                  <Button variant="outline" className="w-fit mt-2 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    Explore Lessons →
                  </Button>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="sticky top-0 w-full h-full flex flex-col shadow-md md:rounded-s-[inherit] min-[1024px]:rounded-e-3xl bg-background">
      {/* Header */}
      <div className="py-5 sticky bg-background top-0 z-10 px-4 md:px-6 lg:px-8 before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-gradient-to-r before:from-black/[0.06] before:via-black/10 before:to-black/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SiteHeader />
            <LayoutDashboard className="h-6 w-6 text-primary" />
            {/* <h1 className="text-xl font-semibold">translations.aiAssistant</h1> */}
            <h1 className="text-xl font-semibold">Dashboard</h1>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 overflow-auto px-4">
        <Feature />
      </div>
    </div>
  );
}
