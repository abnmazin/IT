"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MapPin, Lock, User as UserIcon, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !pin.trim()) return;
    setLoading(true);
    setError(false);
    setTimeout(() => {
      const ok = login(username.trim(), pin.trim());
      if (!ok) {
        setError(true);
        setLoading(false);
        setPin("");
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-sky-500/20 flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-sky-400" />
          </div>
          <h1 className="text-xl font-bold text-white">مخزون تقنية المعلومات</h1>
          <p className="text-sm text-slate-400 mt-1">سجّل الدخول للمتابعة</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">اسم المستخدم</label>
            <div className="relative">
              <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(false); }}
                placeholder="أدخل اسمك"
                className="w-full h-12 pr-10 pl-4 rounded-xl bg-white/10 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-400/40"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">الرمز</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                value={pin}
                onChange={(e) => { setPin(e.target.value.replace(/\D/g, "")); setError(false); }}
                placeholder="أدخل الرمز"
                className="w-full h-12 pr-10 pl-4 rounded-xl bg-white/10 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-400/40 tracking-[0.3em]"
                maxLength={8}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-xs text-red-300">اسم المستخدم أو الرمز غير صحيح</p>
            </div>
          )}

          <button
            type="submit"
            disabled={!username.trim() || !pin.trim() || loading}
            className="w-full h-12 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "جاري التحقق..." : "دخول"}
          </button>
        </form>

        <p className="text-center text-[10px] text-slate-600 mt-6">
          IT Inventory Management System
        </p>
      </div>
    </div>
  );
}
