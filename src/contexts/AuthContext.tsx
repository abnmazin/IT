"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { User } from "@/types";
import { subscribeUsers } from "@/lib/firestore";

interface AuthContextType {
  user: User | null;
  users: User[];
  loading: boolean;
  login: (username: string, pin: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  users: [],
  loading: true,
  login: () => false,
  logout: () => {},
});

const USERS_CACHE_KEY = "it-inventory-users-cache";
const SESSION_KEY = "it-inventory-user";

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
        (u) => u.name === username && u.pin === pin && u.active
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

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {}
  }, []);

  return (
    <AuthContext.Provider value={{ user, users, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
