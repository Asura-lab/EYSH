"use client";

import Link from "next/link";
import { motion } from "framer-motion";
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
  Sparkles,
} from "lucide-react";
import { Navbar, Footer } from "@/components/layout";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const floatAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: { duration: 4, repeat: Infinity, ease: [0.45, 0, 0.55, 1] as const },
  },
};

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

interface Stat {
  value: string;
  label: string;
  suffix?: string;
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
  { value: "5,000", suffix: "+", label: "Сурагчид" },
  { value: "500", suffix: "+", label: "Менторууд" },
  { value: "95", suffix: "%", label: "Элсэлтийн хувь" },
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

// Animated Counter Component
function AnimatedCounter({ value, suffix = "" }: { value: string; suffix?: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      className="inline-block"
    >
      {value}{suffix}
    </motion.span>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 overflow-hidden relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-blue-400/20 rounded-full blur-3xl"
            animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-purple-400/20 rounded-full blur-3xl"
            animate={{ x: [0, -30, 0], y: [0, -50, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-40 right-1/4 w-48 sm:w-64 h-48 sm:h-64 bg-pink-400/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        
        <div className="container mx-auto px-4 relative">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <Badge variant="info" size="lg" className="mb-6 inline-flex">
                <motion.span
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                </motion.span>
                AI-д суурилсан сургалтын платформ
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight"
            >
              Элсэлтийн шалгалтанд
              <motion.span
                className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 5, repeat: Infinity }}
                style={{ backgroundSize: "200% 200%" }}
              >
                хамгийн ухаалаг бэлтгэл
              </motion.span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-10 max-w-2xl mx-auto px-4"
            >
              AI таны түвшинг тодорхойлж, сул талыг олж, хувь хүнд тохирсон сургалтын төлөвлөгөө үүсгэнэ.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/register">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                    Үнэгүй эхлэх
                  </Button>
                </motion.div>
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="lg" leftIcon={<Play className="w-5 h-5" />}>
                  Видео үзэх
                </Button>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mt-10 sm:mt-16 pt-6 sm:pt-10 border-t border-gray-200 dark:border-gray-700"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  variants={scaleIn}
                  whileHover={{ scale: 1.1 }}
                  className="cursor-default"
                >
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-xs sm:text-sm lg:text-base text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-10 sm:mb-16"
          >
            <motion.div variants={fadeInUp}>
              <Badge variant="purple" className="mb-4">Онцлогууд</Badge>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Яагаад EYSH сонгох вэ?
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4"
            >
              Бид хамгийн орчин үеийн технологиор таныг элсэлтийн шалгалтанд бэлддэг.
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={fadeInUp}
                  whileHover={{ y: -10, transition: { duration: 0.3 } }}
                >
                  <Card hover className="text-center group h-full">
                    <motion.div
                      className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-4 sm:mb-6 rounded-xl lg:rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                    </motion.div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">{feature.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">{feature.description}</p>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 sm:py-16 lg:py-24 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-10 sm:mb-16"
          >
            <motion.div variants={fadeInUp}>
              <Badge variant="success" className="mb-4">Хэрхэн ажилладаг</Badge>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              4 энгийн алхам
            </motion.h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
          >
            {steps.map((item, index) => (
              <motion.div
                key={item.step}
                variants={fadeInUp}
                className="relative"
              >
                <div className="text-center">
                  <motion.div
                    className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-lg sm:text-xl lg:text-2xl font-bold shadow-lg shadow-blue-500/25"
                    whileHover={{ scale: 1.15, rotate: 360 }}
                    transition={{ duration: 0.5, type: "spring" }}
                  >
                    {item.step}
                  </motion.div>
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-300">{item.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="hidden lg:block absolute top-6 lg:top-8 -right-2 lg:-right-4"
                  >
                    <ChevronRight className="w-6 h-6 lg:w-8 lg:h-8 text-gray-300 dark:text-gray-600" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp}>
              <Badge variant="warning" className="mb-4">Сэтгэгдлүүд</Badge>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Сурагчдын үнэлгээ
            </motion.h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
              >
                <Card variant="bordered" className="relative h-full">
                  <motion.div
                    className="flex gap-1 mb-4"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ staggerChildren: 0.1 }}
                  >
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      </motion.div>
                    ))}
                  </motion.div>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <Avatar size="md" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
        {/* Animated background */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-3xl mx-auto text-center text-white"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              Элсэлтийн шалгалтанд бэлдэхэд бэлэн үү?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-blue-100 mb-10">
              Өнөөдрөөс эхлээд өөрийгөө дараагийн түвшинд хүргээрэй.
            </motion.p>
            <motion.div variants={fadeInUp}>
              <Link href="/register">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block"
                >
                  <Button
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-gray-100 shadow-xl"
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                  >
                    Үнэгүй эхлэх
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
            <motion.p
              variants={fadeInUp}
              className="mt-6 text-blue-200 text-sm"
            >
              <CheckCircle className="w-4 h-4 inline mr-1" />
              Бүрэн үнэгүй • Хязгааргүй хандалт
            </motion.p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
