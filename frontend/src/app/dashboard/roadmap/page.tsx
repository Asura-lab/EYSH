"use client";

import { useState } from "react";
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
} from "lucide-react";

interface Topic {
  id: string;
  title: string;
  duration: string;
  status: "completed" | "current" | "locked";
  lessons: number;
  completedLessons: number;
}

interface Module {
  id: string;
  title: string;
  description: string;
  progress: number;
  topics: Topic[];
  isExpanded: boolean;
}

const initialModules: Module[] = [
  {
    id: "1",
    title: "Алгебр үндэс",
    description: "Тэгшитгэл, функц, олон гишүүнт",
    progress: 100,
    isExpanded: false,
    topics: [
      { id: "1-1", title: "Шугаман тэгшитгэл", duration: "2 цаг", status: "completed", lessons: 5, completedLessons: 5 },
      { id: "1-2", title: "Квадрат тэгшитгэл", duration: "3 цаг", status: "completed", lessons: 7, completedLessons: 7 },
      { id: "1-3", title: "Олон гишүүнт", duration: "2.5 цаг", status: "completed", lessons: 6, completedLessons: 6 },
    ],
  },
  {
    id: "2",
    title: "Функц ба график",
    description: "Функцийн төрлүүд, хувиргалт, шинжилгээ",
    progress: 65,
    isExpanded: true,
    topics: [
      { id: "2-1", title: "Шугаман функц", duration: "2 цаг", status: "completed", lessons: 4, completedLessons: 4 },
      { id: "2-2", title: "Квадрат функц", duration: "3 цаг", status: "completed", lessons: 6, completedLessons: 6 },
      { id: "2-3", title: "Функцийн хувиргалт", duration: "2 цаг", status: "current", lessons: 5, completedLessons: 2 },
      { id: "2-4", title: "Урвуу функц", duration: "2 цаг", status: "locked", lessons: 4, completedLessons: 0 },
    ],
  },
  {
    id: "3",
    title: "Тригонометр",
    description: "Тригонометрийн функц, тэгшитгэл",
    progress: 0,
    isExpanded: false,
    topics: [
      { id: "3-1", title: "Тригонометрийн үндэс", duration: "3 цаг", status: "locked", lessons: 6, completedLessons: 0 },
      { id: "3-2", title: "Тригонометрийн тэгшитгэл", duration: "4 цаг", status: "locked", lessons: 8, completedLessons: 0 },
      { id: "3-3", title: "Тригонометрийн хувиргалт", duration: "3 цаг", status: "locked", lessons: 7, completedLessons: 0 },
    ],
  },
  {
    id: "4",
    title: "Геометр",
    description: "Хавтгай ба орон зайн геометр",
    progress: 0,
    isExpanded: false,
    topics: [
      { id: "4-1", title: "Гурвалжин", duration: "3 цаг", status: "locked", lessons: 6, completedLessons: 0 },
      { id: "4-2", title: "Дөрвөн өнцөгт", duration: "2 цаг", status: "locked", lessons: 5, completedLessons: 0 },
      { id: "4-3", title: "Тойрог", duration: "3 цаг", status: "locked", lessons: 7, completedLessons: 0 },
    ],
  },
];

export default function RoadmapPage() {
  const [modules, setModules] = useState<Module[]>(initialModules);

  const toggleModule = (id: string) => {
    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isExpanded: !m.isExpanded } : m))
    );
  };

  const totalProgress = Math.round(
    modules.reduce((acc, m) => acc + m.progress, 0) / modules.length
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <main className="lg:ml-72 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
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
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">12</p>
                <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">Дуусгасан сэдэв</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <Play className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">1</p>
                <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">Идэвхтэй сэдэв</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">24.5</p>
                <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">Нийт цаг</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 dark:bg-orange-900/50 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">85%</p>
                <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">Зорилгын биелэлт</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Roadmap */}
        <div className="space-y-4 sm:space-y-6">
          {modules.map((module, moduleIndex) => (
            <Card key={module.id} className="overflow-hidden">
              {/* Module Header */}
              <button
                onClick={() => toggleModule(module.id)}
                className="w-full p-6 flex items-center gap-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                {/* Module Number */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl flex-shrink-0 ${
                    module.progress === 100
                      ? "bg-green-100 dark:bg-green-900/50 text-green-600"
                      : module.progress > 0
                      ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-400"
                  }`}
                >
                  {module.progress === 100 ? (
                    <CheckCircle className="w-7 h-7" />
                  ) : (
                    moduleIndex + 1
                  )}
                </div>

                {/* Module Info */}
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{module.title}</h3>
                    {module.progress === 100 && (
                      <Badge variant="success" size="sm">Дуусгасан</Badge>
                    )}
                    {module.progress > 0 && module.progress < 100 && (
                      <Badge variant="info" size="sm">Явагдаж буй</Badge>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">{module.description}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <BookOpen className="w-4 h-4" />
                      <span>{module.topics.length} сэдэв</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>
                        {module.topics.reduce((acc, t) => acc + parseFloat(t.duration), 0)} цаг
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="w-40 flex-shrink-0">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-300">Явц</span>
                    <span className="font-bold text-gray-900 dark:text-white">{module.progress}%</span>
                  </div>
                  <Progress
                    value={module.progress}
                    variant={module.progress === 100 ? "success" : "gradient"}
                    size="md"
                  />
                </div>

                {/* Expand Button */}
                <div className="flex-shrink-0">
                  {module.isExpanded ? (
                    <ChevronUp className="w-6 h-6 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Topics */}
              {module.isExpanded && (
                <div className="px-6 pb-6">
                  <div className="border-t border-gray-100 dark:border-gray-700 pt-6 space-y-3">
                    {module.topics.map((topic, topicIndex) => (
                      <div
                        key={topic.id}
                        className={`flex items-center gap-4 p-4 rounded-xl transition ${
                          topic.status === "current"
                            ? "bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-700"
                            : topic.status === "completed"
                            ? "bg-gray-50 dark:bg-gray-800"
                            : "bg-gray-50 dark:bg-gray-800 opacity-60"
                        }`}
                      >
                        {/* Status Icon */}
                        <div className="flex-shrink-0">
                          {topic.status === "completed" ? (
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                          ) : topic.status === "current" ? (
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                              <Play className="w-5 h-5 text-blue-600" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                              <Lock className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Topic Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">{topic.title}</h4>
                            {topic.status === "current" && (
                              <Badge variant="info" size="sm">
                                <Zap className="w-3 h-3 mr-1" />
                                Одоо суралцаж байна
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                            <span>{topic.duration}</span>
                            <span>•</span>
                            <span>{topic.completedLessons}/{topic.lessons} хичээл</span>
                          </div>
                        </div>

                        {/* Progress / Action */}
                        <div className="flex-shrink-0">
                          {topic.status === "completed" ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="font-medium">100%</span>
                            </div>
                          ) : topic.status === "current" ? (
                            <Button size="sm">Үргэлжлүүлэх</Button>
                          ) : (
                            <Button size="sm" variant="ghost" disabled>
                              Түгжээтэй
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
