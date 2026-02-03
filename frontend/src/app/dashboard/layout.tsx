"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return;
        const userRole = (session?.user as any)?.role;
        if (userRole === "admin") {
            router.replace("/admin");
        }
    }, [status, session, router]);

    // Show loader while checking or if redirecting
    if (status === "loading" || (session?.user as any)?.role === "admin") {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    // Render children normally for non-admin users
    return <>{children}</>;
}
