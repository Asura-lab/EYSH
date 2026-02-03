"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "purple" | "primary" | "error";
  size?: "sm" | "md" | "lg";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "md", children, ...props }, ref) => {
    const variants = {
      default: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
      success: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400",
      warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400",
      danger: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400",
      error: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400",
      info: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400",
      primary: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400",
      purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400",
    };

    const sizes = {
      sm: "px-2 py-0.5 text-xs",
      md: "px-2.5 py-1 text-sm",
      lg: "px-3 py-1.5 text-base",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center font-medium rounded-full",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export default Badge;
