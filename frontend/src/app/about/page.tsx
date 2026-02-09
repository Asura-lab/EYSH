'use client';

import { Navbar, Footer } from "@/components/layout";
import { motion, Variants } from "framer-motion";
import { Users, Target, Zap, Heart, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";

// Type definitions
interface Stat {
  value: string;
  suffix?: string;
  label: string;
}

// AnimatedCounter component
const AnimatedCounter = ({ value, suffix = "" }: { value: string; suffix?: string }) => {
  return <span>{value}{suffix}</span>;
};

// Reusable component for the background blobs to keep code clean
const BackgroundBlob = ({ className, animate }: { className: string, animate?: any }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl pointer-events-none -z-10 ${className}`}
    animate={animate}
    transition={animate ? { duration: 10, repeat: Infinity, ease: "easeInOut" } : undefined}
  />
);

export default function AboutPage() {
  // Animation Variants (Fixed easing values and types)
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    },
  };

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    },
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
  };

  const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    },
  };

  // Data
  const values = [
    {
      icon: Target,
      title: "Зорилго Төвтэй",
      description: "Сурагч бүрийн элсэлтийн зорилгод хүрэхэд туслах хамгийн оновчтой, үр дүнтэй шийдлийг бүтээж байна.",
    },
    {
      icon: Zap,
      title: "Дэвшилтэт Технологи",
      description: "Machine Learning, AI алгоритм ашиглан сурагч бүрийн түвшинд тохирсон сургалтын төлөвлөгөө боловсруулдаг.",
    },
    {
      icon: Users,
      title: "Хүртээмжтэй Боловсрол",
      description: "Газар зүй, эдийн засгийн боломжоос үл хамааралгүй сурагч бүрд чанартай бэлтгэл хийх боломжийг олгодог.",
    },
    {
      icon: Heart,
      title: "Тасралтгүй Сайжруулалт",
      description: "Хэрэглэгчдийн санал хүсэлт, шинжлэх ухааны сүүлийн үр дүнд тулгуурлан системээ байнга сайжруулдаг.",
    },
  ];

  const team = [
    {
      name: "Мөнхдорж",
      role: "Fullstack Хөгжүүлэгч & Tech Lead",
      bio: "2+ жилийн вэб хөгжүүлэлтийн туршлагатай. Системийн архитектур, AI интеграци, DevOps хариуцсан.",
    },
    {
      name: "Мягмарсүрэн",
      role: "Frontend & UX Хөгжүүлэгч",
      bio: "Хэрэглэгчийн туршлагыг дээд зэрэгт үнэлдэг. React, Next.js, Tailwind CSS дээр мэргэшсэн.",
    },
    {
      name: "Тамир",
      role: "AI/ML Инженер",
      bio: "Хиймэл оюун ухаан, машин сургалтын чиглэлээр төгссөн. Түвшин тодорхойлох алгоритм боловсруулсан.",
    },
    {
      name: "Эрдэнэбаяр",
      role: "Backend Хөгжүүлэгч",
      bio: "Python, FastAPI, Өгөгдлийн сан дээр мэргэшсэн. API-ийн бүтэц, аюулгүй байдал хариуцсан.",
    },
  ];

  const stats: Stat[] = [
    { value: "10,000", suffix: "+", label: "Идэвхтэй сурагчид" },
    { value: "800", suffix: "+", label: "Туршлагатай менторууд" },
    { value: "92", suffix: "%", label: "Амжилттай элссэн" },
    { value: "4.8", suffix: "/5", label: "Хэрэглэгчийн үнэлгээ" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 overflow-x-hidden font-sans">
      <Navbar />

      {/* ================= HERO SECTION ================= */}
      <section className="pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 overflow-hidden relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-blue-400/20 dark:bg-blue-600/20 rounded-full blur-3xl"
            animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-purple-400/20 dark:bg-purple-600/20 rounded-full blur-3xl"
            animate={{ x: [0, -30, 0], y: [0, -50, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-40 right-1/4 w-48 sm:w-64 h-48 sm:h-64 bg-pink-400/10 dark:bg-pink-500/15 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="absolute inset-0 bg-grid-pattern opacity-[0.05] dark:opacity-5 pointer-events-none" />

        <div className="container mx-auto px-4 relative">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.h1
              variants={fadeInUp}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight"
            >
              Бидний тухай
              <motion.span
                className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 5, repeat: Infinity }}
                style={{ backgroundSize: "200% 200%" }}
              >
                Studium сургалтын платформ
              </motion.span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-10 max-w-2xl mx-auto px-4"
            >
              ЭЕШ-д амжилт гаргахад тань туслах хиймэл оюуны ухаалаг сургалтын системийг бий болгосон. Мэргэжлийн баг, дэвшилтэт технологи, оновчтой аргачлалаар таныг бэлтгэнэ.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ================= OUR STORY SECTION ================= */}
      <motion.section
        className="relative py-20 sm:py-28 px-4 bg-white dark:bg-gray-900 overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        {/* NEW: Subtle static background blobs for depth in light sections */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <BackgroundBlob className="top-1/4 -left-24 w-[500px] h-[500px] bg-blue-100/60 dark:bg-blue-900/20 blur-3xl" />
          <BackgroundBlob className="bottom-0 right-0 w-[400px] h-[400px] bg-purple-100/50 dark:bg-purple-900/20 blur-3xl" />
        </div>
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.05] pointer-events-none" />


        <div className="container mx-auto max-w-4xl relative z-10">
          <motion.div variants={itemVariants} className="mb-16">

            {/* Wrapper to handle inline width for the underline */}
            <div className="relative inline-block mb-10">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent pb-2">
                Үүсгэн байгуулагдсан түүх
              </h2>

              {/* Animated Underline */}
              <motion.div
                className="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "circOut", delay: 0.2 }}
              />
            </div>

            <div className="space-y-6 text-lg text-gray-700 dark:text-gray-300 leading-relaxed font-medium text-justify">
              <p>
                ЭЕШ-д бэлдэж буй сурагчдад тулгардаг бэрхшээлүүдийг технологийн шийдлээр шийдвэрлэх, тэдэнд хиймэл оюуны дэмжлэгтэйгээр илүү ухаалаг бэлдэх боломжийг олгох зорилготойгоор манай төсөл эхэлсэн. Энэхүү систем нь сурагч бүрийн суралцах хурд, түвшинд тохируулан хувь хүний онцлогт нийцсэн арга барилаар мэдлэг олгох алсын хараанаас үүдэлтэй юм.
              </p>
              <p>
                Өнөөдөр бид энэхүү эрхэм зорилгынхоо хүрээнд тасралтгүй хөгжүүлэлт хийн ажиллаж байна. ЭЕШ-д сууж буй оюутнуудын түгээмэл алддаг асуултуудад дүн шинжилгээ хийж, тэдний сул талыг бататгах замаар хамгийн оновчтой сургалтын төлөвлөгөөг гаргаж өгдөг.
              </p>
              <p>
                Манай системээр дамжуулан бэлдсэн сурагчид ЭЕШ-даа амжилттай оролцож, өндөр оноо авч байгаа нь бидний хувьд хамгийн том амжилт юм. Бид боловсролын салбарыг технологитой хослуулан илүү гарц, илүү үр дүнтэй ирээдүйг хамтдаа бүтээнэ.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ================= CORE VALUES SECTION ================= */}
      <motion.section
        className="relative py-20 sm:py-28 px-4 bg-gradient-to-b from-blue-50/50 to-white dark:from-gray-800 dark:to-gray-900 overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        {/* NEW: Subtle background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <BackgroundBlob className="-top-20 right-1/4 w-96 h-96 bg-indigo-100/40 dark:bg-indigo-900/20 blur-3xl" />
        </div>
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.05] pointer-events-none" />


        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.h2
            variants={itemVariants}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-16 text-center text-gray-900 dark:text-white"
          >
            Бидний Үнэт Зүйлс
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100/50 dark:border-gray-700 group"
                >
                  <div className="flex items-start gap-6">
                    <motion.div
                      className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow"
                      whileHover={{ rotate: 10 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {value.title}
                      </h3>
                      <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* ================= TEAM SECTION ================= */}
      <motion.section
        className="relative py-20 sm:py-28 px-4 bg-white dark:bg-gray-900 overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        {/* NEW: Subtle background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <BackgroundBlob className="bottom-1/4 left-1/3 w-[600px] h-[600px] bg-pink-100/30 dark:bg-pink-900/10 blur-3xl" />
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.h2
            variants={itemVariants}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-16 text-center text-gray-900 dark:text-white"
          >
            Манай Баг
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 shadow-md hover:shadow-xl text-center group"
              >
                <motion.div
                  className="w-24 h-24 mx-auto bg-gradient-to-tr from-blue-400 to-purple-500 rounded-full mb-6 shadow-lg shadow-blue-500/20 p-1"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-full h-full rounded-full bg-white dark:bg-gray-800"></div>
                  {/* Placeholder for actual user image if available later */}
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {member.name}
                </h3>
                <div className="inline-block bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full mb-4">
                  <p className="text-blue-600 dark:text-blue-300 font-semibold text-sm">
                    {member.role}
                  </p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {member.bio}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ================= CTA SECTION ================= */}
      <motion.section
        className="relative py-24 sm:py-32 px-4 bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        {/* Animated background elements (Stronger here for emphasis) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <BackgroundBlob
            className="-top-40 -left-40 w-[40rem] h-[40rem] bg-blue-500/20"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          />
          <BackgroundBlob
            className="-bottom-40 -right-40 w-[40rem] h-[40rem] bg-purple-500/20"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          />
        </div>

        <div className="absolute inset-0 bg-grid-pattern opacity-[0.05] pointer-events-none" />

        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <motion.h2
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-8 text-white tracking-tight"
          >
            ЭЕШ Шалгалтанд Бэлтгэгдэхэд Бэлэн үү?
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-xl sm:text-2xl text-blue-100 mb-12 leading-relaxed font-medium"
          >
            Манай AI-д тулгуурласан сургалтанд хамрагдан шаардлагатай мэдлэгийг эзэмшиж ЭЕШ шалгалтандаа өндөр оноо аваарай.
          </motion.p>
          <motion.div variants={itemVariants}>
            <Link href="/register" passHref legacyBehavior>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <Button
                  size="lg"
                  className="bg-white text-indigo-950 hover:bg-blue-50 shadow-2xl shadow-white/10 border border-white/20 font-bold text-lg px-10 py-4 rounded-full"
                  rightIcon={<ArrowRight className="w-6 h-6 ml-2" />}
                >
                  Одооноос Бэлд
                </Button>
              </motion.a>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
}