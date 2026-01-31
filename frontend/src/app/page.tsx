import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  GraduationCap,
  Brain,
  Route,
  Users,
  ChevronRight,
  Star,
  Zap,
  Target,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Play,
} from "lucide-react";
import { Navbar, Footer } from "@/components/layout";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

interface Stat {
  value: string;
  label: string;
}

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
}

interface Step {
  step: number;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Brain,
    title: "AI Түвшин Тодорхойлолт",
    description: "Таны одоогийн мэдлэгийн түвшинг AI ашиглан нарийвчлан тодорхойлно.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Target,
    title: "Сул Тал Олох",
    description: "Ямар сэдэвт сайжруулалт хэрэгтэйг тодорхойлж, анхаарах хэсгүүдийг зааж өгнө.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Route,
    title: "Хувийн Roadmap",
    description: "Танд зориулсан сургалтын төлөвлөгөө үүсгэж, алхам алхмаар дагуулна.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Users,
    title: "Mentor Холболт",
    description: "Дээд курсийн ах эгч нартай холбогдож, туршлагаас нь суралцаарай.",
    color: "from-green-500 to-emerald-500",
  },
];

const stats: Stat[] = [
  { value: "5,000+", label: "Сурагчид" },
  { value: "500+", label: "Менторууд" },
  { value: "95%", label: "Элсэлтийн хувь" },
  { value: "4.9", label: "Үнэлгээ" },
];

const testimonials: Testimonial[] = [
  {
    name: "Нармандах Б.",
    role: "МУИС-д элссэн",
    content: "EYSH надад яг хэрэгтэй байсан зүйл байсан. AI roadmap маань яг миний сул талд тохирсон байсан.",
    rating: 5,
  },
  {
    name: "Сарангоо Д.",
    role: "ШУТИС-д элссэн",
    content: "Ментороос авсан зөвлөгөө маш их тус болсон. Элсэлтийн шалгалтанд итгэлтэй орсон.",
    rating: 5,
  },
  {
    name: "Тэмүүлэн О.",
    role: "Анагаах-д элссэн",
    content: "Adaptive test систем үнэхээр гайхалтай! Миний түвшинд яг тохирсон асуултууд өгсөн.",
    rating: 5,
  },
];

const steps: Step[] = [
  { step: 1, title: "Бүртгүүлэх", description: "Үнэгүй бүртгүүлээд тестээ эхлүүлээрэй" },
  { step: 2, title: "Тест өгөх", description: "AI таны түвшинг тодорхойлно" },
  { step: 3, title: "Roadmap авах", description: "Хувийн сургалтын төлөвлөгөө үүснэ" },
  { step: 4, title: "Суралцах", description: "Ментортой хамт зорилгодоо хүрээрэй" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 overflow-hidden relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="info" size="lg" className="mb-6">
              <Zap className="w-4 h-4 mr-1" />
              AI-д суурилсан сургалтын платформ
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Элсэлтийн шалгалтанд
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                хамгийн ухаалаг бэлтгэл
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
              AI таны түвшинг тодорхойлж, сул талыг олж, хувь хүнд тохирсон сургалтын төлөвлөгөө үүсгэнэ.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Эхлэх
                </Button>
              </Link>
              <Button variant="outline" size="lg" leftIcon={<Play className="w-5 h-5" />}>
                Видео үзэх
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-10 border-t border-gray-200 dark:border-gray-700">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="purple" className="mb-4">Онцлогууд</Badge>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Яагаад EYSH сонгох вэ?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Бид хамгийн орчин үеийн технологиор таныг элсэлтийн шалгалтанд бэлддэг.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} hover className="text-center group">
                  <div
                    className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center transform group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="success" className="mb-4">Хэрхэн ажилладаг</Badge>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              4 энгийн алхам
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((item, index) => (
              <div key={item.step} className="relative">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/25">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="hidden md:block absolute top-8 -right-4 w-8 h-8 text-gray-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="warning" className="mb-4">Сэтгэгдлүүд</Badge>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Сурагчдын үнэлгээ
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} variant="bordered" className="relative">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <Avatar size="md" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Элсэлтийн шалгалтанд бэлдэхэд бэлэн үү?
            </h2>
            <p className="text-xl text-blue-100 mb-10">
              Өнөөдрөөс эхлээд өөрийгөө дараагийн түвшинд хүргээрэй.
            </p>
            <Link href="/register">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 shadow-xl"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Эхлэх
              </Button>
            </Link>
            <p className="mt-6 text-blue-200 text-sm">
              <CheckCircle className="w-4 h-4 inline mr-1" />
              Кредит карт шаардлагагүй • Хязгааргүй хандалт
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
