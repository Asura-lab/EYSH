"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import Avatar from "../ui/Avatar";

interface SidebarLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

const sidebarLinks: SidebarLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/test", label: "Тест авах", icon: FileQuestion },
  { href: "/dashboard/roadmap", label: "Roadmap", icon: Route },
  { href: "/dashboard/mentors", label: "Менторууд", icon: Users },
  { href: "/dashboard/analytics", label: "Шинжилгээ", icon: BarChart3 },
];

const bottomLinks: SidebarLink[] = [
  { href: "/dashboard/settings", label: "Тохиргоо", icon: Settings },
  { href: "/help", label: "Тусламж", icon: HelpCircle },
];

export default function Sidebar(): JSX.Element {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<boolean>(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 z-40",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              EYSH
            </span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 overflow-y-auto">
        <div className="space-y-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-white")} />
                {!collapsed && <span className="font-medium">{link.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Links */}
      <div className="py-4 px-3 border-t border-gray-100 dark:border-gray-800">
        <div className="space-y-1 mb-4">
          {bottomLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="font-medium">{link.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* User */}
        <div
          className={cn(
            "flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800",
            collapsed && "justify-center"
          )}
        >
          <Avatar size="sm" status="online" />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">Батбаяр</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">12-р анги</p>
            </div>
          )}
          {!collapsed && (
            <button className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
