import Link from "next/link";
import { Navbar, Footer } from "@/components/layout";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  HelpCircle,
  BookOpen,
  MessageCircle,
  ArrowRight,
  FileQuestion,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const faqItems = [
  {
    question: "Roadmap хэрхэн үүсэх вэ?",
    answer: "Эхлээд оношлогооны тест өгсний дараа таны түвшинд таарсан roadmap автоматаар үүснэ.",
  },
  {
    question: "Ментор хэрхэн сонгох вэ?",
    answer: "Менторын хуудаснаас хичээл, үнэлгээ, цагийн боломжоор шүүж өөрт тохирох менторыг сонгоно.",
  },
  {
    question: "Тестийн үр дүн хаана харагдах вэ?",
    answer: "Dashboard дээрх analytics болон test хэсгүүдэд таны сүүлийн үзүүлэлтүүд хадгалагдана.",
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <main className="pt-24 sm:pt-28 pb-16">
        <section className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Help Center
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">Тусламжийн төв</h1>
            <p className="text-gray-600 dark:text-gray-300">
              EYSH ашиглахад хэрэгтэй хамгийн чухал заавар, асуулт хариулт болон хурдан холбоо барих сонголтууд
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  Эхлэх гарын авлага
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Бүртгэл, тест, roadmap, ментортой холбогдох үндсэн алхмууд.
                </p>
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                  Dashboard руу орох
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileQuestion className="w-5 h-5 text-indigo-600" />
                  Түгээмэл асуулт
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Суралцагчдын хамгийн их асуудаг асуултуудын хариулт.
                </p>
                <a href="#faq" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                  FAQ харах
                  <ArrowRight className="w-4 h-4" />
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-emerald-600" />
                  Холбоо барих
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Танд тусламж хэрэгтэй бол манай баг руу шууд холбогдоно уу.
                </p>
                <a
                  href="mailto:info@eysh.mn"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  info@eysh.mn
                  <ArrowRight className="w-4 h-4" />
                </a>
              </CardContent>
            </Card>
          </div>

          <Card id="faq">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                Түгээмэл асуулт хариулт
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqItems.map((item) => (
                <div key={item.question} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/70">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.question}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{item.answer}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="mt-6">
            <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5" />
                    Нэмэлт тусламж хэрэгтэй байна уу?
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">Манай баг 24 цагийн дотор танд хариу өгнө.</p>
                </div>
                <a
                  href="mailto:info@eysh.mn"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white text-blue-700 font-medium hover:bg-blue-50 transition-colors"
                >
                  Имэйл илгээх
                  <ArrowRight className="w-4 h-4" />
                </a>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
