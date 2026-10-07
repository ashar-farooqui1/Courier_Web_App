"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, FileText, FileStack, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import AppLogo from "@/components/AppLogo";
import { logout } from "@/lib/auth/role";

interface SaleManagerNavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  /** Highlight only on an exact path match (e.g. the create screen vs. its list). */
  exact?: boolean;
  indent?: boolean;
}

const SALE_MANAGER_NAV: SaleManagerNavItem[] = [
  { icon: <LayoutDashboard size={20} />, label: "Dashboard", href: "/dashboard", exact: true },
  { icon: <Package size={20} />, label: "Orders", href: "/orders/details" },
  { icon: <FileText size={20} />, label: "Return Document", href: "/documents/return", exact: true },
  {
    icon: <FileStack size={20} />,
    label: "Return Documents List",
    href: "/documents/return/list",
    indent: true,
  },
];

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isHovered: boolean;
  active: boolean;
  indent?: boolean;
}

const SidebarItem = ({ icon, label, href, isHovered, active, indent }: SidebarItemProps) => (
  <Link href={href}>
    <div
      className={cn(
        "flex items-center gap-4 px-4 py-2.5 transition-all duration-200 group relative cursor-pointer",
        indent && isHovered && "pl-8",
        active
          ? "bg-primary/10 text-primary border-r-4 border-primary"
          : "text-slate-500 hover:bg-slate-50 hover:text-primary"
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 w-6 flex justify-center",
          active ? "text-primary" : "text-slate-400 group-hover:text-primary"
        )}
      >
        {icon}
      </div>

      <span
        className={cn(
          "font-medium text-[13px] whitespace-nowrap transition-all duration-300 flex-1",
          isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"
        )}
      >
        {label}
      </span>

      {!isHovered && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-primary text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-lg">
          {label}
        </div>
      )}
    </div>
  </Link>
);

const SaleManagerSidebar = () => {
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();

  const isActive = (item: SaleManagerNavItem) => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "flex flex-col bg-white border-r border-slate-100 transition-all duration-300 ease-in-out h-screen sticky top-0 z-50 shadow-xl",
        isHovered ? "w-64" : "w-16"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center px-3 overflow-hidden border-b border-slate-50 transition-all duration-300",
          isHovered ? "h-24" : "h-16"
        )}
      >
        <AppLogo showText={isHovered} />
      </div>

      <div
        className={cn(
          "px-4 pt-4 pb-1 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap transition-opacity duration-300",
          isHovered ? "opacity-100" : "opacity-0"
        )}
      >
        Sales Panel
      </div>

      <nav className="flex-1 overflow-y-auto py-2 custom-scrollbar">
        {SALE_MANAGER_NAV.map((item) => (
          <SidebarItem
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            isHovered={isHovered}
            active={isActive(item)}
            indent={item.indent}
          />
        ))}
      </nav>

      <div className="border-t border-slate-50 py-2">
        <button
          onClick={logout}
          className={cn(
            "w-full flex items-center gap-4 px-4 py-2.5 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group relative",
            !isHovered && "justify-center"
          )}
        >
          <LogOut size={20} className="flex-shrink-0" />
          <span
            className={cn(
              "font-medium text-[13px] transition-all duration-300",
              isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
            Log out
          </span>
        </button>
      </div>
    </aside>
  );
};

export default SaleManagerSidebar;
