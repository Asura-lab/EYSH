"use client";

import { useState } from "react";
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
} from "lucide-react";

interface QuestionOption {
  id: string;
  text: string;
}

interface Question {
  id: number;
  subject: string;
  topic: string;
  difficulty: string;
  question: string;
  options: QuestionOption[];
  correctAnswer: string;
}

interface TestInfo {
  totalQuestions: number;
  currentQuestion: number;
  timeRemaining: string;
  answered: number[];
  flagged: number[];
}

// Mock test data
const mockQuestion: Question = {
  id: 1,
  subject: "Математик",
  topic: "Квадрат тэгшитгэл",
  difficulty: "Дунд",
  question: "x² - 5x + 6 = 0 тэгшитгэлийн шийдийг ол.",
  options: [
    { id: "a", text: "x₁ = 2, x₂ = 3" },
    { id: "b", text: "x₁ = -2, x₂ = -3" },
    { id: "c", text: "x₁ = 1, x₂ = 6" },
    { id: "d", text: "x₁ = -1, x₂ = -6" },
  ],
  correctAnswer: "a",
};

const testInfo: TestInfo = {
  totalQuestions: 20,
  currentQuestion: 8,
  timeRemaining: "18:45",
  answered: [1, 2, 3, 4, 5, 6, 7],
  flagged: [3, 5],
};

export default function TestPage() {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSubmitAnswer = () => {
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    // TODO: Load next question
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <main className="ml-64 p-8">
        {/* Test Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span className="font-medium">{mockQuestion.subject}</span>
              </div>
              <Badge variant="info">{mockQuestion.topic}</Badge>
              <Badge variant="warning">{mockQuestion.difficulty}</Badge>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <span className="text-sm">Асуулт</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {testInfo.currentQuestion}/{testInfo.totalQuestions}
                </span>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl">
                <Clock className="w-5 h-5" />
                <span className="font-bold font-mono">{testInfo.timeRemaining}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Question Panel */}
          <div className="lg:col-span-3">
            <Card className="mb-6">
              <CardContent>
                {/* Question */}
                <div className="mb-8">
                  <div className="flex items-start gap-4">
                    <span className="w-10 h-10 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center font-bold flex-shrink-0">
                      {testInfo.currentQuestion}
                    </span>
                    <h2 className="text-xl font-medium text-gray-900 dark:text-white leading-relaxed">
                      {mockQuestion.question}
                    </h2>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-4">
                  {mockQuestion.options.map((option) => {
                    const isSelected = selectedAnswer === option.id;
                    const isCorrect = option.id === mockQuestion.correctAnswer;
                    
                    let optionStyle = "border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30";
                    
                    if (showResult) {
                      if (isCorrect) {
                        optionStyle = "border-2 border-green-500 bg-green-50 dark:bg-green-900/30";
                      } else if (isSelected && !isCorrect) {
                        optionStyle = "border-2 border-red-500 bg-red-50 dark:bg-red-900/30";
                      } else {
                        optionStyle = "border-2 border-gray-200 dark:border-gray-700 opacity-50";
                      }
                    } else if (isSelected) {
                      optionStyle = "border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/30";
                    }

                    return (
                      <button
                        key={option.id}
                        onClick={() => !showResult && setSelectedAnswer(option.id)}
                        disabled={showResult}
                        className={`w-full p-4 rounded-xl text-left transition-all ${optionStyle}`}
                      >
                        <div className="flex items-center gap-4">
                          <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                            isSelected ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                          } ${showResult && isCorrect ? "bg-green-600 text-white" : ""}
                          ${showResult && isSelected && !isCorrect ? "bg-red-600 text-white" : ""}`}>
                            {option.id.toUpperCase()}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">{option.text}</span>
                          {showResult && isCorrect && (
                            <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                          )}
                          {showResult && isSelected && !isCorrect && (
                            <XCircle className="w-5 h-5 text-red-600 ml-auto" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Result Explanation */}
                {showResult && (
                  <div className={`mt-6 p-4 rounded-xl ${
                    selectedAnswer === mockQuestion.correctAnswer ? "bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700" : "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700"
                  }`}>
                    <div className="flex items-start gap-3">
                      {selectedAnswer === mockQuestion.correctAnswer ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      )}
                      <div>
                        <p className={`font-medium ${selectedAnswer === mockQuestion.correctAnswer ? "text-green-800" : "text-red-800"}`}>
                          {selectedAnswer === mockQuestion.correctAnswer ? "Зөв хариулт!" : "Буруу хариулт"}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                          Тайлбар: x² - 5x + 6 = 0 тэгшитгэлийг задлахад (x-2)(x-3) = 0 болно. Иймд x₁ = 2, x₂ = 3.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button variant="outline" leftIcon={<ChevronLeft className="w-4 h-4" />}>
                    Өмнөх
                  </Button>

                  <div className="flex gap-3">
                    <Button variant="ghost" leftIcon={<Flag className="w-4 h-4" />}>
                      Тэмдэглэх
                    </Button>
                    
                    {!showResult ? (
                      <Button 
                        onClick={handleSubmitAnswer}
                        disabled={!selectedAnswer}
                      >
                        Шалгах
                      </Button>
                    ) : (
                      <Button onClick={handleNextQuestion} rightIcon={<ChevronRight className="w-4 h-4" />}>
                        Дараагийнх
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Navigator */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Асуултууд</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: testInfo.totalQuestions }).map((_, i) => {
                    const qNum = i + 1;
                    const isAnswered = testInfo.answered.includes(qNum);
                    const isFlagged = testInfo.flagged.includes(qNum);
                    const isCurrent = qNum === testInfo.currentQuestion;

                    return (
                      <button
                        key={qNum}
                        className={`w-10 h-10 rounded-lg font-medium text-sm relative transition-all ${
                          isCurrent
                            ? "bg-blue-600 text-white"
                            : isAnswered
                            ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        {qNum}
                        {isFlagged && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 dark:bg-green-900/50 rounded" />
                    <span className="text-gray-600 dark:text-gray-300">Хариулсан</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-600 rounded" />
                    <span className="text-gray-600 dark:text-gray-300">Одоогийнх</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-100 dark:bg-gray-700 rounded relative">
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full" />
                    </div>
                    <span className="text-gray-600 dark:text-gray-300">Тэмдэглэсэн</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <CardContent>
                <BarChart className="w-8 h-8 mb-3" />
                <p className="font-medium mb-1">Таны явц</p>
                <Progress value={35} max={100} className="mb-2" />
                <p className="text-sm text-blue-100">7 асуултанд хариулсан</p>
              </CardContent>
            </Card>

            <Button variant="danger" className="w-full">
              Тест дуусгах
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
