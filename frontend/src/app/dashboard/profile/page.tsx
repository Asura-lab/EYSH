"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import { useSidebar } from "@/components/providers/SidebarProvider";
import { Loader2, Mail, User, Phone, School, MapPin, CheckCircle2 } from "lucide-react";

interface ProfileForm {
  name: string;
  email: string;
  phone: string;
  school: string;
  grade: string;
  city: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { collapsed } = useSidebar();

  const [form, setForm] = useState<ProfileForm>({
    name: "",
    email: "",
    phone: "",
    school: "",
    grade: "",
    city: "",
  });
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (!session?.user) return;

    setForm((prev) => ({
      ...prev,
      name: session.user.name || "",
      email: session.user.email || "",
    }));
  }, [session]);

  const handleChange = (key: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavedAt(new Date());
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className={`p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 transition-all duration-300 ${collapsed ? "lg:ml-20" : "lg:ml-72"}`}>
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Профайл</h1>
          <p className="text-gray-600 dark:text-gray-300">Хувийн мэдээллээ шинэчилж, акаунтаа удирдаарай</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
          <Card className="xl:col-span-1">
            <CardContent className="text-center">
              <Avatar
                className="mx-auto"
                size="xl"
                src={session?.user?.image || undefined}
                alt={session?.user?.name || "User"}
              />
              <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
                {form.name || "Хэрэглэгч"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{form.email || "Имэйл оруулаагүй"}</p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <Badge variant="info">Сурагч</Badge>
                <Badge variant="success">Идэвхтэй</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Профайлын мэдээлэл</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Нэр"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    leftIcon={<User className="w-4 h-4" />}
                    placeholder="Өөрийн нэр"
                  />
                  <Input
                    label="Имэйл"
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    leftIcon={<Mail className="w-4 h-4" />}
                    placeholder="email@example.com"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Утасны дугаар"
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    leftIcon={<Phone className="w-4 h-4" />}
                    placeholder="+976 ..."
                  />
                  <Input
                    label="Сургууль"
                    value={form.school}
                    onChange={(e) => handleChange("school", e.target.value)}
                    leftIcon={<School className="w-4 h-4" />}
                    placeholder="Сургуулийн нэр"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Анги"
                    value={form.grade}
                    onChange={(e) => handleChange("grade", e.target.value)}
                    placeholder="12-р анги"
                  />
                  <Input
                    label="Хот"
                    value={form.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    leftIcon={<MapPin className="w-4 h-4" />}
                    placeholder="Улаанбаатар"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
                  <Button type="submit">Хадгалах</Button>
                  {savedAt && (
                    <div className="inline-flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      {savedAt.toLocaleTimeString()} - шинэчлэгдлээ
                    </div>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
