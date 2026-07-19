"use client";

import { ReactNode, useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { resetFirestore } from "@/lib/firestore";

export default function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__resetFirestore = resetFirestore;
    }
  }, []);

  return (
    <AuthProvider>
      <DataProvider>{children}</DataProvider>
    </AuthProvider>
  );
}
