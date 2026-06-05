"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import AppLogo from "@/components/AppLogo";
import { cn } from "@/lib/utils";

export default function SplashScreenProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {mounted && (
        <div
          className={cn(
            "fixed inset-0 z-[9999] bg-white flex items-center justify-center transition-all duration-500",
            loading ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
        >
          <div className={cn(
            "transition-all duration-500 transform",
            loading ? "scale-110 opacity-100" : "scale-90 opacity-0"
          )}>
            <AppLogo className="scale-150" />
          </div>
        </div>
      )}
      {children}
    </>
  );
}
