"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { User } from "@/types";
import { subscribeUsers } from "@/lib/firestore";

interface AuthContextType {
  user: User | null;
  users: User[];
  loading: boolean;
  login: (username: string, pin: string) => boolean;
  loginAsGuest: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  users: [],
  loading: true,
  login: () => false,
  loginAsGuest: () => {},
  logout: () => {},
});

const USERS_CACHE_KEY = "it-inventory-users-cache";
const SESSION_KEY = "it-inventory-user";
const DEMO_KEY = "it-inventory-demo";

export const GUEST_USER: User = { id: "guest", name: "ضيف", role: "admin", pin: "", active: true };

export function isDemoSession(): boolean {
  try {
    return typeof window !== "undefined" && localStorage.getItem(DEMO_KEY) === "1";
  } catch {
    return false;
  }
}

export function useAuth() {
  return useContext(AuthContext);
}

function cacheUsers(users: User[]) {
  try {
    localStorage.setItem(USERS_CACHE_KEY, JSON.stringify(users));
  } catch {}
}

function getCachedUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemoSession()) {
      setUser(GUEST_USER);
      setLoading(false);
      return;
    }

    // Start with cached users so offline login works immediately
    const cached = getCachedUsers();
    if (cached.length > 0) {
      setUsers(cached);
    }

    const unsub = subscribeUsers((u) => {
      setUsers(u);
      setLoading(false);
      cacheUsers(u);
    });

    const timer = setTimeout(() => {
      setLoading((prev) => {
        if (prev) {
          const c = getCachedUsers();
          if (c.length > 0) setUsers(c);
          return false;
        }
        return prev;
      });
    }, 3000);

    return () => { unsub(); clearTimeout(timer); };
  }, []);

  const login = useCallback(
    (username: string, pin: string): boolean => {
      const found = users.find(
        (u) => u.name.toLowerCase() === username.toLowerCase().trim() && u.pin === pin && u.active
      );
      if (found) {
        setUser(found);
        try {
          localStorage.setItem(SESSION_KEY, found.id);
        } catch {}
        return true;
      }
      return false;
    },
    [users]
  );

  useEffect(() => {
    if (users.length > 0) {
      try {
        const savedId = localStorage.getItem(SESSION_KEY);
        if (savedId) {
          const found = users.find((u) => u.id === savedId && u.active);
          if (found) setUser(found);
        }
      } catch {}
    }
  }, [users]);

  const loginAsGuest = useCallback(() => {
    try {
      localStorage.setItem(DEMO_KEY, "1");
      localStorage.setItem(SESSION_KEY, GUEST_USER.id);
    } catch {}
    setUser(GUEST_USER);
  }, []);

  const logout = useCallback(() => {
    const wasDemo = isDemoSession();
    setUser(null);
    try {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(DEMO_KEY);
    } catch {}
    if (wasDemo && typeof window !== "undefined") {
      window.location.assign("/");
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, users, loading, login, loginAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
