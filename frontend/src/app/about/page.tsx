'use client';

import { Navbar, Footer } from "@/components/layout";
import { motion } from "framer-motion";
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
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: "easeOut" } 
    },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
  };

  const scaleIn = {
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
      title: "Зорилго Чиглэсэн",
      description: "Бид YESH монгол шалгалтанд сууж байгаа оюутнуудыг амжилтанд хүрэхэд туслах шийдэлд анхаарч байна.",
    },
    {
      icon: Zap,
      title: "Хиймэл Оюуны Хүч",
      description: "Дэвшилтэт AI технологи ашиглан хувь хүний сургалтын туршлага үзүүлэлтийг төгөвлөөд байна.",
    },
    {
      icon: Users,
      title: "Сурагч Төвтэй",
      description: "Оюутны сургалтын хэрэгцээ, түвшинг ойлгон ер бусын арга замаар сургалт явуулдаг.",
    },
    {
      icon: Heart,
      title: "Дадлагад суурилсан",
      description: "Дадлага дасгал ажиллуудаар таньд тохируулан бодлого хариу, зааварчилгаа өгөх болно.",
    },
  ];

  const team = [
    {
      name: "Баясгалан Төгөс",
      role: "Үндэслэгч & Гүйцэтгэл Захирал",
      bio: "Монгол хэл, боловсрол салбарт 12 жилийн туршлагатай. YESH шалгалтанд өндөр дүн авсан.",
    },
    {
      name: "Өлзий Мөнхоо",
      role: "AI Анализатор",
      bio: "Хиймэл оюуны мэргэжилтэн. Сургалтын системийн үр ашгийг сайжруулахад ажиллаж байна.",
    },
    {
      name: "Хүүхэлдэй Цэцэг",
      role: "Сургалтын Үйлчилгээ Захирал",
      bio: "Монгол хэлийн багш. Оюутнуудын сургалтанд өндөр үнэлэмжийн арга замыг хэрэгжүүлдэг.",
    },
    {
      name: "Энхжаргал Сүхбаатар",
      role: "Техникийн Найман Захирал",
      bio: "Бүх системийн хөгжүүлэлт болон сайжруулалтанд эрхэмтэйгээр ажилладаг.",
    },
  ];

  const stats: Stat[] = [
    { value: "5,000", suffix: "+", label: "Сурагчид" },
    { value: "500", suffix: "+", label: "Менторууд" },
    { value: "95", suffix: "%", label: "Элсэлтийн хувь" },
    { value: "4.9", label: "Үнэлгээ" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 overflow-x-hidden font-sans">
      <Navbar />

      {/* ================= HERO SECTION ================= */}
      <motion.section
        className="relative pt-28 sm:pt-32 lg:pt-40 pb-20 sm:pb-24 lg:pb-32 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 dark:from-gray-950 dark:via-gray-900 dark:to-black overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* Animated Background Elements (Eyecatching) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <BackgroundBlob
            className="top-20 left-10 w-64 sm:w-96 h-64 sm:h-96 bg-blue-600/20 z-10"
            animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
          />
          <BackgroundBlob
            className="bottom-20 right-10 w-72 sm:w-[30rem] h-72 sm:h-[30rem] bg-purple-600/20 z-10"
            animate={{ x: [0, -30, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
          />
           <BackgroundBlob
            className="top-1/3 right-1/4 w-48 sm:w-64 h-48 sm:h-64 bg-pink-500/15 z-10"
            animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
          />
        </div>

        {/* Subtle Grid Texture (Trustworthy) */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div className="max-w-4xl mx-auto text-center" variants={staggerContainer}>
            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-8 leading-tight tracking-tight"
            >
              Бидний Тухай
              <motion.span
                className="block mt-2 bg-gradient-to-r  from-blue-600 via-indigo-400 to-purple-400 bg-clip-text text-transparent"
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                style={{ backgroundSize: "200% auto" }}
              >
                ЭЕШ Сургалтын Платформ
              </motion.span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg sm:text-xl text-gray-200 mb-12 max-w-2xl mx-auto leading-relaxed font-medium"
            >
              ЭЕШ шалгалтанд тань амжилтад хүрэхэд туслах хиймэл оюуны сургагч системийг бий болгосон. Мэргэжилтэй баг, дэвшилтэт технологи, шилдэг аргачлалаар таныг бэлтгэнэ.
            </motion.p>
          </motion.div>
        </div>
        </motion.section>

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

            <div className="space-y-6 text-lg text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
              <p>
                YESH монгол шалгалтыг хүүхэлтэйгээр өнцөглөх асуудлаас эхлэл, сурагчдыг ухаалаг AI технологийн дэмжлэгээр бэлтгэх сонирхол төрсөн. Энэ систем бүх оюутнуудын сургалтын хэрэгцээ, түвшинг ойлгон хувь хүний аргаар сургах гэсэн үзэл ухаанаас төрсөн.
              </p>
              <p>
                Өнөө үед бид энэ үнэтэй зорилгодоо аль ч өргөлтөөргүй нийцэж ажиллаж байна. YESH шалгалтанд сууж байгаа оюутнуудын бүх хүндлүүлсэн асуулт, үндэслэлтэй өнөхсүүлгүүдэд хариулан сайн оруулга өгч, чадвартай сургалтын үйлчилгээ үзүүлдэг.
              </p>
              <p>
                Өнөө хүртэл хаврын амжилтанд бидний системээр гарсан сурагчид YESH шалгалтанд өндөр оноо авсан. Энэ бол бидэнд их үнэтэй амжилт юм. Ирээдүй дэх нэмэх хөгжилд сурагчдыг урьж байна.
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