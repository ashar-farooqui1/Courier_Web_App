"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  KeyRound,
  LogOut,
  MapPin,
  Maximize2,
  Pencil,
  Settings,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/auth/role";
import { AdminSettingsDialog } from "@/components/admin/AdminSettingsDialog";

interface AdminProfileMenuProps {
  displayName: string;
  city?: string;
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
}

function MenuItem({ icon, label, onClick, className }: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-2.5 text-left text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors",
        className
      )}
    >
      <span className="text-slate-400 w-4 flex justify-center shrink-0">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export function AdminProfileMenu({
  displayName,
  city = "Lahore",
}: AdminProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const openSettings = () => {
    setOpen(false);
    setSettingsOpen(true);
  };

  const handleLogout = () => {
    setOpen(false);
    logout();
  };

  return (
    <>
      <div className="flex items-center gap-6">
        <button
          type="button"
          className="text-white/80 hover:text-white transition-colors"
          aria-label="Fullscreen"
        >
          <Maximize2 size={18} />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex items-center gap-3 pl-4 border-l border-white/20 hover:opacity-90 transition-opacity"
            aria-expanded={open}
            aria-haspopup="menu"
          >
            <div className="text-right">
              <p className="text-[11px] font-bold leading-none uppercase tracking-tighter">
                {displayName}
              </p>
              <p className="text-[9px] text-white/70 font-medium mt-1">Available</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center overflow-hidden">
              <User size={20} className="text-white" />
            </div>
          </button>

          {open ? (
            <div
              className="absolute right-0 top-[calc(100%+10px)] w-56 bg-white rounded-lg shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
              role="menu"
            >
              <div className="absolute -top-2 right-4 w-4 h-4 bg-white border-l border-t border-slate-100 rotate-45" />

              <MenuItem icon={<Pencil size={14} />} label="Update Profile Picture" />
              <MenuItem icon={<KeyRound size={14} />} label="Update Password" />

              <div className="my-1 border-t border-slate-100" />

              <MenuItem icon={<Settings size={14} />} label="Settings" onClick={openSettings} />
              <MenuItem
                icon={<MapPin size={14} />}
                label={city}
                className="cursor-default hover:bg-white"
              />
              <MenuItem
                icon={<LogOut size={14} />}
                label="Logout"
                onClick={handleLogout}
                className="text-red-600 hover:bg-red-50"
              />
            </div>
          ) : null}
        </div>
      </div>

      <AdminSettingsDialog isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
