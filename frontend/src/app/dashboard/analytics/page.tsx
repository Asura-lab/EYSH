"use client";

import { Sidebar } from "@/components/layout";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Progress from "@/components/ui/Progress";
import Badge from "@/components/ui/Badge";
import { useSidebar } from "@/components/providers/SidebarProvider";
import { BarChart3, TrendingUp, Target, Clock, CheckCircle2 } from "lucide-react";

interface DailyStat {
  day: string;
  score: number;
}

interface TopicStat {
  name: string;
  progress: number;
}

const weeklyStats: DailyStat[] = [
  { day: "Да", score: 42 },
  { day: "Мя", score: 56 },
  { day: "Лх", score: 68 },
  { day: "Пү", score: 75 },
  { day: "Ба", score: 60 },
  { day: "Бя", score: 81 },
  { day: "Ня", score: 72 },
];

const topicStats: TopicStat[] = [
  { name: "Алгебр", progress: 78 },
  { name: "Геометр", progress: 62 },
  { name: "Тригонометр", progress: 55 },
  { name: "Магадлал", progress: 71 },
];

const maxScore = Math.max(...weeklyStats.map((item) => item.score), 1);

export default function AnalyticsPage() {
  const { collapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className={`p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 transition-all duration-300 ${collapsed ? "lg:ml-20" : "lg:ml-72"}`}>
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Шинжилгээ</h1>
          <p className="text-gray-600 dark:text-gray-300">Таны суралцах ахиц болон гүйцэтгэлийн тойм</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-100">Нийт оноо</p>
                <p className="text-2xl font-bold mt-1">1,248</p>
              </div>
              <BarChart3 className="w-8 h-8 text-white/90" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white">
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-100">Сүүлийн ахиц</p>
                <p className="text-2xl font-bold mt-1">+18%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-white/90" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-100">Дууссан сэдэв</p>
                <p className="text-2xl font-bold mt-1">24</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-white/90" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-fuchsia-500 to-pink-600 text-white">
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-fuchsia-100">Дундаж хугацаа</p>
                <p className="text-2xl font-bold mt-1">32м</p>
              </div>
              <Clock className="w-8 h-8 text-white/90" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
          <Card className="xl:col-span-2">
            <CardHeader className="mb-5">
              <CardTitle className="text-lg">7 хоногийн гүйцэтгэл</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3 h-52">
                {weeklyStats.map((item) => (
                  <div key={item.day} className="flex-1 min-w-0">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-t-xl relative overflow-hidden h-44 flex items-end">
                      <div
                        className="w-full bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-xl transition-all duration-500"
                        style={{ height: `${(item.score / maxScore) * 100}%` }}
                      />
                    </div>
                    <div className="text-center mt-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.day}</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.score}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="mb-5">
              <CardTitle className="text-lg">Сэдвийн ахиц</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {topicStats.map((topic) => (
                <div key={topic.name}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{topic.name}</p>
                    <Badge variant={topic.progress >= 70 ? "success" : "warning"}>{topic.progress}%</Badge>
                  </div>
                  <Progress
                    value={topic.progress}
                    variant={topic.progress >= 70 ? "success" : "default"}
                    size="md"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-4 lg:mt-6">
          <CardHeader className="mb-5">
            <CardTitle className="text-lg">Зорилтын төлөв</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-blue-600" />
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Энэ сарын зорилт</p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">30 сэдвээс 24-ийг дуусгасан</p>
              <Progress value={80} variant="gradient" />
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/40">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Шалгалтын бэлэн байдал</p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Таны гүйцэтгэл тогтвортой өсөж байна</p>
              <Progress value={74} variant="success" />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
