"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout";
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
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
  Loader2,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useSidebar } from "@/components/providers/SidebarProvider";
import { cachedFetch } from "@/lib/requestCache";

// Interfaces
interface UserStats {
  totalHours: number;
  completedTopics: number;
  currentLevel: string;
  goalProgress: number;
  streak: number;
}

interface WeeklyProgress {
  day: string;
  value: number;
}

interface RecentTopic {
  id: string;
  name: string;
  progress: number;
  status: "completed" | "in-progress" | "not-started";
}

interface UpcomingTask {
  id: string;
  title: string;
  time: string;
  type: "test" | "meeting" | "practice";
}

interface RoadmapData {
  id: string;
  progress: number;
  predicted_level: string;
  weeks: Array<{
    week_number: number;
    topics: string[];
    completed: boolean;
  }>;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { collapsed } = useSidebar();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress[]>([]);
  const [recentTopics, setRecentTopics] = useState<RecentTopic[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch user data
  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [status, session]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchDashboardData = async (forceRefresh = false) => {
    setLoading(true);

    try {
      // Get access token from session
      const token = (session as any)?.accessToken;

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Fetch roadmap data from backend
      try {
        const roadmapRes = await cachedFetch(
          `${API_URL}/api/roadmap`,
          { headers },
          { force: forceRefresh }
        );

        if (roadmapRes.ok) {
          const roadmapData = await roadmapRes.json();
          setRoadmap(roadmapData);

          // Calculate stats from roadmap
          const completedWeeks = roadmapData.weeks?.filter((w: any) => w.completed).length || 0;
          const totalWeeks = roadmapData.weeks?.length || 1;

          // Get predicted level from test history
          let currentLevel = "Тодорхойгүй";
          try {
            const historyRes = await cachedFetch(
              `${API_URL}/api/tests/history`,
              { headers },
              { force: forceRefresh }
            );
            if (historyRes.ok) {
              const history = await historyRes.json();
              if (history && history.length > 0) {
                currentLevel = `${history[0].predicted_level}`;
              }
            }
          } catch (e) {
            console.log("Could not fetch test history");
          }

          setStats({
            totalHours: completedWeeks * 10,
            completedTopics: completedWeeks * 3,
            currentLevel: currentLevel,
            goalProgress: Math.round((completedWeeks / totalWeeks) * 100),
            streak: 1,
          });

          // Extract topics from roadmap
          const topics: RecentTopic[] = [];
          roadmapData.weeks?.slice(0, 4).forEach((week: any, i: number) => {
            week.topics?.forEach((topic: string, j: number) => {
              topics.push({
                id: `${i}-${j}`,
                name: topic,
                progress: week.completed ? 100 : (i === 0 ? 60 : 0),
                status: week.completed ? "completed" : (i === 0 ? "in-progress" : "not-started"),
              });
            });
          });
          setRecentTopics(topics.slice(0, 4));

          // Generate weekly progress for existing users
          const days = ["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"];
          setWeeklyProgress(
            days.map((day) => ({
              day,
              value: 0,
            }))
          );
        } else {
          // No roadmap yet - check if user has test history
          let currentLevel = "Тест өгөөгүй";
          try {
            const historyRes = await cachedFetch(
              `${API_URL}/api/tests/history`,
              { headers },
              { force: forceRefresh }
            );
            if (historyRes.ok) {
              const history = await historyRes.json();
              if (history && history.length > 0) {
                currentLevel = `${history[0].predicted_level}`;
              }
            }
          } catch (e) {
            console.log("Could not fetch test history");
          }

          setStats({
            totalHours: 0,
            completedTopics: 0,
            currentLevel: currentLevel,
            goalProgress: 0,
            streak: 0,
          });
          setRecentTopics([]);

          // New users have no activity
          const days = ["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"];
          setWeeklyProgress(days.map((day) => ({ day, value: 0 })));
        }
      } catch (err) {
        console.error("API error:", err);
        // API error - set defaults
        setStats({
          totalHours: 0,
          completedTopics: 0,
          currentLevel: "Тест өгөөгүй",
          goalProgress: 0,
          streak: 0,
        });

        // No activity on error
        const days = ["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"];
        setWeeklyProgress(days.map((day) => ({ day, value: 0 })));
      }

      // Generate upcoming tasks
      setUpcomingTasks([
        { id: "1", title: "Оношлогооны тест", time: "Одоо боломжтой", type: "test" },
        { id: "2", title: "Ментортой уулзах", time: "Тохиргоо хийх", type: "meeting" },
      ]);

    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">Уншиж байна...</p>
        </div>
      </div>
    );
  }

  const userName = session?.user?.name || "Хэрэглэгч";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <main className={`p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 transition-all duration-300 ${collapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Header */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8"
          >
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                Сайн байна уу, {userName}!
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
                {roadmap
                  ? "Өнөөдөр ямар зүйл суралцах вэ?"
                  : "Эхлээд оношлогооны тест өгөөрэй!"}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {stats && stats.streak > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="hidden sm:flex items-center gap-2 bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 px-3 sm:px-4 py-2 rounded-xl text-sm"
                >
                  <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-bold">{stats.streak} өдрийн streak!</span>
                </motion.div>
              )}
              <Link href="/dashboard/test">
                <Button rightIcon={<Play className="w-4 h-4" />} className="text-sm sm:text-base">
                  Тест эхлүүлэх
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* No roadmap message */}
          {!roadmap && !loading && (
            <motion.div variants={fadeInUp}>
              <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white mb-6 lg:mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2">Эхлээд оношлогооны тест өгөөрэй!</h2>
                    <p className="text-blue-100 text-sm sm:text-base">
                      Бид таны түвшинг тодорхойлж, хувийн сургалтын төлөвлөгөө үүсгэнэ.
                    </p>
                  </div>
                  <Link href="/dashboard/test" className="w-full sm:w-auto flex-shrink-0">
                    <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-indigo-600 font-semibold rounded-xl shadow-lg shadow-indigo-900/30 hover:bg-indigo-50 transition-all">
                      Тест эхлүүлэх
                      <Play className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Stats Cards */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8"
          >
            <motion.div variants={fadeInUp}>
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs sm:text-sm">Нийт цаг</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1">{stats?.totalHours || 0}</p>
                    <p className="text-blue-200 text-xs sm:text-sm mt-1">цаг суралцсан</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white/20 rounded-xl lg:rounded-2xl flex items-center justify-center">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-xs sm:text-sm">Дуусгасан</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1">{stats?.completedTopics || 0}</p>
                    <p className="text-green-200 text-xs sm:text-sm mt-1">сэдэв дууссан</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white/20 rounded-xl lg:rounded-2xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-xs sm:text-sm">Түвшин</p>
                    <p className={`font-bold mt-1 ${stats?.currentLevel === "Тест өгөөгүй" ? "text-sm sm:text-base lg:text-xl" : "text-xl sm:text-2xl lg:text-3xl"}`}>
                      {stats?.currentLevel || "—"}
                    </p>
                    <p className="text-purple-200 text-xs sm:text-sm mt-1">одоогийн түвшин</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white/20 rounded-xl lg:rounded-2xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-xs sm:text-sm">Зорилго</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1">{stats?.goalProgress || 0}%</p>
                    <p className="text-orange-200 text-xs sm:text-sm mt-1">биелэлт</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white/20 rounded-xl lg:rounded-2xl flex items-center justify-center">
                    <Target className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
              {/* Weekly Progress */}
              <motion.div variants={fadeInUp}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Долоо хоногийн идэвхи</CardTitle>
                      <button
                        onClick={() => fetchDashboardData(true)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                      >
                        <RefreshCw className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end justify-between h-28 sm:h-32 lg:h-40 gap-1 sm:gap-2">
                      {weeklyProgress.map((day, index) => (
                        <motion.div
                          key={day.day}
                          initial={{ height: 0 }}
                          animate={{ height: `${day.value}%` }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                          className="flex-1 flex flex-col items-center gap-2"
                        >
                          <div
                            className={`w-full rounded-t-lg ${day.value >= 70
                              ? "bg-green-500"
                              : day.value >= 40
                                ? "bg-blue-500"
                                : "bg-gray-300 dark:bg-gray-600"
                              }`}
                            style={{ height: "100%" }}
                          />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {day.day}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Topics */}
              <motion.div variants={fadeInUp}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Сүүлийн сэдвүүд</CardTitle>
                      <Link
                        href="/dashboard/roadmap"
                        className="text-blue-600 dark:text-blue-400 text-sm hover:underline flex items-center"
                      >
                        Бүгдийг харах <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {recentTopics.length > 0 ? (
                      <div className="space-y-4">
                        {recentTopics.map((topic) => (
                          <div
                            key={topic.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
                          >
                            <div className="flex items-center gap-2 sm:gap-3">
                              {topic.status === "completed" ? (
                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                              ) : topic.status === "in-progress" ? (
                                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                              ) : (
                                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                              )}
                              <span className="text-sm sm:text-base text-gray-900 dark:text-white font-medium line-clamp-1">
                                {topic.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4 ml-6 sm:ml-0">
                              <Progress value={topic.progress} size="sm" className="w-20 sm:w-24" />
                              <span className="text-xs sm:text-sm text-gray-500 w-10 sm:w-12 text-right">
                                {topic.progress}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Тест өгсний дараа сэдвүүд харагдана</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              {/* Upcoming Tasks */}
              <motion.div variants={fadeInUp}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      Дараагийн алхмууд
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {upcomingTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
                        >
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${task.type === "test"
                              ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600"
                              : task.type === "meeting"
                                ? "bg-purple-100 dark:bg-purple-900/50 text-purple-600"
                                : "bg-green-100 dark:bg-green-900/50 text-green-600"
                              }`}
                          >
                            {task.type === "test" ? (
                              <BookOpen className="w-5 h-5" />
                            ) : task.type === "meeting" ? (
                              <Calendar className="w-5 h-5" />
                            ) : (
                              <Target className="w-5 h-5" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                              {task.title}
                            </p>
                            <p className="text-xs text-gray-500">{task.time}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div variants={fadeInUp}>
                <Card>
                  <CardHeader>
                    <CardTitle>Хурдан үйлдлүүд</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Link href="/dashboard/test" className="block">
                        <Button variant="outline" className="w-full justify-start">
                          <Play className="w-4 h-4 mr-2" />
                          Оношлогооны тест
                        </Button>
                      </Link>
                      <Link href="/dashboard/roadmap" className="block">
                        <Button variant="outline" className="w-full justify-start">
                          <Target className="w-4 h-4 mr-2" />
                          Roadmap харах
                        </Button>
                      </Link>
                      <Link href="/dashboard/mentors" className="block">
                        <Button variant="outline" className="w-full justify-start">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Ментор олох
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
