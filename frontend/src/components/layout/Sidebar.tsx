"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  FileQuestion,
  Route,
  Users,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  GraduationCap,
  Menu,
  X,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import ThemeToggle from "../ui/ThemeToggle";

interface SidebarLink {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

const sidebarLinks: SidebarLink[] = [
  { href: "/dashboard", label: "Хяналтын самбар", icon: LayoutDashboard },
  { href: "/dashboard/test", label: "Тест авах", icon: FileQuestion, badge: "Шинэ" },
  { href: "/dashboard/roadmap", label: "Сургалтын төлөвлөгөө", icon: Route },
  { href: "/dashboard/mentors", label: "Менторууд", icon: Users },
  { href: "/dashboard/analytics", label: "Шинжилгээ", icon: BarChart3 },
];

const bottomLinks: SidebarLink[] = [
  { href: "/dashboard/settings", label: "Тохиргоо", icon: Settings },
  { href: "/help", label: "Тусламж", icon: HelpCircle },
];

export default function Sidebar(): JSX.Element {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  
  const userName = session?.user?.name || "Хэрэглэгч";
  const userEmail = session?.user?.email || "";
  const userImage = session?.user?.image;

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between px-4 z-50">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            EYSH
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {mobileOpen ? (
              <X className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            ) : (
              <Menu className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 h-screen flex flex-col transition-all duration-300 z-50 border-r",
          "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800",
          // Desktop styles
          "hidden lg:flex left-0 w-72",
          // Mobile styles - slide in from left
          mobileOpen && "!flex !left-0 w-80"
        )}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-6">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">EYSH</span>
              <p className="text-[10px] text-gray-500 dark:text-slate-400 -mt-0.5">Элсэлтийн шалгалт</p>
            </div>
          </Link>
          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Card */}
        <div className="mx-4 mb-6">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-white/10 dark:to-white/5 border border-blue-100 dark:border-white/10">
            <div className="flex items-center gap-3">
              {userImage ? (
                <img 
                  src={userImage} 
                  alt={userName}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-200 dark:ring-white/20"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center ring-2 ring-blue-200 dark:ring-white/20">
                  <span className="text-lg font-bold text-white">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{userName}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{userEmail}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-100 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-gray-600 dark:text-slate-300">Анхан шат</span>
              </div>
              <span className="text-xs text-gray-400 dark:text-slate-500">0 оноо</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 overflow-y-auto">
          <p className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-3">
            Үндсэн цэс
          </p>
          <div className="space-y-1.5">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25"
                      : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg transition-colors",
                    isActive 
                      ? "bg-white/20" 
                      : "bg-gray-100 dark:bg-slate-800 group-hover:bg-gray-200 dark:group-hover:bg-white/10"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium flex-1">{link.label}</span>
                  {link.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full">
                      {link.badge}
                    </span>
                  )}
                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-white/70" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="p-4 mt-auto border-t border-gray-100 dark:border-slate-800">
          <p className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-3">
            Тохиргоо
          </p>
          <div className="space-y-1.5 mb-4">
            {bottomLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white"
                      : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              );
            })}
            
            {/* Theme Toggle */}
            <div className="hidden lg:flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 dark:text-slate-400">
              <div className="flex-1 flex items-center gap-3">
                <Settings className="w-5 h-5" />
                <span className="font-medium">Загвар</span>
              </div>
              <ThemeToggle />
            </div>
          </div>

          {/* Logout Button */}
          <button 
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors group"
          >
            <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium">Системээс гарах</span>
          </button>
        </div>
      </aside>
    </>
  );
}
