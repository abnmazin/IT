"use client";

import { Bell, User as UserIcon, Menu, LogOut } from "lucide-react";
import { User } from "@/types";

interface HeaderProps {
  onMenuToggle: () => void;
  currentUser?: User;
  notificationCount?: number;
  onLogout?: () => void;
}

export default function Header({
  onMenuToggle,
  currentUser,
  notificationCount = 0,
  onLogout,
}: HeaderProps) {
  return (
    <header className="h-14 sm:h-16 bg-white border-b border-slate-200 flex items-center px-3 sm:px-6 gap-2 sm:gap-3 shrink-0">
      <button
        onClick={onMenuToggle}
        className="lg:hidden w-11 h-11 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors shrink-0"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-1 sm:gap-2">
        <button className="relative w-11 h-11 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors shrink-0">
          <Bell className="w-[18px] h-[18px]" />
          {notificationCount > 0 && (
            <span className="absolute top-2 left-2 min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
              {notificationCount > 99 ? "99+" : notificationCount}
            </span>
          )}
        </button>

        {currentUser && (
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-xs font-medium text-slate-600 truncate max-w-[100px]">
              {currentUser.name}
            </span>
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-slate-500" />
            </div>
          </div>
        )}

        {onLogout && (
          <button
            onClick={onLogout}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
            title="تسجيل خروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
}
