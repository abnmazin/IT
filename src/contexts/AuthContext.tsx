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

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeUsers((u) => {
      setUsers(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const login = useCallback(
    (username: string, pin: string): boolean => {
      const found = users.find(
        (u) => u.name === username && u.pin === pin && u.active
      );
      if (found) {
        setUser(found);
        if (typeof window !== "undefined") {
          localStorage.setItem("it-inventory-user", found.id);
        }
        return true;
      }
      return false;
    },
    [users]
  );

  useEffect(() => {
    if (typeof window !== "undefined" && users.length > 0) {
      const savedId = localStorage.getItem("it-inventory-user");
      if (savedId) {
        const found = users.find((u) => u.id === savedId && u.active);
        if (found) setUser(found);
      }
    }
  }, [users]);

  const logout = useCallback(() => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("it-inventory-user");
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, users, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
