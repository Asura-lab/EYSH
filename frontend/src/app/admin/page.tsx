"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  adminAPI,
  TopicViewStats,
  DailyViewStats,
  UserActivityStats,
  SuggestedTopic,
  WeeklyGrowth,
  TestPerformance,
  AdminStats,
  problemsAPI,
  Problem,
  ProblemImage,
} from "@/lib/api";
import { Card, Badge, Progress } from "@/components/ui";

// Simple Chart Components
const BarChart = ({
  data,
  dataKey,
  labelKey,
  color = "#3B82F6",
}: {
  data: any[];
  dataKey: string;
  labelKey: string;
  color?: string;
}) => {
  const maxValue = Math.max(...data.map((d) => d[dataKey]), 1);
  return (
    <div className="space-y-2">
      {data.map((item, idx) => (
        <div key={idx} className="flex items-center gap-3">
          <div className="w-32 text-sm text-gray-600 dark:text-gray-400 truncate">
            {item[labelKey]}
          </div>
          <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(item[dataKey] / maxValue) * 100}%`,
                backgroundColor: color,
              }}
            />
          </div>
          <div className="w-16 text-sm font-medium text-right">
            {item[dataKey]}
          </div>
        </div>
      ))}
    </div>
  );
};

const LineChart = ({
  data,
  dataKey,
  labelKey,
  color = "#10B981",
}: {
  data: any[];
  dataKey: string;
  labelKey: string;
  color?: string;
}) => {
  const maxValue = Math.max(...data.map((d) => d[dataKey]), 1);
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1 || 1)) * 100,
    y: 100 - (d[dataKey] / maxValue) * 100,
  }));

  const pathD = points.length
    ? `M ${points.map((p) => `${p.x} ${p.y}`).join(" L ")}`
    : "";

  return (
    <div className="relative">
      <svg
        viewBox="0 0 100 60"
        className="w-full h-40"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {points.length > 1 && (
          <>
            <path
              d={`${pathD} L 100 60 L 0 60 Z`}
              fill={`url(#gradient-${color})`}
            />
            <path
              d={pathD}
              fill="none"
              stroke={color}
              strokeWidth="0.5"
              vectorEffect="non-scaling-stroke"
            />
          </>
        )}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="1" fill={color} />
        ))}
      </svg>
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        {data.slice(0, 5).map((d, i) => (
          <span key={i}>{d[labelKey]}</span>
        ))}
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [topicViews, setTopicViews] = useState<TopicViewStats[]>([]);
  const [dailyViews, setDailyViews] = useState<DailyViewStats[]>([]);
  const [userActivity, setUserActivity] = useState<UserActivityStats | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestedTopic[]>([]);
  const [weeklyGrowth, setWeeklyGrowth] = useState<WeeklyGrowth[]>([]);
  const [testPerformance, setTestPerformance] = useState<TestPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "topics" | "users" | "tests" | "problems">("overview");

  const [recentProblems, setRecentProblems] = useState<Problem[]>([]);
  const [problemForm, setProblemForm] = useState({
    subject: "Математик",
    topic: "",
    difficulty: "beginner",
    text: "",
    number: "",
  });
  const [problemImages, setProblemImages] = useState<File[]>([]);
  const [problemSubmitting, setProblemSubmitting] = useState(false);
  const [problemMessage, setProblemMessage] = useState<string | null>(null);
  const [problemFilters, setProblemFilters] = useState({ subject: "", topic: "", difficulty: "" });
  const [problemsLoading, setProblemsLoading] = useState(false);
  const [problemsHasMore, setProblemsHasMore] = useState(true);
  const [problemsPage, setProblemsPage] = useState(0);
  const [problemsPageSize, setProblemsPageSize] = useState(20);
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProblem, setEditProblem] = useState<Problem | null>(null);
  const [editForm, setEditForm] = useState({
    subject: "Математик",
    topic: "",
    difficulty: "beginner",
    text: "",
    number: "",
  });
  const [editImageUrls, setEditImageUrls] = useState<Record<string, string>>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editDeleting, setEditDeleting] = useState(false);
  const [editMessage, setEditMessage] = useState<string | null>(null);

  const fetchProblems = async (options?: {
    page?: number;
    pageSize?: number;
    filters?: { subject?: string; topic?: string; difficulty?: string };
  }) => {
    const page = options?.page ?? problemsPage;
    const pageSize = options?.pageSize ?? problemsPageSize;
    const filters = options?.filters ?? problemFilters;
    const token = (session as any)?.accessToken;
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
    setProblemsLoading(true);
    try {
      const params: { subject?: string; topic?: string; difficulty?: string; limit: number; skip: number } = {
        limit: pageSize,
        skip: page * pageSize,
      };
      if (filters.subject?.trim()) params.subject = filters.subject.trim();
      if (filters.topic?.trim()) params.topic = filters.topic.trim();
      if (filters.difficulty) params.difficulty = filters.difficulty;

      const res = await problemsAPI.list(params, config);
      const incoming = res.data;
      setRecentProblems(incoming);
      setProblemsHasMore(incoming.length === pageSize);
      setProblemsPage(page);
    } catch (error) {
      console.error("Failed to fetch problems:", error);
    } finally {
      setProblemsLoading(false);
    }
  };

  useEffect(() => {
    if (!showEditModal || !editProblem) return;

    let active = true;
    const controller = new AbortController();
    const token = (session as any)?.accessToken;
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    const loadImages = async () => {
      setEditLoading(true);
      setEditImageUrls({});
      try {
        const urls: Record<string, string> = {};
        const images = editProblem.images || [];
        await Promise.all(
          images.map(async (img) => {
            if (!img.id) return;
            const res = await fetch(`${API_URL}/api/problems/images/${img.id}`, {
              headers,
              signal: controller.signal,
            });
            if (!res.ok) return;
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            urls[img.id] = url;
          })
        );
        if (active) {
          setEditImageUrls(urls);
        } else {
          Object.values(urls).forEach((url) => URL.revokeObjectURL(url));
        }
      } catch (error) {
        if ((error as any)?.name !== "AbortError") {
          console.error("Failed to load problem images:", error);
        }
      } finally {
        if (active) {
          setEditLoading(false);
        }
      }
    };

    loadImages();

    return () => {
      active = false;
      controller.abort();
      setEditImageUrls((prev) => {
        Object.values(prev).forEach((url) => URL.revokeObjectURL(url));
        return {};
      });
    };
  }, [showEditModal, editProblem, session, API_URL]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }

    // Check if user is admin (you may need to adjust this based on your session structure)
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = (session as any)?.accessToken;
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
        const [
          statsRes,
          topicViewsRes,
          dailyViewsRes,
          userActivityRes,
          suggestionsRes,
          weeklyGrowthRes,
          testPerfRes,
        ] = await Promise.all([
          adminAPI.getStats(config),
          adminAPI.getTopicViews(config),
          adminAPI.getDailyViews(30, config),
          adminAPI.getUserActivity(config),
          adminAPI.getSuggestedTopics(config),
          adminAPI.getWeeklyGrowth(8, config),
          adminAPI.getTestPerformance(config),
        ]);

        setStats(statsRes.data);
        setTopicViews(topicViewsRes.data);
        setDailyViews(dailyViewsRes.data);
        setUserActivity(userActivityRes.data);
        setSuggestions(suggestionsRes.data);
        setWeeklyGrowth(weeklyGrowthRes.data);
        setTestPerformance(testPerfRes.data);
        setProblemsPage(0);
        setProblemsHasMore(true);
        setRecentProblems([]);
        await fetchProblems({ page: 0 });
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Админ Хяналтын Самбар
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Системийн статистик болон аналитик мэдээлэл
            </p>
          </div>
          <button
            type="button"
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            {"Гарах"}
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: "overview", label: "Ерөнхий" },
            { id: "topics", label: "Хичээлүүд" },
            { id: "users", label: "Хэрэглэгчид" },
            { id: "tests", label: "Тестүүд" },
            { id: "problems", label: "Бодлогууд" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Нийт хэрэглэгч</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.total_users || 0}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Нийт хичээл</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.total_topics || 0}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Нийт асуулт</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.total_questions || 0}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">7 хоногт шинэ</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{userActivity?.new_users_week || 0}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Views Chart */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Өдөр тутмын үзэлт (сүүлийн 30 хоног)
                </h3>
                {dailyViews.length > 0 ? (
                  <LineChart
                    data={dailyViews}
                    dataKey="views"
                    labelKey="date"
                    color="#3B82F6"
                  />
                ) : (
                  <p className="text-gray-500 text-center py-8">Мэдээлэл байхгүй байна</p>
                )}
              </Card>

              {/* Weekly Growth Chart */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Долоо хоног тутмын өсөлт
                </h3>
                {weeklyGrowth.length > 0 ? (
                  <BarChart
                    data={weeklyGrowth}
                    dataKey="new_users"
                    labelKey="week"
                    color="#10B981"
                  />
                ) : (
                  <p className="text-gray-500 text-center py-8">Мэдээлэл байхгүй байна</p>
                )}
              </Card>
            </div>

            {/* User Activity Summary */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Хэрэглэгчийн идэвхи
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">{userActivity?.new_users_week || 0}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">7 хоногт шинэ</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">{userActivity?.new_users_month || 0}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">30 хоногт шинэ</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-3xl font-bold text-purple-600">{userActivity?.total_tests || 0}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Нийт тест</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-3xl font-bold text-orange-600">{userActivity?.tests_this_week || 0}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">7 хоногт тест</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Topics Tab */}
        {activeTab === "topics" && (
          <div className="space-y-6">
            {/* Top Viewed Topics */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                🔥 Хамгийн их үзсэн хичээлүүд
              </h3>
              {topicViews.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">#</th>
                        <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Хичээлийн нэр</th>
                        <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Нийт үзэлт</th>
                        <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Давтагдаагүй хэрэглэгч</th>
                        <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Түвшин</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topicViews.map((topic, idx) => (
                        <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{idx + 1}</td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-gray-900 dark:text-white">{topic.topic}</span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="primary">{topic.view_count}</Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                            {topic.unique_users}
                          </td>
                          <td className="py-3 px-4">
                            <Progress value={(topic.view_count / (topicViews[0]?.view_count || 1)) * 100} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Үзэлтийн мэдээлэл байхгүй байна</p>
              )}
            </Card>

            {/* Suggested Topics to Add */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                💡 Нэмэхийг санал болгож буй хичээлүүд
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Хэрэглэгчид хайсан боловч системд байхгүй хичээлүүд
              </p>
              {suggestions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {suggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{suggestion.topic}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {suggestion.unique_users} хэрэглэгч хайсан
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="warning">{suggestion.demand_count} удаа</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>🎉 Бүх хичээлүүд хэрэглэгчдийн хэрэгцээг хангаж байна!</p>
                </div>
              )}
            </Card>

            {/* Topic Views Chart */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Хичээлүүдийн харьцуулалт
              </h3>
              {topicViews.length > 0 ? (
                <BarChart
                  data={topicViews.slice(0, 10)}
                  dataKey="view_count"
                  labelKey="topic"
                  color="#8B5CF6"
                />
              ) : (
                <p className="text-gray-500 text-center py-8">Мэдээлэл байхгүй байна</p>
              )}
            </Card>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            {/* Users by Role */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Хэрэглэгчид үүргээр
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-4xl font-bold text-blue-600">
                    {userActivity?.users_by_role?.student || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Сурагчид</p>
                </div>
                <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-4xl font-bold text-green-600">
                    {userActivity?.users_by_role?.mentor || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Менторууд</p>
                </div>
                <div className="text-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-4xl font-bold text-purple-600">
                    {userActivity?.users_by_role?.admin || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Админууд</p>
                </div>
              </div>
            </Card>

            {/* Growth Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Өсөлтийн статистик
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">7 хоногийн өсөлт</p>
                  <div className="flex items-center gap-4">
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      +{userActivity?.new_users_week || 0}
                    </p>
                    <span className="text-green-500 text-sm">хэрэглэгч</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">30 хоногийн өсөлт</p>
                  <div className="flex items-center gap-4">
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      +{userActivity?.new_users_month || 0}
                    </p>
                    <span className="text-green-500 text-sm">хэрэглэгч</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Weekly Growth Chart */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                8 долоо хоногийн өсөлт
              </h3>
              {weeklyGrowth.length > 0 ? (
                <BarChart
                  data={weeklyGrowth}
                  dataKey="new_users"
                  labelKey="week"
                  color="#3B82F6"
                />
              ) : (
                <p className="text-gray-500 text-center py-8">Мэдээлэл байхгүй байна</p>
              )}
            </Card>
          </div>
        )}

        {/* Tests Tab */}
        {activeTab === "tests" && (
          <div className="space-y-6">
            {/* Test Performance */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Тестийн гүйцэтгэл хичээлээр
              </h3>
              {testPerformance.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Хичээл</th>
                        <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Нийт тест</th>
                        <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Дундаж оноо</th>
                        <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Хамгийн өндөр</th>
                        <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Хамгийн бага</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testPerformance.map((perf, idx) => (
                        <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                            {perf.subject}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                            {perf.total_tests}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={perf.avg_score >= 70 ? "success" : perf.avg_score >= 50 ? "warning" : "error"}>
                              {perf.avg_score}%
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-green-600">{perf.max_score}%</td>
                          <td className="py-3 px-4 text-red-600">{perf.min_score}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Тестийн мэдээлэл байхгүй байна</p>
              )}
            </Card>

            {/* Test Activity */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Тестийн идэвхи
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-4xl font-bold text-blue-600">{userActivity?.total_tests || 0}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Нийт тест өгөлт</p>
                </div>
                <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-4xl font-bold text-green-600">{userActivity?.tests_this_week || 0}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Сүүлийн 7 хоногт</p>
                </div>
              </div>
            </Card>

            {/* Test Performance Chart */}
            {testPerformance.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Хичээлээр харьцуулсан дундаж оноо
                </h3>
                <BarChart
                  data={testPerformance}
                  dataKey="avg_score"
                  labelKey="subject"
                  color="#F59E0B"
                />
              </Card>
            )}
          </div>
        )}

        {/* Problems Tab */}
        {activeTab === "problems" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {"\u0411\u043e\u0434\u043b\u043e\u0433\u0443\u0443\u0434"}
              </h2>
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                onClick={() => {
                  setProblemMessage(null);
                  setShowProblemModal(true);
                }}
              >
                {"\u0411\u043e\u0434\u043b\u043e\u0433\u043e \u043d\u044d\u043c\u044d\u0445"}
              </button>
            </div>
                        {showProblemModal && (
                          <div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                            onClick={(e) => {
                              if (e.target === e.currentTarget) {
                                setShowProblemModal(false);
                              }
                            }}
                          >
                            <div className="w-full max-w-3xl">
                              <Card className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Бодлого нэмэх
                                  </h3>
                                  <button
                                    type="button"
                                    className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 text-sm"
                                    onClick={() => setShowProblemModal(false)}
                                  >
                                    Хаах
                                  </button>
                                </div>
            <form
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!problemForm.topic.trim() || !problemForm.text.trim()) {
                    setProblemMessage("Сэдэв болон бодлогын текст шаардлагатай");
                    return;
                  }

                  setProblemSubmitting(true);
                  setProblemMessage(null);

                  try {
                    const token = (session as any)?.accessToken;
                    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;

                    const uploadedImages: ProblemImage[] = [];
                    for (const file of problemImages) {
                      const uploadRes = await problemsAPI.uploadImage(file, config);
                      uploadedImages.push(uploadRes.data);
                    }

                    await problemsAPI.create(
                      {
                        subject: problemForm.subject,
                        topic: problemForm.topic,
                        difficulty: problemForm.difficulty,
                        text: problemForm.text,
                        images: uploadedImages,
                        number: problemForm.number ? Number(problemForm.number) : undefined,
                      },
                      config
                    );

                    setProblemMessage("Амжилттай нэмлээ");
                    setProblemForm({
                      subject: "Математик",
                      topic: "",
                      difficulty: "beginner",
                      text: "",
                      number: "",
                    });
                    setProblemImages([]);
                    setShowProblemModal(false);

                    setProblemsPage(0);
                    setProblemsHasMore(true);
                    setRecentProblems([]);
                    await fetchProblems({ page: 0 });
                  } catch (err) {
                    console.error("Failed to create problem:", err);
                    setProblemMessage("Алдаа гарлаа. Дахин оролдоорой.");
                  } finally {
                    setProblemSubmitting(false);
                  }
                }}
              >
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Сэдэв</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                    value={problemForm.topic}
                    onChange={(e) => setProblemForm({ ...problemForm, topic: e.target.value })}
                    placeholder="Алгебр / Геометр ..."
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Хүндрэл</label>
                  <select
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                    value={problemForm.difficulty}
                    onChange={(e) => setProblemForm({ ...problemForm, difficulty: e.target.value })}
                  >
                    <option value="beginner">Суурь</option>
                    <option value="intermediate">Дунд</option>
                    <option value="advanced">Ахисан</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Хичээл</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                    value={problemForm.subject}
                    onChange={(e) => setProblemForm({ ...problemForm, subject: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Дугаар</label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                    value={problemForm.number}
                    onChange={(e) => setProblemForm({ ...problemForm, number: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Бодлогын текст</label>
                  <textarea
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm h-32"
                    value={problemForm.text}
                    onChange={(e) => setProblemForm({ ...problemForm, text: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Зураг (хэрэв байвал)</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setProblemImages(e.target.files ? Array.from(e.target.files) : [])}
                    className="block w-full text-sm text-gray-600 dark:text-gray-300"
                  />
                  {problemImages.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Сонгосон зураг: {problemImages.map((f) => f.name).join(", ")}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2 flex items-center justify-between">
                  <button
                    type="submit"
                    disabled={problemSubmitting}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
                  >
                    {problemSubmitting ? "Ачаалж байна..." : "Бодлого нэмэх"}
                  </button>
                  {problemMessage && (
                    <span className="text-sm text-gray-600 dark:text-gray-300">{problemMessage}</span>
                  )}
                </div>
              </form>
                    </Card>
                </div>
              </div>
            )}

                        {showEditModal && editProblem && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setShowEditModal(false);
                  }
                }}
              >
                <div className="w-full max-w-4xl">
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Бодлого засах
                      </h3>
                      <button
                        type="button"
                        className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 text-sm"
                        onClick={() => setShowEditModal(false)}
                      >
                        Хаах
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Хичээл</label>
                        <input
                          type="text"
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                          value={editForm.subject}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, subject: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Сэдэв</label>
                        <input
                          type="text"
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                          value={editForm.topic}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, topic: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Хүндрэл</label>
                        <select
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                          value={editForm.difficulty}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, difficulty: e.target.value }))}
                        >
                          <option value="beginner">Суурь</option>
                          <option value="intermediate">Дунд</option>
                          <option value="advanced">Ахисан</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Дугаар</label>
                        <input
                          type="number"
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                          value={editForm.number}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, number: e.target.value }))}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Бодлогын текст</label>
                        <textarea
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm h-32"
                          value={editForm.text}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, text: e.target.value }))}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Зураг</label>
                        {editLoading ? (
                          <p className="text-xs text-gray-500">Зураг ачаалж байна...</p>
                        ) : editProblem.images && editProblem.images.length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {editProblem.images.map((img) => (
                              <div key={img.id} className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                {editImageUrls[img.id] ? (
                                  <img src={editImageUrls[img.id]} alt={img.filename || "problem"} className="w-full h-32 object-contain bg-white" />
                                ) : (
                                  <div className="w-full h-32 flex items-center justify-center text-xs text-gray-500 bg-gray-50 dark:bg-gray-800">
                                    Зураг олдсонгүй
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500">Зураг байхгүй.</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={editSaving}
                          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
                          onClick={async () => {
                            if (!editProblem) return;
                            if (!editForm.topic.trim() || !editForm.text.trim()) {
                              setEditMessage("Сэдэв болон бодлогын текст шаардлагатай");
                              return;
                            }
                            setEditSaving(true);
                            setEditMessage(null);
                            try {
                              const token = (session as any)?.accessToken;
                              const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
                              const updateRes = await problemsAPI.update(
                                editProblem.id,
                                {
                                  subject: editForm.subject,
                                  topic: editForm.topic,
                                  difficulty: editForm.difficulty,
                                  text: editForm.text,
                                  number: editForm.number ? Number(editForm.number) : undefined,
                                },
                                config
                              );
                              setEditProblem(updateRes.data);
                              await fetchProblems({ page: problemsPage });
                              setEditMessage("Хадгаллаа");
                            } catch (error) {
                              console.error("Failed to update problem:", error);
                              setEditMessage("Алдаа гарлаа. Дахин оролдоорой.");
                            } finally {
                              setEditSaving(false);
                            }
                          }}
                        >
                          {editSaving ? "Хадгалж байна..." : "Хадгалах"}
                        </button>
                        <button
                          type="button"
                          disabled={editDeleting}
                          className="px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 disabled:opacity-60"
                          onClick={async () => {
                            if (!editProblem) return;
                            if (!window.confirm("Энэ бодлогыг устгах уу?")) return;
                            setEditDeleting(true);
                            setEditMessage(null);
                            try {
                              const token = (session as any)?.accessToken;
                              const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
                              await problemsAPI.delete(editProblem.id, config);
                              setShowEditModal(false);
                              setEditProblem(null);
                              await fetchProblems({ page: Math.max(0, problemsPage - 1) });
                            } catch (error) {
                              console.error("Failed to delete problem:", error);
                              setEditMessage("Устгах үед алдаа гарлаа.");
                            } finally {
                              setEditDeleting(false);
                            }
                          }}
                        >
                          {editDeleting ? "Устгаж байна..." : "Устгах"}
                        </button>
                      </div>
                      {editMessage && (
                        <span className="text-sm text-gray-600 dark:text-gray-300">{editMessage}</span>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            )}



            <Card className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Бодлого шүүх
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Хичээл</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                    value={problemFilters.subject}
                    onChange={(e) => setProblemFilters((prev) => ({ ...prev, subject: e.target.value }))}
                    placeholder="Математик"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Сэдэв</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                    value={problemFilters.topic}
                    onChange={(e) => setProblemFilters((prev) => ({ ...prev, topic: e.target.value }))}
                    placeholder="Алгебр / Геометр ..."
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Хүндрэл</label>
                  <select
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                    value={problemFilters.difficulty}
                    onChange={(e) => setProblemFilters((prev) => ({ ...prev, difficulty: e.target.value }))}
                  >
                    <option value="">Бүгд</option>
                    <option value="beginner">Суурь</option>
                    <option value="intermediate">Дунд</option>
                    <option value="advanced">Ахисан</option>
                  </select>
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Хэмжээ</label>
                  <select
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                    value={problemsPageSize}
                    onChange={async (e) => {
                      const nextSize = Number(e.target.value);
                      setProblemsPageSize(nextSize);
                      setProblemsPage(0);
                      setProblemsHasMore(true);
                      setRecentProblems([]);
                      await fetchProblems({ page: 0, pageSize: nextSize });
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
                  disabled={problemsLoading}
                  onClick={async () => {
                    setProblemsPage(0);
                    setProblemsHasMore(true);
                    setRecentProblems([]);
                    await fetchProblems({ page: 0 });
                  }}
                >
                  {problemsLoading ? "Ачаалж байна..." : "Шүүх"}
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200"
                  disabled={problemsLoading}
                  onClick={async () => {
                    const cleared = { subject: "", topic: "", difficulty: "" };
                    setProblemFilters(cleared);
                    setProblemsPage(0);
                    setProblemsHasMore(true);
                    setRecentProblems([]);
                    await fetchProblems({ page: 0, filters: cleared });
                  }}
                >
                  Цэвэрлэх
                </button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Бүх бодлогууд
              </h3>
              {recentProblems.length > 0 ? (
                <div className="space-y-3">
                  {recentProblems.map((problem) => (
                  <div
                    key={problem.id}
                    className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {problem.subject} ? #{problem.number}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{problem.text}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="info" size="sm">{problem.topic}</Badge>
                          <Badge variant="purple" size="sm">{problem.difficulty}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="info" size="sm">{problem.images?.length || 0} зураг</Badge>
                        <button
                          type="button"
                          className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                          onClick={() => {
                            setEditProblem(problem);
                            setEditForm({
                              subject: problem.subject || "Математик",
                              topic: problem.topic || "",
                              difficulty: problem.difficulty || "beginner",
                              text: problem.text || "",
                              number: problem.number ? String(problem.number) : "",
                            });
                            setEditMessage(null);
                            setShowEditModal(true);
                          }}
                          aria-label="Бодлого засах"
                        >
                          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              ) : (
                <p className="text-gray-500">Одоогоор бодлого алга.</p>
              )}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-gray-500">
                  Хуудас {problemsPage + 1}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={problemsPage === 0 || problemsLoading}
                    onClick={() => fetchProblems({ page: Math.max(0, problemsPage - 1) })}
                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium disabled:opacity-60"
                  >
                    Өмнөх
                  </button>
                  <button
                    type="button"
                    disabled={!problemsHasMore || problemsLoading}
                    onClick={() => fetchProblems({ page: problemsPage + 1 })}
                    className="px-3 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-60"
                  >
                    {problemsLoading ? "Ачаалж байна..." : "Дараагийн"}
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
