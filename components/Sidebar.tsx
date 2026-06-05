"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Smartphone,
  Package, 
  Truck, 
  FileText,
  FileSearch,
  MapPin,
  Users,
  Map,
  UserCheck,
  Building2,
  ReceiptText,
  Webhook,
  LogOut,
  ChevronRight,
  ChevronDown,
  CircleDot,
  FileStack,
  SearchCode,
  ClipboardList,
  Scale
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AppLogo from '@/components/AppLogo';
import { clearLoginSession } from "@/lib/auth/role";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isHovered: boolean;
  active: boolean;
  hasSubmenu?: boolean;
  isOpen?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

const SidebarItem = ({ icon, label, href, isHovered, active, hasSubmenu, isOpen, onClick, children }: SidebarItemProps) => {
  const content = (
    <div
      className={cn(
        "flex items-center gap-4 px-4 py-2.5 transition-all duration-200 group relative cursor-pointer",
        active 
          ? "bg-primary/10 text-primary border-r-4 border-primary" 
          : "text-slate-500 hover:bg-slate-50 hover:text-primary"
      )}
      onClick={onClick}
    >
      <div className={cn("flex-shrink-0 w-6 flex justify-center", active ? "text-primary" : "text-slate-400 group-hover:text-primary")}>
        {icon}
      </div>
      
      <span className={cn(
        "font-medium text-[13px] whitespace-nowrap transition-all duration-300 flex-1",
        isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"
      )}>
        {label}
      </span>

      {hasSubmenu && isHovered && (
        isOpen ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />
      )}
      
      {!isHovered && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-primary text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-lg">
          {label}
        </div>
      )}
    </div>
  );

  if (hasSubmenu) {
    return (
      <div className="flex flex-col">
        {content}
        {isOpen && isHovered && (
          <div className="bg-slate-50/50 py-1 flex flex-col">
            {children}
          </div>
        )}
      </div>
    );
  }

  return <Link href={href}>{content}</Link>;
};

const Sidebar = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    clearLoginSession();
    router.push('/');
  };

  const toggleMenu = (label: string) => {
    setOpenMenus(prev => 
      prev.includes(label) ? prev.filter(m => m !== label) : [...prev, label]
    );
  };

  const isMenuOpen = (label: string) => openMenus.includes(label);

  return (
    <aside 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
      className={cn(
        "flex flex-col bg-white border-r border-slate-100 transition-all duration-300 ease-in-out h-screen sticky top-0 z-50 shadow-xl",
        isHovered ? "w-64" : "w-16"
      )}
    >
      <div className="h-16 flex items-center px-4 overflow-hidden border-b border-slate-50">
        <div className={cn("transition-all duration-300", isHovered ? "scale-90" : "scale-75 -ml-1")}>
          <AppLogo showText={isHovered} />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        <SidebarItem
          icon={<LayoutDashboard size={20} />}
          label="Dashboard"
          href="/dashboard"
          isHovered={isHovered}
          active={pathname === '/dashboard'}
        />

        {/* Rider App Dropdown */}
        <SidebarItem
          icon={<Smartphone size={20} />}
          label="Rider App"
          href="#"
          isHovered={isHovered}
          active={pathname.startsWith('/rider-app')}
          hasSubmenu
          isOpen={isMenuOpen('Rider App')}
          onClick={() => toggleMenu('Rider App')}
        >
          <Link href="/rider-app/manage-riders" className={cn(
            "pl-14 py-2 text-[12px] font-medium transition-colors hover:text-primary",
            pathname === '/rider-app/manage-riders' ? "text-primary" : "text-slate-400"
          )}>
            Manage Riders
          </Link>
          <Link href="/rider-app/manage-requests" className={cn(
            "pl-14 py-2 text-[12px] font-medium transition-colors hover:text-primary",
            pathname === '/rider-app/manage-requests' ? "text-primary" : "text-slate-400"
          )}>
            Manage Requests
          </Link>
        </SidebarItem>

        {/* Orders Dropdown - NEW SUBMENU ITEMS */}
        <SidebarItem
          icon={<Package size={20} />}
          label="Orders"
          href="#"
          isHovered={isHovered}
          active={pathname.startsWith('/orders')}
          hasSubmenu
          isOpen={isMenuOpen('Orders')}
          onClick={() => toggleMenu('Orders')}
        >
          <Link href="/orders/details" className={cn(
            "pl-14 py-2 text-[12px] font-medium transition-colors hover:text-primary",
            pathname === '/orders/details' ? "text-primary" : "text-slate-400"
          )}>
            Orders
          </Link>
          <Link href="/orders/courier-settlement" className={cn(
            "pl-14 py-2 text-[12px] font-medium transition-colors hover:text-primary",
            pathname === '/orders/courier-settlement' ? "text-primary" : "text-slate-400"
          )}>
            Couriers Settlement
          </Link>
          <Link href="/orders/client-settlement" className={cn(
            "pl-14 py-2 text-[12px] font-medium transition-colors hover:text-primary",
            pathname === '/orders/client-settlement' ? "text-primary" : "text-slate-400"
          )}>
            Client Settlement
          </Link>
          <Link href="/orders/outstation" className={cn(
            "pl-14 py-2 text-[12px] font-medium transition-colors hover:text-primary",
            pathname === '/orders/outstation' ? "text-primary" : "text-slate-400"
          )}>
            Order OutStation Report
          </Link>
          <Link href="/orders/claims" className={cn(
            "pl-14 py-2 text-[12px] font-medium transition-colors hover:text-primary",
            pathname === '/orders/claims' ? "text-primary" : "text-slate-400"
          )}>
            Orders Claims
          </Link>
          <Link href="/orders/advices" className={cn(
            "pl-14 py-2 text-[12px] font-medium transition-colors hover:text-primary",
            pathname === '/orders/advices' ? "text-primary" : "text-slate-400"
          )}>
            Orders Advices
          </Link>
          <Link href="/orders/replacement" className={cn(
            "pl-14 py-2 text-[12px] font-medium transition-colors hover:text-primary",
            pathname === '/orders/replacement' ? "text-primary" : "text-slate-400"
          )}>
            Orders Replacement
          </Link>
          <Link href="/orders/re-weight" className={cn(
            "pl-14 py-2 text-[12px] font-medium transition-colors hover:text-primary",
            pathname === '/orders/re-weight' ? "text-primary" : "text-slate-400"
          )}>
            Re-Weight Arrivals
          </Link>
          <Link href="/orders/rollcarts" className={cn(
            "pl-14 py-2 text-[12px] font-medium transition-colors hover:text-primary",
            pathname === '/orders/rollcarts' ? "text-primary" : "text-slate-400"
          )}>
            Create Rollcarts
          </Link>
          <Link href="/orders/quick-scan" className={cn(
            "pl-14 py-2 text-[12px] font-medium transition-colors hover:text-primary",
            pathname === '/orders/quick-scan' ? "text-primary" : "text-slate-400"
          )}>
            Quick Scan
          </Link>
          <Link href="/orders/invoices" className={cn(
            "pl-14 py-2 text-[12px] font-medium transition-colors hover:text-primary",
            pathname === '/orders/invoices' ? "text-primary" : "text-slate-400"
          )}>
            Client Invoices
          </Link>
          <Link href="/orders/debriefing" className={cn(
            "pl-14 py-2 text-[12px] font-medium transition-colors hover:text-primary",
            pathname === '/orders/debriefing' ? "text-primary" : "text-slate-400"
          )}>
            Rollcart Debriefing
          </Link>
          <Link href="/orders/receivable" className={cn(
            "pl-14 py-2 text-[12px] font-medium transition-colors hover:text-primary",
            pathname === '/orders/receivable' ? "text-primary" : "text-slate-400"
          )}>
            Rollcart Receivable
          </Link>
        </SidebarItem>

        {/* Third Party Orders Dropdown */}
        <SidebarItem
          icon={<FileSearch size={20} />}
          label="Third Party Orders"
          href="#"
          isHovered={isHovered}
          active={pathname.startsWith('/third-party')}
          hasSubmenu
          isOpen={isMenuOpen('Third Party Orders')}
          onClick={() => toggleMenu('Third Party Orders')}
        >
          <Link href="/third-party/orders" className={cn(
            "pl-14 py-2 text-[12px] font-medium transition-colors hover:text-primary",
            pathname === '/third-party/orders' ? "text-primary" : "text-slate-400"
          )}>
            Orders
          </Link>
          <Link href="/third-party/delivery-types" className={cn(
            "pl-14 py-2 text-[12px] font-medium transition-colors hover:text-primary",
            pathname === '/third-party/delivery-types' ? "text-primary" : "text-slate-400"
          )}>
            Delivery Types
          </Link>
          <Link href="/third-party/swyft-scan" className={cn(
            "pl-14 py-2 text-[12px] font-medium transition-colors hover:text-primary",
            pathname === '/third-party/swyft-scan' ? "text-primary" : "text-slate-400"
          )}>
            Swyft Scan
          </Link>
          <Link href="/third-party/lcs-scan" className={cn(
            "pl-14 py-2 text-[12px] font-medium transition-colors hover:text-primary",
            pathname === '/third-party/lcs-scan' ? "text-primary" : "text-slate-400"
          )}>
            LCS Scan
          </Link>
        </SidebarItem>

        {/* Reports Dropdown */}
        <SidebarItem
          icon={<FileText size={20} />}
          label="Reports"
          href="#"
          isHovered={isHovered}
          active={pathname.startsWith('/reports')}
          hasSubmenu
          isOpen={isMenuOpen('Reports')}
          onClick={() => toggleMenu('Reports')}
        >
          <Link href="/reports/order-details" className={cn(
            "pl-14 py-2 text-[12px] font-medium transition-colors hover:text-primary",
            pathname === '/reports/order-details' ? "text-primary" : "text-slate-400"
          )}>
            Order Details Report
          </Link>
          <Link href="/reports/attempt-ratio" className={cn(
            "pl-14 py-2 text-[12px] font-medium transition-colors hover:text-primary",
            pathname === '/reports/attempt-ratio' ? "text-primary" : "text-slate-400"
          )}>
            Attempt Ratio Report
          </Link>
          <Link href="/reports/ltr" className={cn(
            "pl-14 py-2 text-[12px] font-medium transition-colors hover:text-primary",
            pathname === '/reports/ltr' ? "text-primary" : "text-slate-400"
          )}>
            LTR Report
          </Link>
          <Link href="/reports/order-status" className={cn(
            "pl-14 py-2 text-[12px] font-medium transition-colors hover:text-primary",
            pathname === '/reports/order-status' ? "text-primary" : "text-slate-400"
          )}>
            Order Status Report
          </Link>
          <Link href="/reports/delivered" className={cn(
            "pl-14 py-2 text-[12px] font-medium transition-colors hover:text-primary",
            pathname === '/reports/delivered' ? "text-primary" : "text-slate-400"
          )}>
            Delivered Report
          </Link>
          <Link href="/reports/debriefing" className={cn(
            "pl-14 py-2 text-[12px] font-medium transition-colors hover:text-primary",
            pathname === '/reports/debriefing' ? "text-primary" : "text-slate-400"
          )}>
            Debriefing Report
          </Link>
          <Link href="/reports/picked-up" className={cn(
            "pl-14 py-2 text-[12px] font-medium transition-colors hover:text-primary",
            pathname === '/reports/picked-up' ? "text-primary" : "text-slate-400"
          )}>
            Picked Up Report
          </Link>
          <Link href="/reports/orders-invoice" className={cn(
            "pl-14 py-2 text-[12px] font-medium transition-colors hover:text-primary",
            pathname === '/reports/orders-invoice' ? "text-primary" : "text-slate-400"
          )}>
            Orders Invoice Report
          </Link>
          <Link href="/reports/delivery-charges" className={cn(
            "pl-14 py-2 text-[12px] font-medium transition-colors hover:text-primary",
            pathname === '/reports/delivery-charges' ? "text-primary" : "text-slate-400"
          )}>
            Delivery Charges Report
          </Link>
          <Link href="/reports/shipment-charges" className={cn(
            "pl-14 py-2 text-[12px] font-medium transition-colors hover:text-primary",
            pathname === '/reports/shipment-charges' ? "text-primary" : "text-slate-400"
          )}>
            Shipment Charges Report
          </Link>
        </SidebarItem>

        {/* Documents Dropdown */}
        <SidebarItem
          icon={<FileSearch size={20} />}
          label="Documents"
          href="#"
          isHovered={isHovered}
          active={pathname.startsWith('/documents')}
          hasSubmenu
          isOpen={isMenuOpen('Documents')}
          onClick={() => toggleMenu('Documents')}
        >
          <Link href="/documents/loadsheet" className={cn(
            "pl-14 py-2 text-[12px] font-medium transition-colors hover:text-primary",
            pathname === '/documents/loadsheet' ? "text-primary" : "text-slate-400"
          )}>
            Loadsheet Document
          </Link>
          <Link href="/documents/rollcarts" className={cn(
            "pl-14 py-2 text-[12px] font-medium transition-colors hover:text-primary",
            pathname === '/documents/rollcarts' ? "text-primary" : "text-slate-400"
          )}>
            Rollcarts
          </Link>
          <Link href="/documents/return" className={cn(
            "pl-14 py-2 text-[12px] font-medium transition-colors hover:text-primary",
            pathname === '/documents/return' ? "text-primary" : "text-slate-400"
          )}>
            Return Document
          </Link>
          <Link href="/documents/replacement" className={cn(
            "pl-14 py-2 text-[12px] font-medium transition-colors hover:text-primary",
            pathname === '/documents/replacement' ? "text-primary" : "text-slate-400"
          )}>
            Replacement Document
          </Link>
        </SidebarItem>
        {/* In Transit Dropdown */}
        <SidebarItem
          icon={<Truck size={20} />}
          label="In Transit"
          href="#"
          isHovered={isHovered}
          active={pathname.startsWith('/in-transit')}
          hasSubmenu
          isOpen={isMenuOpen('In Transit')}
          onClick={() => toggleMenu('In Transit')}
        >
          <Link href="/in-transit/sacked" className={cn(
            "pl-14 py-2 text-[12px] font-medium transition-colors hover:text-primary",
            pathname === '/in-transit/sacked' ? "text-primary" : "text-slate-400"
          )}>
            Sacked
          </Link>
          <Link href="/in-transit/de-sacked" className={cn(
            "pl-14 py-2 text-[12px] font-medium transition-colors hover:text-primary",
            pathname === '/in-transit/de-sacked' ? "text-primary" : "text-slate-400"
          )}>
            De-Sacked
          </Link>
          <Link href="/in-transit/sacked-history" className={cn(
            "pl-14 py-2 text-[12px] font-medium transition-colors hover:text-primary",
            pathname === '/in-transit/sacked-history' ? "text-primary" : "text-slate-400"
          )}>
            Sacked History
          </Link>
          <Link href="/in-transit/generate" className={cn(
            "pl-14 py-2 text-[12px] font-medium transition-colors hover:text-primary",
            pathname === '/in-transit/generate' ? "text-primary" : "text-slate-400"
          )}>
            Generate Intransit
          </Link>
          <Link href="/in-transit/receive" className={cn(
            "pl-14 py-2 text-[12px] font-medium transition-colors hover:text-primary",
            pathname === '/in-transit/receive' ? "text-primary" : "text-slate-400"
          )}>
            Intransit Receive
          </Link>
          <Link href="/in-transit/record" className={cn(
            "pl-14 py-2 text-[12px] font-medium transition-colors hover:text-primary",
            pathname === '/in-transit/record' ? "text-primary" : "text-slate-400"
          )}>
            Intransit Record
          </Link>
        </SidebarItem>
        <SidebarItem icon={<Users size={20} />} label="Rider" href="/dashboard/riders" isHovered={isHovered} active={pathname === '/dashboard/riders'} />
        <SidebarItem icon={<MapPin size={20} />} label="Cities" href="/dashboard/cities" isHovered={isHovered} active={pathname === '/dashboard/cities'} />
        <SidebarItem icon={<Map size={20} />} label="Active Orders" href="/dashboard/active-orders" isHovered={isHovered} active={pathname === '/dashboard/active-orders'} />
        <SidebarItem icon={<UserCheck size={20} />} label="Client" href="/dashboard/clients" isHovered={isHovered} active={pathname === '/dashboard/clients'} />
        <SidebarItem icon={<Users size={20} />} label="Admin" href="/dashboard/admin" isHovered={isHovered} active={pathname === '/dashboard/admin'} />
        <SidebarItem icon={<Building2 size={20} />} label="Warehouses" href="/dashboard/warehouses" isHovered={isHovered} active={pathname === '/dashboard/warehouses'} />
        <SidebarItem icon={<ReceiptText size={20} />} label="Invoices" href="/dashboard/invoices" isHovered={isHovered} active={pathname === '/dashboard/invoices'} />
        <SidebarItem icon={<Webhook size={20} />} label="Web Hook" href="/dashboard/webhook" isHovered={isHovered} active={pathname === '/dashboard/webhook'} />
      </nav>

      <div className="border-t border-slate-50 py-2">
        <button 
          onClick={handleLogout}
          className={cn(
          "w-full flex items-center gap-4 px-4 py-2.5 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group relative",
          !isHovered && "justify-center"
        )}>
          <LogOut size={20} className="flex-shrink-0" />
          <span className={cn(
            "font-medium text-[13px] transition-all duration-300",
            isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
          )}>
            Log out
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
