"use client";

import { Bell, User as UserIcon, Menu } from "lucide-react";
import { User } from "@/types";

interface HeaderProps {
  onMenuToggle: () => void;
  currentUser?: User;
}

export default function Header({
  onMenuToggle,
  currentUser,
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
          <span className="absolute top-2.5 left-2.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="w-11 h-11 flex items-center justify-center shrink-0">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
            <UserIcon className="w-4 h-4 text-slate-500" />
          </div>
        </div>
      </div>
    </header>
  );
}
