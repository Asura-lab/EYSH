"use client";

import Link from "next/link";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { GraduationCap, Mail, Lock, User, Phone, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { authAPI } from "@/lib/api";

// TypeScript Interface
interface RegisterFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  grade: string;
  school: string;
  targetUniversity: string;
}

export default function RegisterPage(): JSX.Element {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    grade: "",
    school: "",
    targetUniversity: "",
  });

  // Email бүртгэл
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (step < 2) {
      // Validate step 1
      if (!formData.name || !formData.email || !formData.password) {
        setError("Бүх талбарыг бөглөнө үү");
        return;
      }
      if (formData.password.length < 8) {
        setError("Нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой");
        return;
      }
      setError("");
      setStep(step + 1);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Register request
      try {
        await authAPI.register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        });
      } catch (err: any) {
        // If user already exists, ignore error and try to login
        const errorDetail = err.response?.data?.detail;
        if (errorDetail !== "Email already registered") {
          throw err;
        }
      }

      // Auto sign in (works for both new and existing users with correct password)
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.ok) {
        router.push("/dashboard");
      } else {
        // If login fails (e.g. existing user but wrong password)
        setError("Бүртгэлтэй хэрэглэгч байна. Нууц үг буруу байна.");
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Бүртгүүлэх үед алдаа гарлаа");
    } finally {
      setIsLoading(false);
    }
  };

  // Google бүртгэл
  const handleGoogleSignIn = async (): Promise<void> => {
    setIsGoogleLoading(true);
    setError("");

    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (err) {
      setError("Google-ээр бүртгүүлэх үед алдаа гарлаа");
      setIsGoogleLoading(false);
    }
  };

  const benefits: string[] = [
    "AI-д суурилсан түвшин тодорхойлолт",
    "Хувийн сургалтын roadmap",
    "500+ ментортой холбогдох боломж",
    "Бүгд ҮНЭГҮЙ!",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">EYSH</span>
          </Link>
        </div>

        <div className="relative">
          <h2 className="text-4xl font-bold text-white mb-6">
            Элсэлтийн шалгалтанд бэлдэх хамгийн ухаалаг арга
          </h2>
          <div className="space-y-4">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-3 text-blue-100">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <p className="text-blue-200 text-sm">
            © 2026 EYSH. Бүх эрх хуулиар хамгаалагдсан.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-12">
        <div className="w-full max-w-lg">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                EYSH
              </span>
            </Link>
          </div>

          <Card variant="glass" className="p-8">
            {/* Progress */}
            <div className="flex items-center gap-2 mb-8">
              {[1, 2].map((s) => (
                <div
                  key={s}
                  className={`flex-1 h-2 rounded-full transition-colors ${s <= step ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
                    }`}
                />
              ))}
            </div>

            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {step === 1 ? "Бүртгүүлэх" : "Нэмэлт мэдээлэл"}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {step === 1
                  ? "Өөрийн мэдээллийг оруулна уу"
                  : "Сургуулийн мэдээллээ оруулна уу"}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Step 1: Google or Email */}
            {step === 1 && (
              <>
                {/* Google Sign Up Button */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGoogleLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Google-ээр бүртгүүлэх</span>
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white dark:bg-gray-800 text-gray-500">Эсвэл и-мэйлээр</span>
                  </div>
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {step === 1 ? (
                <>
                  <Input
                    label="Нэр"
                    placeholder="Таны нэр"
                    leftIcon={<User className="w-5 h-5" />}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />

                  <Input
                    label="И-мэйл"
                    type="email"
                    placeholder="example@email.com"
                    leftIcon={<Mail className="w-5 h-5" />}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />

                  <Input
                    label="Утасны дугаар"
                    type="tel"
                    placeholder="99001122"
                    leftIcon={<Phone className="w-5 h-5" />}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />

                  <Input
                    label="Нууц үг"
                    type="password"
                    placeholder="••••••••"
                    leftIcon={<Lock className="w-5 h-5" />}
                    helperText="Хамгийн багадаа 8 тэмдэгт"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Анги
                    </label>
                    <select
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    >
                      <option value="">Ангиа сонгоно уу</option>
                      <option value="10">10-р анги</option>
                      <option value="11">11-р анги</option>
                      <option value="12">12-р анги</option>
                      <option value="graduated">Төгссөн</option>
                    </select>
                  </div>

                  <Input
                    label="Сургууль"
                    placeholder="Сургуулийнхаа нэрийг оруулна уу"
                    value={formData.school}
                    onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                  />

                  <Input
                    label="Зорилтот их сургууль"
                    placeholder="Жишээ нь: МУИС, ШУТИС"
                    value={formData.targetUniversity}
                    onChange={(e) => setFormData({ ...formData, targetUniversity: e.target.value })}
                  />
                </>
              )}

              <div className="flex gap-3 pt-2">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep(step - 1)}
                  >
                    Буцах
                  </Button>
                )}
                <Button
                  type="submit"
                  className="flex-1"
                  size="lg"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  {step === 2 ? "Бүртгүүлэх" : "Үргэлжлүүлэх"}
                </Button>
              </div>
            </form>

            {step === 1 && (
              <p className="mt-8 text-center text-gray-600 dark:text-gray-300">
                Бүртгэлтэй юу?{" "}
                <Link href="/login" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                  Нэвтрэх
                </Link>
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
