"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, User as UserIcon, Menu, LogOut, Wifi, WifiOff, Clock, ChevronDown } from "lucide-react";
import { User, UserRole, USER_ROLE_LABELS, ActivityLogEntry, ACTIVITY_TYPE_LABELS } from "@/types";

const ROLE_BADGE: Record<UserRole, string> = {
  admin: "bg-purple-100 text-purple-700",
  developer: "bg-amber-100 text-amber-700",
  member: "bg-sky-100 text-sky-700",
  viewer: "bg-slate-100 text-slate-600",
};

function timeAgo(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "الآن";
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
  if (diff < 604800) return `منذ ${Math.floor(diff / 86400)} يوم`;
  return new Date(timestamp).toLocaleDateString("ar-SA");
}

interface HeaderProps {
  onMenuToggle: () => void;
  currentUser?: User;
  notificationCount?: number;
  recentActivity?: ActivityLogEntry[];
  onLogout?: () => void;
  onClearNotifications?: () => void;
  onNavigateActivity?: () => void;
}

export default function Header({
  onMenuToggle,
  currentUser,
  notificationCount = 0,
  recentActivity = [],
  onLogout,
  onClearNotifications,
  onNavigateActivity,
}: HeaderProps) {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Online/offline detection
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleBellClick = () => {
    setShowNotifications((n) => !n);
    setShowProfile(false);
    if (notificationCount > 0 && onClearNotifications) {
      onClearNotifications();
    }
  };

  const handleProfileClick = () => {
    setShowProfile((p) => !p);
    setShowNotifications(false);
  };

  const handleLogout = () => {
    setShowProfile(false);
    onLogout?.();
  };

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-slate-200 flex items-center px-3 sm:px-6 gap-2 sm:gap-3 shrink-0 relative">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden w-11 h-11 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors shrink-0"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1" />

      {/* Online/offline indicator */}
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium shrink-0 ${
        isOnline ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
      }`}>
        {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
        <span className="hidden sm:inline">{isOnline ? "متصل" : "غير متصل"}</span>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        {/* Notification bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={handleBellClick}
            className={`relative w-11 h-11 flex items-center justify-center rounded-lg transition-colors shrink-0 ${
              showNotifications ? "bg-slate-100 text-slate-700" : "hover:bg-slate-100 text-slate-500 hover:text-slate-700"
            }`}
          >
            <Bell className="w-[18px] h-[18px]" />
            {notificationCount > 0 && (
              <span className="absolute top-2 left-2 min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                {notificationCount > 99 ? "99+" : notificationCount}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {showNotifications && (
            <div className="absolute left-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">الاشعارات</h3>
                {notificationCount > 0 && (
                  <span className="text-[11px] text-sky-600 font-medium bg-sky-50 px-2 py-0.5 rounded-full">
                    جديد
                  </span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {recentActivity.length === 0 ? (
                  <div className="py-10 text-center">
                    <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">لا توجد اشعارات</p>
                  </div>
                ) : (
                  recentActivity.slice(0, 15).map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-slate-500">
                          {entry.userName.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-800 leading-relaxed">{entry.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-400">{entry.userName}</span>
                          <span className="text-[10px] text-slate-300">·</span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {timeAgo(entry.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {recentActivity.length > 0 && onNavigateActivity && (
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    onNavigateActivity();
                  }}
                  className="w-full px-4 py-3 text-center text-xs font-medium text-sky-600 hover:bg-sky-50 border-t border-slate-100 transition-colors"
                >
                  عرض كل النشاطات
                </button>
              )}
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        {currentUser && (
          <div ref={profileRef} className="relative">
            <button
              onClick={handleProfileClick}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${
                showProfile ? "bg-slate-100" : "hover:bg-slate-50"
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                <UserIcon className="w-4 h-4 text-slate-500" />
              </div>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-xs font-semibold text-slate-800 truncate max-w-[100px]">
                  {currentUser.name}
                </span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${ROLE_BADGE[currentUser.role]}`}>
                  {USER_ROLE_LABELS[currentUser.role]}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform hidden sm:block ${showProfile ? "rotate-180" : ""}`} />
            </button>

            {/* Profile dropdown menu */}
            {showProfile && (
              <div className="absolute left-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                <div className="px-4 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                      <UserIcon className="w-5 h-5 text-slate-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{currentUser.name}</p>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded inline-block mt-1 ${ROLE_BADGE[currentUser.role]}`}>
                        {USER_ROLE_LABELS[currentUser.role]}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-medium">تسجيل خروج</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
