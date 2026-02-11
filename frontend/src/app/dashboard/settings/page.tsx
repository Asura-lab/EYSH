"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { Sidebar } from "@/components/layout";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useSidebar } from "@/components/providers/SidebarProvider";
import { Bell, Moon, Sun, Lock, LogOut, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const { collapsed } = useSidebar();
  const { theme, setTheme } = useTheme();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [mentorNotifications, setMentorNotifications] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Toggle = ({
    checked,
    onChange,
    label,
    description,
  }: {
    checked: boolean;
    onChange: (next: boolean) => void;
    label: string;
    description: string;
  }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
    >
      <div className="text-left">
        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
        <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
      </div>
      <span
        className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${checked ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"}`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform mt-0.5 ${checked ? "translate-x-5" : "translate-x-0.5"}`}
        />
      </span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className={`p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 transition-all duration-300 ${collapsed ? "lg:ml-20" : "lg:ml-72"}`}>
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Тохиргоо</h1>
          <p className="text-gray-600 dark:text-gray-300">Аппын мэдэгдэл, харагдац болон акаунтын тохиргоо</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                Мэдэгдэл
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Toggle
                checked={emailNotifications}
                onChange={setEmailNotifications}
                label="Имэйл мэдэгдэл"
                description="Шинэ тест, roadmap шинэчлэл болон сануулга"
              />
              <Toggle
                checked={mentorNotifications}
                onChange={setMentorNotifications}
                label="Менторын мэдэгдэл"
                description="Ментороос ирсэн мессеж, уулзалтын сануулга"
              />
              <Toggle
                checked={weeklyReport}
                onChange={setWeeklyReport}
                label="7 хоногийн тайлан"
                description="Суралцах ахицын долоо хоногийн тайлан"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Харагдац</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`w-full p-3 rounded-xl border text-left transition-colors ${theme === "light" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30" : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/60"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span className="font-medium text-gray-900 dark:text-white">Цайвар горим</span>
                  </div>
                  {theme === "light" && <Badge variant="info">Идэвхтэй</Badge>}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`w-full p-3 rounded-xl border text-left transition-colors ${theme === "dark" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30" : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/60"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-indigo-500" />
                    <span className="font-medium text-gray-900 dark:text-white">Бараан горим</span>
                  </div>
                  {theme === "dark" && <Badge variant="info">Идэвхтэй</Badge>}
                </div>
              </button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6 mt-4 lg:mt-6">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600" />
                Аюулгүй байдал
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full sm:w-auto">Нууц үг солих</Button>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Хэрэв та өөр төхөөрөмжөөс нэвтэрсэн бол нууц үгээ шинэчилж акаунтаа хамгаалаарай.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Акаунт</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="danger" className="w-full" onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className="w-4 h-4" />
                Гарах
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
          <Button onClick={handleSave}>Тохиргоо хадгалах</Button>
          {saved && (
            <div className="inline-flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              Тохиргоо амжилттай хадгалагдлаа
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
