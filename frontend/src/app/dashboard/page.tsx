"use client";

import { Sidebar } from "@/components/layout";
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Progress from "@/components/ui/Progress";
import {
  TrendingUp,
  BookOpen,
  Clock,
  Target,
  ChevronRight,
  Play,
  CheckCircle,
  AlertCircle,
  Calendar,
  Flame,
} from "lucide-react";
import Link from "next/link";

interface WeeklyProgress {
  day: string;
  value: number;
}

interface RecentTopic {
  name: string;
  progress: number;
  status: "completed" | "in-progress" | "not-started";
}

interface UpcomingTask {
  title: string;
  time: string;
  type: "test" | "meeting" | "practice";
}

const weeklyProgress: WeeklyProgress[] = [
  { day: "Да", value: 80 },
  { day: "Мя", value: 65 },
  { day: "Лх", value: 90 },
  { day: "Пү", value: 45 },
  { day: "Ба", value: 70 },
  { day: "Бя", value: 55 },
  { day: "Ня", value: 30 },
];

const recentTopics: RecentTopic[] = [
  { name: "Квадрат тэгшитгэл", progress: 85, status: "completed" },
  { name: "Функцийн график", progress: 60, status: "in-progress" },
  { name: "Тригонометр", progress: 30, status: "in-progress" },
  { name: "Магадлалын онол", progress: 0, status: "not-started" },
];

const upcomingTasks: UpcomingTask[] = [
  { title: "Математикийн тест", time: "Өнөөдөр, 14:00", type: "test" },
  { title: "Ментортой уулзалт", time: "Маргааш, 10:00", type: "meeting" },
  { title: "Физик дасгал", time: "2 өдрийн дараа", type: "practice" },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <main className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Сайн байна уу, Батбаяр! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Өнөөдөр ямар зүйл суралцах вэ?
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 px-4 py-2 rounded-xl">
              <Flame className="w-5 h-5" />
              <span className="font-bold">7 өдрийн streak!</span>
            </div>
            <Link href="/dashboard/test">
              <Button rightIcon={<Play className="w-4 h-4" />}>
                Тест эхлүүлэх
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Нийт цаг</p>
                <p className="text-3xl font-bold mt-1">48.5</p>
                <p className="text-blue-200 text-sm mt-1">цаг суралцсан</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <Clock className="w-7 h-7" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Дуусгасан</p>
                <p className="text-3xl font-bold mt-1">24</p>
                <p className="text-green-200 text-sm mt-1">сэдэв дууссан</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <CheckCircle className="w-7 h-7" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Түвшин</p>
                <p className="text-3xl font-bold mt-1">Дунд+</p>
                <p className="text-purple-200 text-sm mt-1">одоогийн түвшин</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-7 h-7" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Зорилго</p>
                <p className="text-3xl font-bold mt-1">78%</p>
                <p className="text-orange-200 text-sm mt-1">биелэлт</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <Target className="w-7 h-7" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Weekly Progress */}
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Долоо хоногийн идэвхи</CardTitle>
                <Badge variant="success">+12% өмнөх 7 хоногоос</Badge>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between h-40 gap-2">
                  {weeklyProgress.map((day) => (
                    <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg relative overflow-hidden" style={{ height: "120px" }}>
                        <div
                          className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-lg transition-all"
                          style={{ height: `${day.value}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{day.day}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Continue Learning */}
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Үргэлжлүүлэх</CardTitle>
                <Link href="/dashboard/roadmap" className="text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center gap-1 hover:underline">
                  Бүгдийг харах <ChevronRight className="w-4 h-4" />
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentTopics.map((topic) => (
                  <div key={topic.name} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      topic.status === "completed" ? "bg-green-100 dark:bg-green-900/50" :
                      topic.status === "in-progress" ? "bg-blue-100 dark:bg-blue-900/50" : "bg-gray-200 dark:bg-gray-700"
                    }`}>
                      {topic.status === "completed" ? (
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                      ) : topic.status === "in-progress" ? (
                        <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">{topic.name}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{topic.progress}%</span>
                      </div>
                      <Progress value={topic.progress} variant={topic.status === "completed" ? "success" : "default"} size="sm" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Content */}
          <div className="space-y-8">
            {/* Upcoming Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Дараагийн даалгаврууд
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingTasks.map((task, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      task.type === "test" ? "bg-red-100 dark:bg-red-900/50" :
                      task.type === "meeting" ? "bg-purple-100 dark:bg-purple-900/50" : "bg-blue-100 dark:bg-blue-900/50"
                    }`}>
                      {task.type === "test" ? (
                        <AlertCircle className={`w-5 h-5 ${task.type === "test" ? "text-red-600 dark:text-red-400" : ""}`} />
                      ) : task.type === "meeting" ? (
                        <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      ) : (
                        <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{task.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{task.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
              <CardHeader>
                <CardTitle className="text-white">Ментор хайх</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-indigo-100 mb-4">
                  500+ ментороос өөрт тохирохыг олоорой
                </p>
                <Link href="/dashboard/mentors">
                  <Button className="w-full bg-white text-indigo-600 hover:bg-gray-100">
                    Ментор хайх
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Weakness Alert */}
            <Card variant="bordered" className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/30">
              <CardContent className="flex gap-4">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Анхаарал!</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Тригонометр сэдэвт илүү анхаарал хандуулах хэрэгтэй байна.
                  </p>
                  <Link href="/dashboard/roadmap" className="text-orange-600 dark:text-orange-400 text-sm font-medium mt-2 inline-block hover:underline">
                    Дасгал хийх →
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
