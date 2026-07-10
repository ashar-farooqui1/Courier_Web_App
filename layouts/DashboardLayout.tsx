"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppSidebar from "@/components/SidebarClient";
import { AdminProfileMenu } from "@/components/admin/AdminProfileMenu";
import { DefaultWarehouseDialog } from "@/components/admin/DefaultWarehouseDialog";
import { MapPin, User } from "lucide-react";
import { useAuthSession } from "@/hooks/useAuthRole";
import { isAdminRole } from "@/lib/auth/role";
import { saveDefaultWarehouse } from "@/lib/auth/warehouse";
import type { Warehouse } from "@/lib/types/warehouse";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const router = useRouter();
  const { role, user, username, ready } = useAuthSession();
  const [showWarehouseDialog, setShowWarehouseDialog] = useState(false);

  useEffect(() => {
    if (ready && !role) {
      router.replace("/");
    }
  }, [ready, role, router]);

  useEffect(() => {
    if (ready && isAdminRole(role)) {
      setShowWarehouseDialog(true);
    }
  }, [ready, role]);

  const handleWarehouseConfirm = (warehouse: Warehouse) => {
    saveDefaultWarehouse({ warehouseId: warehouse.warehouseId, name: warehouse.name });
    setShowWarehouseDialog(false);
  };

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

  const headerCity = "Karachi";
  const profileCity = "Lahore";

  return (
    <div className="flex min-h-screen bg-[#f4f7fa]">
      <DefaultWarehouseDialog
        isOpen={showWarehouseDialog}
        adminName={displayName}
        onConfirm={handleWarehouseConfirm}
      />
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-primary text-white flex items-center justify-between px-6 shadow-md sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-1.5 rounded-md flex items-center gap-2">
              <MapPin size={14} className="text-white" />
              <span className="text-xs font-bold uppercase tracking-wider">{headerCity}</span>
            </div>
          </div>

          {isAdminRole(role) ? (
            <AdminProfileMenu displayName={displayName} city={profileCity} />
          ) : (
            <div className="flex items-center gap-3 pl-4 border-l border-white/20">
              <div className="text-right">
                <p className="text-[11px] font-bold leading-none uppercase tracking-tighter">
                  {displayName}
                </p>
                <p className="text-[9px] text-white/70 font-medium">Available</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center overflow-hidden">
                <User size={20} className="text-white" />
              </div>
            </div>
          )}
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
