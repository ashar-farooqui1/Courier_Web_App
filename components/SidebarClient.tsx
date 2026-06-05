"use client";

import dynamic from "next/dynamic";
import { useAuthSession } from "@/hooks/useAuthRole";
import { isClientRole } from "@/lib/auth/role";

const AdminSidebar = dynamic(() => import("@/components/Sidebar"), {
  ssr: false,
  loading: () => <SidebarPlaceholder />,
});

const ClientSidebar = dynamic(() => import("@/components/ClientSidebar"), {
  ssr: false,
  loading: () => <SidebarPlaceholder />,
});

function SidebarPlaceholder() {
  return (
    <aside
      className="flex w-16 flex-col border-r border-slate-100 bg-white h-screen sticky top-0 z-50 shadow-xl"
      aria-hidden
    />
  );
}

export default function AppSidebar() {
  const { role, ready } = useAuthSession();

  if (!ready) return <SidebarPlaceholder />;
  if (isClientRole(role)) return <ClientSidebar />;
  return <AdminSidebar />;
}
