"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import AppSidebar from "@/components/SidebarClient";
import { User, Maximize2, MapPin } from "lucide-react";
import { useAuthSession } from "@/hooks/useAuthRole";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const router = useRouter();
  const { role, user, username, ready } = useAuthSession();

  useEffect(() => {
    if (ready && !role) {
      router.replace("/");
    }
  }, [ready, role, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7fa]">
        <p className="text-sm text-slate-400 font-medium">Loading...</p>
      </div>
    );
  }

  if (!role) return null;

  const displayName =
    user?.displayName ||
    user?.email ||
    username ||
    (role === "super-admin" ? "Super Admin" : role === "rider" ? "Rider" : role);

  return (
    <div className="flex min-h-screen bg-[#f4f7fa]">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-primary text-white flex items-center justify-between px-6 shadow-md sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-1.5 rounded-md flex items-center gap-2">
              <MapPin size={14} className="text-white" />
              <span className="text-xs font-bold uppercase tracking-wider">Karachi</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="text-white/80 hover:text-white transition-colors">
              <Maximize2 size={18} />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-white/20">
              <div className="text-right">
                <p className="text-[11px] font-bold leading-none uppercase tracking-tighter">{displayName}</p>
                <p className="text-[9px] text-white/70 font-medium">Available</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center overflow-hidden">
                <User size={20} className="text-white" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">{children}</main>

        <footer className="px-6 py-4 bg-white border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-medium uppercase tracking-widest">
          <p>COPYRIGHT © 2026 STALLIONEX COURIER, All rights Reserved</p>
          <p>Developed by HNH Tech Solutions</p>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
