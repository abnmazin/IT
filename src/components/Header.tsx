"use client";

import { Search, Bell, User as UserIcon, Menu, X } from "lucide-react";
import { User } from "@/types";
import { useState, useRef, useEffect } from "react";

interface HeaderProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  onMenuToggle: () => void;
  currentUser?: User;
}

export default function Header({
  searchQuery,
  onSearch,
  onMenuToggle,
  currentUser,
}: HeaderProps) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mobileSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [mobileSearchOpen]);

  return (
    <>
      <header className="h-14 sm:h-16 bg-white border-b border-slate-200 flex items-center px-3 sm:px-6 gap-2 sm:gap-3 shrink-0">
        <button
          onClick={onMenuToggle}
          className="lg:hidden w-11 h-11 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="بحث في المخزن والزيارات..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full h-10 pr-9 pl-4 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1 sm:gap-2 ml-auto">
          <button
            onClick={() => setMobileSearchOpen(true)}
            className="sm:hidden w-11 h-11 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors shrink-0"
          >
            <Search className="w-5 h-5" />
          </button>
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

      {mobileSearchOpen && (
        <div className="fixed inset-0 bg-white z-50 sm:hidden flex flex-col">
          <div className="flex items-center gap-2 px-3 h-14 border-b border-slate-200 shrink-0">
            <button
              onClick={() => {
                setMobileSearchOpen(false);
                onSearch("");
              }}
              className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="بحث في المخزن والزيارات..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="w-full h-10 pr-9 pl-4 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
