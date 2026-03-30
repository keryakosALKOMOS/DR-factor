"use client";
import { SessionProvider } from "next-auth/react";
import { PWAProvider } from "@/lib/pwa/PWAContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PWAProvider>
      <SessionProvider>{children}</SessionProvider>
    </PWAProvider>
  );
}
