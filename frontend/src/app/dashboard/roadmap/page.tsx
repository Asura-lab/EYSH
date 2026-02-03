"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout";
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Progress from "@/components/ui/Progress";
import {
  Route,
  CheckCircle,
  Circle,
  Lock,
  Play,
  Clock,
  BookOpen,
  Target,
  ChevronDown,
  ChevronUp,
  Star,
  Zap,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import Link from "next/link";
import { useSidebar } from "@/components/providers/SidebarProvider";
import { topicsAPI, TopicContent } from "@/lib/api";
import { cachedFetch } from "@/lib/requestCache";

interface WeekPlan {
  week_number: number;
  topics: string[];
  goals: string[];
  resources: string[];
  completed: boolean;
}

interface RoadmapData {
  id: string;
  weeks: WeekPlan[];
  progress: number;
  generated_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function RoadmapPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { collapsed } = useSidebar();

  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [expandedWeeks, setExpandedWeeks] = useState<number[]>([1]);
  const [error, setError] = useState<string | null>(null);

  // Topic Modal State
  const [selectedTopicName, setSelectedTopicName] = useState<string | null>(null);
  const [topicContent, setTopicContent] = useState<TopicContent | null>(null);
  const [topicLoading, setTopicLoading] = useState(false);

  const difficultyLabel = (value?: string) => {
    if (value === "advanced") return "Ахисан";
    if (value === "intermediate") return "Дунд";
    return "Суурь";
  };

  const difficultyBadgeVariant = (value?: string) => {
    if (value === "advanced") return "warning";
    if (value === "intermediate") return "info";
    return "success";
  };

  const openTopic = async (topic: string) => {
    setSelectedTopicName(topic);
    setTopicContent(null);
    setTopicLoading(true);
    try {
      const res = await topicsAPI.get(topic);
      setTopicContent(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setTopicLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchRoadmap();
    }
  }, [status, router]);

  const fetchRoadmap = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      const token = (session as any)?.accessToken;
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await cachedFetch(
        `${API_URL}/api/roadmap`,
        { headers },
        { force: forceRefresh }
      );

      if (res.ok) {
        const data = await res.json();
        setRoadmap(data);
        // Expand first incomplete week
        const firstIncomplete = data.weeks?.findIndex((w: WeekPlan) => !w.completed);
        if (firstIncomplete >= 0) {
          setExpandedWeeks([data.weeks[firstIncomplete].week_number]);
        }
      } else if (res.status === 404) {
        setError("Roadmap олдсонгүй. Эхлээд оношлогооны тест өгнө үү.");
      } else {
        setError("Roadmap татахад алдаа гарлаа.");
      }
    } catch (err) {
      console.error("Failed to fetch roadmap:", err);
      setError("Сервертэй холбогдоход алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  };

  const toggleWeek = (weekNumber: number) => {
    setExpandedWeeks(prev =>
      prev.includes(weekNumber)
        ? prev.filter(w => w !== weekNumber)
        : [...prev, weekNumber]
    );
  };

  const markWeekComplete = async (weekNumber: number) => {
    try {
      const token = (session as any)?.accessToken;
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/api/roadmap/${weekNumber}/progress`, {
        method: "PATCH",
        headers,
      });

      if (res.ok) {
        // Refresh roadmap
        fetchRoadmap(true);
      }
    } catch (err) {
      console.error("Failed to update progress:", err);
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

  // No roadmap - show message to take test
  if (error || !roadmap) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <main className={`p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 transition-all duration-300 ${collapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Roadmap олдсонгүй
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              {error || "Таны хувийн сургалтын төлөвлөгөө үүсгэхийн тулд эхлээд оношлогооны тест өгнө үү."}
            </p>
            <Link href="/dashboard/test">
              <Button size="lg">
                <Play className="w-5 h-5 mr-2" />
                Тест өгөх
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const completedWeeks = roadmap.weeks.filter(w => w.completed).length;
  const totalWeeks = roadmap.weeks.length;
  const totalProgress = totalWeeks > 0 ? Math.round((completedWeeks / totalWeeks) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <main className={`p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 transition-all duration-300 ${collapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 lg:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">Сургалтын Roadmap</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Таны хувийн сургалтын төлөвлөгөө - Математик
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Нийт явц</p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">{totalProgress}%</p>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
          <Card>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/50 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{completedWeeks}</p>
                <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">Дуусгасан долоо хоног</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <Play className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{totalWeeks - completedWeeks}</p>
                <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">Үлдсэн долоо хоног</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{totalWeeks}</p>
                <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">Нийт долоо хоног</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 dark:bg-orange-900/50 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{totalProgress}%</p>
                <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">Зорилгын биелэлт</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Roadmap Weeks */}
        <div className="space-y-4 sm:space-y-6">
          {roadmap.weeks.map((week, weekIndex) => {
            const isExpanded = expandedWeeks.includes(week.week_number);
            const isCompleted = week.completed;
            const isCurrent = !isCompleted && weekIndex === roadmap.weeks.findIndex(w => !w.completed);

            return (
              <Card key={week.week_number} className="overflow-hidden">
                {/* Week Header */}
                <button
                  onClick={() => toggleWeek(week.week_number)}
                  className="w-full p-4 sm:p-6 flex items-center gap-4 sm:gap-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  {/* Week Number */}
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center font-bold text-lg sm:text-xl flex-shrink-0 ${isCompleted
                      ? "bg-green-100 dark:bg-green-900/50 text-green-600"
                      : isCurrent
                        ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-400"
                      }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7" />
                    ) : (
                      week.week_number
                    )}
                  </div>

                  {/* Week Info */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 sm:gap-3 mb-1 flex-wrap">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                        {week.week_number}-р долоо хоног
                      </h3>
                      {isCompleted && (
                        <Badge variant="success" size="sm">Дуусгасан</Badge>
                      )}
                      {isCurrent && (
                        <Badge variant="info" size="sm">
                          <Zap className="w-3 h-3 mr-1" />
                          Одоо
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-1" onClick={(e) => e.stopPropagation()}>
                      {week.topics.map((topic, i) => (
                        <span key={i} className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                          <button
                            onClick={() => openTopic(topic)}
                            className="hover:text-blue-500 hover:underline font-medium focus:outline-none"
                          >
                            {topic}
                          </button>
                          {i < week.topics.length - 1 && ", "}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Expand Button */}
                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Week Details */}
                {isExpanded && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4 sm:pt-6">
                      {/* Goals */}
                      <div className="mb-4 sm:mb-6">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2 sm:mb-3 flex items-center gap-2">
                          <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                          Зорилтууд
                        </h4>
                        <ul className="space-y-2">
                          {week.goals.map((goal, i) => (
                            <li key={i} className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                              <CheckCircle className={`w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 ${isCompleted ? "text-green-500" : "text-gray-300"}`} />
                              {goal}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Resources */}
                      <div className="mb-4 sm:mb-6">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2 sm:mb-3 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                          Материал
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {week.resources.map((resource, i) => (
                            <Badge key={i} variant="default" className="text-xs sm:text-sm">
                              {resource}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Action Button */}
                      {!isCompleted && (
                        <div className="flex justify-end">
                          <Button onClick={() => markWeekComplete(week.week_number)}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Дуусгасан гэж тэмдэглэх
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Topic Content Modal */}
        {selectedTopicName && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedTopicName(null)}>
            <div
              className="bg-white dark:bg-gray-800 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  {topicContent?.title || selectedTopicName}
                </h3>
                <button
                  onClick={() => setSelectedTopicName(null)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Body */}
              <div className="p-0 overflow-y-auto flex-1 custom-scrollbar">
                {/* Video Player */}
                <div className="aspect-video w-full bg-black">
                  {topicContent ? (
                    topicContent.youtube_id ? (
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${topicContent.youtube_id}?rel=0&modestbranding=1&playsinline=1`}
                        className="w-full h-full"
                        title={topicContent.title}
                        allowFullScreen
                        referrerPolicy="strict-origin-when-cross-origin"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white bg-gray-900">
                        <p className="text-sm sm:text-base text-gray-200">Видео одоогоор оруулаагүй байна.</p>
                      </div>
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <Loader2 className="w-10 h-10 animate-spin" />
                    </div>
                  )}
                </div>

                {/* Content Details */}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge variant={difficultyBadgeVariant(topicContent?.difficulty)}>
                      {difficultyLabel(topicContent?.difficulty)}
                    </Badge>
                    <span className="text-gray-500 text-sm flex items-center gap-1">
                      <Play className="w-4 h-4" /> Видео хичээл
                    </span>
                  </div>

                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">Тайлбар</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                    {topicContent?.summary || "Уншиж байна..."}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t dark:border-gray-700">
                    <Link href="/dashboard/test" className="w-full sm:w-auto">
                      <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                        <Play className="w-5 h-5 mr-2" />
                        Бататгах даалгавар ажиллах
                      </Button>
                    </Link>
                    <button
                      onClick={() => setSelectedTopicName(null)}
                      className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
                    >
                      Хаах
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
