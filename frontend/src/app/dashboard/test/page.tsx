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
  Clock,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen,
  BarChart,
  Flag,
  Loader2,
  Trophy,
  Target,
  AlertTriangle,
  Zap,
  GraduationCap,
  TrendingUp,
  Timer,
  PieChart,
} from "lucide-react";
import { useSidebar } from "@/components/providers/SidebarProvider";

interface Question {
  id: string;
  subject: string;
  topic: string;
  topic_mn: string;
  difficulty: number;
  content: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  time_limit: number;
}

interface Answer {
  question_id: string;
  answer: number;
  time_spent: number;
  is_correct?: boolean;
}

interface TestResult {
  score: number;
  total_questions: number;
  correct_count: number;
  predicted_level: number;
  weak_topics: string[];
  topic_stats?: Record<string, { correct: number; total: number; percentage: number }>;
  difficulty_stats?: Record<string, { correct: number; total: number; percentage: number }>;
  avg_time_per_question?: number;
  fastest_topic?: string;
  slowest_topic?: string;
}

type TestMode = "quick" | "full" | null;

interface TestModeConfig {
  questions: number;
  time: number; // minutes
  title: string;
  description: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Mock questions for fallback
const mockQuestions: Question[] = [
  {
    id: "1",
    subject: "Математик",
    topic: "algebra",
    topic_mn: "Алгебр",
    difficulty: 2,
    content: "x² - 5x + 6 = 0 тэгшитгэлийн шийдүүдийг ол.",
    options: ["x = 1, x = 6", "x = 2, x = 3", "x = -2, x = -3", "x = 1, x = 5"],
    correct_answer: 1,
    explanation: "(x-2)(x-3) = 0, тиймээс x = 2 эсвэл x = 3",
    time_limit: 90
  },
  {
    id: "2",
    subject: "Математик",
    topic: "geometry",
    topic_mn: "Геометр",
    difficulty: 1,
    content: "Тал нь 5 см урттай квадратын талбай хэд вэ?",
    options: ["20 см²", "25 см²", "10 см²", "15 см²"],
    correct_answer: 1,
    explanation: "S = a² = 5² = 25 см²",
    time_limit: 45
  },
  {
    id: "3",
    subject: "Математик",
    topic: "trigonometry",
    topic_mn: "Тригонометр",
    difficulty: 2,
    content: "sin(30°) + cos(60°) = ?",
    options: ["1", "0.5", "1.5", "0"],
    correct_answer: 0,
    explanation: "sin(30°) = 0.5, cos(60°) = 0.5, нийлбэр = 1",
    time_limit: 45
  },
  {
    id: "4",
    subject: "Математик",
    topic: "probability",
    topic_mn: "Магадлал",
    difficulty: 1,
    content: "Нэг шоо хаяхад 6 буух магадлал ямар вэ?",
    options: ["1/6", "1/3", "1/2", "1/4"],
    correct_answer: 0,
    explanation: "Шоо нь 6 талтай, 6 буух магадлал = 1/6",
    time_limit: 30
  },
  {
    id: "5",
    subject: "Математик",
    topic: "calculus",
    topic_mn: "Анализ",
    difficulty: 2,
    content: "f(x) = x³ - 3x функцийн уламжлалыг ол.",
    options: ["3x² - 3", "3x² + 3", "x² - 3", "2x² - 3"],
    correct_answer: 0,
    explanation: "f'(x) = 3x² - 3",
    time_limit: 60
  }
];

export default function TestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { collapsed } = useSidebar();

  // Test mode config
  const testModes: Record<string, TestModeConfig> = {
    quick: {
      questions: 10,
      time: 15,
      title: "Түргэн тест",
      description: "Хурдан үнэлгээ авах"
    },
    full: {
      questions: 30,
      time: 60,
      title: "Бүрэн тест",
      description: "Нарийвчилсан дүгнэлт"
    }
  };

  // States
  const [loading, setLoading] = useState(true);
  const [testMode, setTestMode] = useState<TestMode>(null);
  const [testStarted, setTestStarted] = useState(false);
  const [testFinished, setTestFinished] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [flagged, setFlagged] = useState<number[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [result, setResult] = useState<TestResult | null>(null);

  // Check auth
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" || status === "loading") {
      setLoading(false);
    }
  }, [status, router]);

  // Timer
  useEffect(() => {
    if (!testStarted || testFinished) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleFinishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, testFinished]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const fetchQuestions = async (count: number) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/tests/questions?count=${count}`);

      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setQuestions(data);
        } else {
          // Repeat mock questions if needed
          const repeated = [];
          for (let i = 0; i < count; i++) {
            repeated.push({
              ...mockQuestions[i % mockQuestions.length],
              id: `${i + 1}`
            });
          }
          setQuestions(repeated);
        }
      } else {
        const repeated = [];
        for (let i = 0; i < count; i++) {
          repeated.push({
            ...mockQuestions[i % mockQuestions.length],
            id: `${i + 1}`
          });
        }
        setQuestions(repeated);
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error);
      const repeated = [];
      for (let i = 0; i < count; i++) {
        repeated.push({
          ...mockQuestions[i % mockQuestions.length],
          id: `${i + 1}`
        });
      }
      setQuestions(repeated);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMode = (mode: TestMode) => {
    setTestMode(mode);
  };

  const handleStartTest = async () => {
    if (!testMode) return;
    const config = testModes[testMode];
    setTimeRemaining(config.time * 60);
    await fetchQuestions(config.questions);
    setTestStarted(true);
    setQuestionStartTime(Date.now());
  };

  const handleSelectAnswer = (index: number) => {
    setSelectedAnswer(index);
  };

  const saveCurrentAnswer = () => {
    if (selectedAnswer !== null && questions[currentIndex]) {
      const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
      const currentQuestion = questions[currentIndex];

      const answer: Answer = {
        question_id: currentQuestion.id,
        answer: selectedAnswer,
        time_spent: timeSpent,
        is_correct: selectedAnswer === currentQuestion.correct_answer
      };

      setAnswers((prev) => {
        const existing = prev.findIndex(a => a.question_id === currentQuestion.id);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = answer;
          return updated;
        }
        return [...prev, answer];
      });
    }
  };

  const handleNextQuestion = () => {
    saveCurrentAnswer();

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      const nextAnswer = answers.find(a => a.question_id === questions[currentIndex + 1]?.id);
      setSelectedAnswer(nextAnswer?.answer ?? null);
      setQuestionStartTime(Date.now());
    }
  };

  const handlePrevQuestion = () => {
    saveCurrentAnswer();

    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      const prevAnswer = answers.find(a => a.question_id === questions[currentIndex - 1]?.id);
      setSelectedAnswer(prevAnswer?.answer ?? null);
      setQuestionStartTime(Date.now());
    }
  };

  const handleToggleFlag = () => {
    setFlagged((prev) =>
      prev.includes(currentIndex)
        ? prev.filter(i => i !== currentIndex)
        : [...prev, currentIndex]
    );
  };

  const handleGoToQuestion = (index: number) => {
    saveCurrentAnswer();
    setCurrentIndex(index);
    const existingAnswer = answers.find(a => a.question_id === questions[index]?.id);
    setSelectedAnswer(existingAnswer?.answer ?? null);
    setQuestionStartTime(Date.now());
  };

  const calculateResult = (finalAnswers: Answer[]) => {
    const correctCount = finalAnswers.filter(a => a.is_correct).length;
    const score = questions.length > 0 ? (correctCount / questions.length) * 100 : 0;

    let predictedLevel = 5;
    if (score >= 90) predictedLevel = 10;
    else if (score >= 80) predictedLevel = 8;
    else if (score >= 70) predictedLevel = 7;
    else if (score >= 60) predictedLevel = 6;
    else if (score >= 50) predictedLevel = 5;
    else if (score >= 40) predictedLevel = 4;
    else if (score >= 30) predictedLevel = 3;
    else predictedLevel = 2;

    // Topic statistics
    const topicResults: Record<string, { correct: number; total: number; totalTime: number }> = {};
    finalAnswers.forEach((answer) => {
      const q = questions.find(q => q.id === answer.question_id);
      if (q) {
        if (!topicResults[q.topic_mn]) {
          topicResults[q.topic_mn] = { correct: 0, total: 0, totalTime: 0 };
        }
        topicResults[q.topic_mn].total++;
        topicResults[q.topic_mn].totalTime += answer.time_spent;
        if (answer.is_correct) {
          topicResults[q.topic_mn].correct++;
        }
      }
    });

    // Difficulty statistics
    const difficultyResults: Record<string, { correct: number; total: number }> = {
      "Амархан": { correct: 0, total: 0 },
      "Дунд": { correct: 0, total: 0 },
      "Хүнд": { correct: 0, total: 0 }
    };
    finalAnswers.forEach((answer) => {
      const q = questions.find(q => q.id === answer.question_id);
      if (q) {
        const diffLabel = q.difficulty === 1 ? "Амархан" : q.difficulty === 2 ? "Дунд" : "Хүнд";
        difficultyResults[diffLabel].total++;
        if (answer.is_correct) {
          difficultyResults[diffLabel].correct++;
        }
      }
    });

    const weakTopics = Object.entries(topicResults)
      .filter(([_, stats]) => stats.total > 0 && stats.correct / stats.total < 0.5)
      .map(([topic]) => topic);

    // Calculate topic stats with percentage
    const topic_stats: Record<string, { correct: number; total: number; percentage: number }> = {};
    Object.entries(topicResults).forEach(([topic, stats]) => {
      topic_stats[topic] = {
        correct: stats.correct,
        total: stats.total,
        percentage: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
      };
    });

    // Calculate difficulty stats with percentage
    const difficulty_stats: Record<string, { correct: number; total: number; percentage: number }> = {};
    Object.entries(difficultyResults).forEach(([diff, stats]) => {
      difficulty_stats[diff] = {
        correct: stats.correct,
        total: stats.total,
        percentage: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
      };
    });

    // Average time per question
    const totalTime = finalAnswers.reduce((sum, a) => sum + a.time_spent, 0);
    const avg_time_per_question = finalAnswers.length > 0 ? Math.round(totalTime / finalAnswers.length) : 0;

    // Fastest and slowest topics
    let fastest_topic = "";
    let slowest_topic = "";
    let minAvgTime = Infinity;
    let maxAvgTime = 0;
    Object.entries(topicResults).forEach(([topic, stats]) => {
      if (stats.total > 0) {
        const avgTime = stats.totalTime / stats.total;
        if (avgTime < minAvgTime) {
          minAvgTime = avgTime;
          fastest_topic = topic;
        }
        if (avgTime > maxAvgTime) {
          maxAvgTime = avgTime;
          slowest_topic = topic;
        }
      }
    });

    setResult({
      score,
      total_questions: questions.length,
      correct_count: correctCount,
      predicted_level: predictedLevel,
      weak_topics: weakTopics,
      topic_stats,
      difficulty_stats,
      avg_time_per_question,
      fastest_topic,
      slowest_topic
    });
  };

  const submitTestToBackend = async (finalAnswers: Answer[]) => {
    try {
      const token = (session as any)?.accessToken;

      // Format answers for backend
      const formattedAnswers = finalAnswers.map(a => ({
        question_id: a.question_id,
        answer: a.answer,
        time_spent: a.time_spent
      }));

      // Submit test to backend
      const submitRes = await fetch(`${API_URL}/api/tests/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ answers: formattedAnswers })
      });

      if (submitRes.ok) {
        const backendResult = await submitRes.json();
        console.log("Backend result:", backendResult);

        // Generate roadmap after test
        const roadmapRes = await fetch(`${API_URL}/api/roadmap/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
          }
        });

        if (roadmapRes.ok) {
          console.log("Roadmap generated successfully");
        }

        return backendResult;
      }
    } catch (error) {
      console.error("Failed to submit test to backend:", error);
    }
    return null;
  };

  const handleFinishTest = async () => {
    saveCurrentAnswer();
    setLoading(true);

    setTimeout(async () => {
      setAnswers((currentAnswers) => {
        // Calculate local result first
        calculateResult(currentAnswers);

        // Submit to backend (async, don't wait)
        submitTestToBackend(currentAnswers);

        return currentAnswers;
      });
      setLoading(false);
      setTestFinished(true);
    }, 100);
  };

  const currentQuestion = questions[currentIndex];
  const answeredQuestions = answers.map(a => questions.findIndex(q => q.id === a.question_id));

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Start screen - Mode Selection
  if (!testStarted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <main className={`p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 transition-all duration-300 ${collapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Оношлогооны тест
              </h1>
              <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                Тестийн төрөл сонгоно уу
              </p>
            </div>

            {/* Test Mode Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Quick Test */}
              <div
                onClick={() => handleSelectMode("quick")}
                className={`cursor-pointer p-6 rounded-2xl border-2 transition-all ${testMode === "quick"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                  : "border-gray-200 dark:border-gray-700 hover:border-blue-300 bg-white dark:bg-gray-800"
                  }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Түргэн тест</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Хурдан үнэлгээ авах</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
                    <p className="text-lg font-bold text-blue-600">10</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Асуулт</p>
                  </div>
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
                    <p className="text-lg font-bold text-green-600">15</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Минут</p>
                  </div>
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
                    <p className="text-lg font-bold text-purple-600">8</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Сэдэв</p>
                  </div>
                </div>

                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Хурдан түвшин тодорхойлох
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Үндсэн дүгнэлт
                  </li>
                </ul>
              </div>

              {/* Full Test */}
              <div
                onClick={() => handleSelectMode("full")}
                className={`cursor-pointer p-6 rounded-2xl border-2 transition-all relative overflow-hidden ${testMode === "full"
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30"
                  : "border-gray-200 dark:border-gray-700 hover:border-purple-300 bg-white dark:bg-gray-800"
                  }`}
              >
                <div className="absolute top-3 right-3">
                  <Badge variant="purple" className="text-xs">Санал болгох</Badge>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                    <GraduationCap className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Бүрэн тест</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Нарийвчилсан дүгнэлт</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
                    <p className="text-lg font-bold text-blue-600">30</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Асуулт</p>
                  </div>
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
                    <p className="text-lg font-bold text-green-600">60</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Минут</p>
                  </div>
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
                    <p className="text-lg font-bold text-purple-600">8</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Сэдэв</p>
                  </div>
                </div>

                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Сэдэв бүрийн нарийн дүн шинжилгээ
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Хугацааны статистик
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Хүндрэлийн түвшний шинжилгээ
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Хувийн roadmap гаргах
                  </li>
                </ul>
              </div>
            </div>

            {/* Start Button */}
            <div className="text-center">
              <button
                onClick={handleStartTest}
                disabled={!testMode}
                className={`px-10 py-4 font-medium rounded-xl transition-all text-lg ${testMode
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                  }`}
              >
                {testMode ? `${testModes[testMode].title} эхлүүлэх` : "Тестийн төрөл сонгоно уу"}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Result screen
  if (testFinished && result) {
    const isFullTest = testMode === "full";

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <main className={`p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 transition-all duration-300 ${collapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
          <div className={`mx-auto ${isFullTest ? "max-w-5xl" : "max-w-2xl"}`}>
            {/* Header Card */}
            <Card className="mb-6">
              <CardContent className="py-8 text-center">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${result.score >= 70
                  ? "bg-green-100 dark:bg-green-900/50"
                  : result.score >= 50
                    ? "bg-yellow-100 dark:bg-yellow-900/50"
                    : "bg-red-100 dark:bg-red-900/50"
                  }`}>
                  {result.score >= 70 ? (
                    <Trophy className="w-12 h-12 text-green-600" />
                  ) : result.score >= 50 ? (
                    <Target className="w-12 h-12 text-yellow-600" />
                  ) : (
                    <AlertTriangle className="w-12 h-12 text-red-600" />
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {isFullTest ? "Бүрэн тест дууслаа!" : "Түргэн тест дууслаа!"}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {result.score >= 70 ? "Маш сайн байна!" : result.score >= 50 ? "Дунд зэрэг" : "Дадлага хийх шаардлагатай"}
                </p>

                {/* Main Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                    <p className="text-3xl font-bold text-blue-600">{Math.round(result.score)}%</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Оноо</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-xl">
                    <p className="text-3xl font-bold text-green-600">{result.correct_count}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Зөв</p>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-xl">
                    <p className="text-3xl font-bold text-red-600">{result.total_questions - result.correct_count}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Буруу</p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
                    <p className="text-3xl font-bold text-purple-600">{result.predicted_level}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Түвшин</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Analysis for Full Test */}
            {isFullTest && (
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Topic Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-blue-600" />
                      Сэдэв бүрийн дүн
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {result.topic_stats && Object.entries(result.topic_stats).map(([topic, stats]) => (
                        <div key={topic}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700 dark:text-gray-300">{topic}</span>
                            <span className={`font-bold ${stats.percentage >= 70 ? "text-green-600" :
                              stats.percentage >= 50 ? "text-yellow-600" : "text-red-600"
                              }`}>
                              {stats.correct}/{stats.total} ({stats.percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${stats.percentage >= 70 ? "bg-green-500" :
                                stats.percentage >= 50 ? "bg-yellow-500" : "bg-red-500"
                                }`}
                              style={{ width: `${stats.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Difficulty Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      Хүндрэлийн түвшин
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.difficulty_stats && Object.entries(result.difficulty_stats).map(([diff, stats]) => (
                        <div key={diff} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <div className="flex items-center gap-3">
                            <Badge variant={diff === "Амархан" ? "success" : diff === "Дунд" ? "warning" : "danger"}>
                              {diff}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold ${stats.percentage >= 70 ? "text-green-600" :
                              stats.percentage >= 50 ? "text-yellow-600" : "text-red-600"
                              }`}>
                              {stats.percentage}%
                            </p>
                            <p className="text-xs text-gray-500">{stats.correct}/{stats.total} зөв</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Time Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Timer className="w-5 h-5 text-green-600" />
                      Хугацааны статистик
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-center">
                        <p className="text-3xl font-bold text-blue-600">
                          {result.avg_time_per_question}с
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Дундаж хугацаа / асуулт
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl text-center">
                          <Zap className="w-5 h-5 text-green-600 mx-auto mb-1" />
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Хамгийн хурдан</p>
                          <p className="text-xs text-green-600 font-bold">{result.fastest_topic || "-"}</p>
                        </div>
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/30 rounded-xl text-center">
                          <Clock className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Хамгийн удаан</p>
                          <p className="text-xs text-orange-600 font-bold">{result.slowest_topic || "-"}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Weak Topics & Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      Зөвлөмж
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {result.weak_topics.length > 0 ? (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                          Дараах сэдвүүдэд анхаарал хандуулах хэрэгтэй:
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {result.weak_topics.map((topic, i) => (
                            <Badge key={i} variant="warning">{topic}</Badge>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Эдгээр сэдвүүдээр 50%-иас доош оноо авсан байна.
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                        <p className="text-green-600 font-medium">Бүх сэдвээр сайн!</p>
                        <p className="text-sm text-gray-500">Хичээлээ үргэлжлүүлээрэй</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Simple weak topics for quick test */}
            {!isFullTest && result.weak_topics.length > 0 && (
              <Card className="mb-6">
                <CardContent className="py-6">
                  <p className="font-medium text-orange-800 dark:text-orange-300 mb-3 text-center">
                    Анхаарах сэдвүүд:
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {result.weak_topics.map((topic, i) => (
                      <Badge key={i} variant="warning">{topic}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" onClick={() => {
                setTestStarted(false);
                setTestFinished(false);
                setTestMode(null);
                setQuestions([]);
                setAnswers([]);
                setCurrentIndex(0);
                setResult(null);
              }}>
                Дахин тест өгөх
              </Button>
              <Button variant="outline" onClick={() => router.push("/dashboard")}>
                Dashboard руу буцах
              </Button>
              <Button onClick={() => router.push("/dashboard/roadmap")}>
                Сургалтын төлөвлөгөө харах
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Test in progress - check if we have questions
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty === 1) return "Амархан";
    if (difficulty === 2) return "Дунд";
    return "Хүнд";
  };

  const getDifficultyVariant = (difficulty: number): "success" | "warning" | "danger" => {
    if (difficulty === 1) return "success";
    if (difficulty === 2) return "warning";
    return "danger";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <main className={`p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 transition-all duration-300 ${collapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        {/* Test Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 mb-4 sm:mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 lg:gap-6">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <span className="text-sm sm:text-base font-medium">{currentQuestion.subject}</span>
              </div>
              <Badge variant="info" className="text-xs sm:text-sm">{currentQuestion.topic_mn}</Badge>
              <Badge variant={getDifficultyVariant(currentQuestion.difficulty)} className="text-xs sm:text-sm">
                {getDifficultyLabel(currentQuestion.difficulty)}
              </Badge>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <span className="text-xs sm:text-sm">Асуулт</span>
                <span className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                  {currentIndex + 1}/{questions.length}
                </span>
              </div>

              <div className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl ${timeRemaining < 300 ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                }`}>
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-bold font-mono text-sm sm:text-base">{formatTime(timeRemaining)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Question Panel */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <Card className="mb-4 sm:mb-6">
              <CardContent>
                {/* Question */}
                <div className="mb-6 sm:mb-8">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <span className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0">
                      {currentIndex + 1}
                    </span>
                    <h2 className="text-base sm:text-lg lg:text-xl font-medium text-gray-900 dark:text-white leading-relaxed">
                      {currentQuestion.content}
                    </h2>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-3 sm:space-y-4">
                  {currentQuestion.options.map((option, i) => {
                    const isSelected = selectedAnswer === i;
                    const optionLetter = String.fromCharCode(65 + i);

                    return (
                      <button
                        key={i}
                        onClick={() => handleSelectAnswer(i)}
                        className={`w-full p-4 rounded-xl text-left transition-all border-2 ${isSelected
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                          : "border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${isSelected ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                            }`}>
                            {optionLetter}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">{option}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="outline"
                    leftIcon={<ChevronLeft className="w-4 h-4" />}
                    onClick={handlePrevQuestion}
                    disabled={currentIndex === 0}
                  >
                    Өмнөх
                  </Button>

                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      leftIcon={<Flag className={`w-4 h-4 ${flagged.includes(currentIndex) ? "text-orange-500" : ""}`} />}
                      onClick={handleToggleFlag}
                    >
                      {flagged.includes(currentIndex) ? "Болих" : "Тэмдэглэх"}
                    </Button>

                    {currentIndex < questions.length - 1 ? (
                      <Button
                        onClick={handleNextQuestion}
                        rightIcon={<ChevronRight className="w-4 h-4" />}
                      >
                        Дараагийнх
                      </Button>
                    ) : (
                      <Button onClick={handleFinishTest}>
                        Дуусгах
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Navigator */}
          <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm sm:text-base">Асуултууд</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 sm:grid-cols-10 lg:grid-cols-5 gap-1.5 sm:gap-2">
                  {questions.map((_, i) => {
                    const isAnswered = answeredQuestions.includes(i);
                    const isFlagged = flagged.includes(i);
                    const isCurrent = i === currentIndex;

                    return (
                      <button
                        key={i}
                        onClick={() => handleGoToQuestion(i)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-medium text-xs sm:text-sm relative transition-all ${isCurrent
                          ? "bg-blue-600 text-white"
                          : isAnswered
                            ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                          }`}
                      >
                        {i + 1}
                        {isFlagged && (
                          <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2 h-2 sm:w-3 sm:h-3 bg-orange-500 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 sm:mt-6 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-100 dark:bg-green-900/50 rounded" />
                    <span className="text-gray-600 dark:text-gray-300">Хариулсан ({answers.length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-600 rounded" />
                    <span className="text-gray-600 dark:text-gray-300">Одоогийнх</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-100 dark:bg-gray-700 rounded relative">
                      <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full" />
                    </div>
                    <span className="text-gray-600 dark:text-gray-300">Тэмдэглэсэн ({flagged.length})</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white hidden lg:block">
              <CardContent>
                <BarChart className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3" />
                <p className="font-medium text-sm sm:text-base mb-1">Таны явц</p>
                <Progress value={(answers.length / questions.length) * 100} max={100} className="mb-2" />
                <p className="text-xs sm:text-sm text-blue-100">{answers.length} асуултанд хариулсан</p>
              </CardContent>
            </Card>

            <Button variant="danger" className="w-full text-sm sm:text-base" onClick={handleFinishTest}>
              Тест дуусгах
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
