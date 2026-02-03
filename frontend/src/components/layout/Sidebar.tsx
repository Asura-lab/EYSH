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
  ChevronLeft,
  User,
  Moon,
  Sun,
  Shield,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useSidebar } from "@/components/providers/SidebarProvider";

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

interface SidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export default function Sidebar({ collapsed: controlledCollapsed, onCollapsedChange }: SidebarProps = {}): JSX.Element {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState<boolean>(false);

  // Get collapsed state from context
  const { collapsed: contextCollapsed, setCollapsed: setContextCollapsed, mobileOpen, setMobileOpen } = useSidebar();

  // Use controlled prop if provided (for backwards compatibility)
  const collapsed = controlledCollapsed !== undefined ? controlledCollapsed : contextCollapsed;
  const setCollapsed = (value: boolean) => {
    if (onCollapsedChange) {
      onCollapsedChange(value);
    } else {
      setContextCollapsed(value);
    }
  };

  // Note: localStorage management is now handled by SidebarProvider

  const userName = session?.user?.name || "Хэрэглэгч";
  const userEmail = session?.user?.email || "";
  const userImage = session?.user?.image;
  const userRole = (session?.user as any)?.role;

  // Build menu links based on user role
  let displayLinks = [...sidebarLinks];
  if (userRole === "admin") {
    // Admin sees everything plus admin panel at the top
    displayLinks = [
      { href: "/admin", label: "Админ Панел", icon: Shield },
      ...sidebarLinks,
    ];
  }

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
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

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.profile-dropdown')) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const sidebarWidth = collapsed ? "w-20" : "w-72";

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
          "fixed top-0 left-0 h-screen flex flex-col transition-all duration-300 z-50 border-r",
          "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800",
          // Desktop
          "hidden lg:flex",
          sidebarWidth,
          // Mobile
          mobileOpen && "!flex !w-80"
        )}
      >
        {/* Logo & Collapse Button */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 dark:border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div>
                <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">EYSH</span>
                <p className="text-[10px] text-gray-500 dark:text-slate-400 -mt-0.5">Элсэлтийн шалгалт</p>
              </div>
            )}
          </Link>

          {/* Desktop collapse button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white transition-colors"
            title={collapsed ? "Дэлгэх" : "Хураах"}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>

          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="space-y-1">
            {displayLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  title={collapsed ? link.label : undefined}
                  className={cn(
                    "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25"
                      : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg transition-colors flex-shrink-0",
                    isActive
                      ? "bg-white/20"
                      : "bg-gray-100 dark:bg-slate-800 group-hover:bg-gray-200 dark:group-hover:bg-white/10"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {!collapsed && (
                    <>
                      <span className="font-medium flex-1 truncate">{link.label}</span>
                      {link.badge && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full">
                          {link.badge}
                        </span>
                      )}
                      {isActive && (
                        <ChevronRight className="w-4 h-4 text-white/70" />
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="p-3 border-t border-gray-100 dark:border-slate-800">
          <div className="relative profile-dropdown">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setProfileOpen(!profileOpen);
              }}
              className={cn(
                "w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors",
                collapsed && "justify-center"
              )}
            >
              {userImage ? (
                <img
                  src={userImage}
                  alt={userName}
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-blue-200 dark:ring-white/20 flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center ring-2 ring-blue-200 dark:ring-white/20 flex-shrink-0">
                  <span className="text-sm font-bold text-white">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {!collapsed && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{userName}</p>
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span className="text-xs text-gray-500 dark:text-slate-400">Анхан шат</span>
                  </div>
                </div>
              )}
            </button>

            {/* Profile Dropdown Menu */}
            {profileOpen && (
              <div
                className={cn(
                  "absolute bottom-full mb-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden z-50",
                  collapsed ? "left-full ml-2 w-56" : "left-0 right-0"
                )}
              >
                {/* User info in dropdown */}
                <div className="p-3 border-b border-gray-100 dark:border-slate-700">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{userName}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{userEmail}</p>
                </div>

                <div className="p-2">
                  {/* Profile */}
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm">Профайл</span>
                  </Link>

                  {/* Settings */}
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">Тохиргоо</span>
                  </Link>

                  {/* Help */}
                  <Link
                    href="/help"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span className="text-sm">Тусламж</span>
                  </Link>

                  {/* Theme Toggle */}
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  >
                    {theme === 'dark' ? (
                      <Sun className="w-4 h-4" />
                    ) : (
                      <Moon className="w-4 h-4" />
                    )}
                    <span className="text-sm">{theme === 'dark' ? 'Цайвар горим' : 'Бараан горим'}</span>
                  </button>
                </div>

                {/* Logout */}
                <div className="p-2 border-t border-gray-100 dark:border-slate-700">
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Гарах</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
