"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavTabProps {
  icon: any;
  label: string;
  href: string;
}

const NavTab = ({ icon: Icon, label, href }: NavTabProps) => {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex-1 flex items-center justify-center gap-2 px-6 py-3 text-[11px] font-bold uppercase tracking-widest transition-all rounded-md border",
        active 
          ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
          : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-primary hover:border-primary/30"
      )}
    >
      <Icon size={14} />
      {label}
    </Link>
  );
};

interface InTransitNavProps {
  tabs: {
    icon: any;
    label: string;
    href: string;
  }[];
}

export const InTransitNav = ({ tabs }: InTransitNavProps) => {
  return (
    <div className="flex items-center gap-4 max-w-4xl mx-auto mb-8">
      {tabs.map((tab, idx) => (
        <NavTab key={idx} {...tab} />
      ))}
    </div>
  );
};
