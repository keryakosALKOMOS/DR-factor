"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface PWAContextType {
  deferredPrompt: any;
  isInstallable: boolean;
  isInstalled: boolean;
  showIOSInstructions: boolean;
  installApp: () => Promise<void>;
  dismissIOSInstructions: () => void;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // 1. Detect if already installed
    const isInStandaloneMode = () => 
      (window.matchMedia('(display-mode: standalone)').matches) || 
      ((window.navigator as any).standalone) || 
      document.referrer.includes('android-app://');
    
    if (isInStandaloneMode()) {
      setIsInstalled(true);
    }

    // 2. Handle iOS detection for manual instructions
    const isIos = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      setIsInstallable(true);
      console.log("PWA: beforeinstallprompt event fired and captured.");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // If it's iOS and not installed, we can suggest manual install
    if (isIos() && !isInStandaloneMode()) {
       // We don't show it immediately, but mark as installable for the UI
       setIsInstallable(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const installApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setIsInstallable(false);
        setIsInstalled(true);
      }
    } else {
      // Logic for iOS or fallback
      const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
      if (isIos) {
        setShowIOSInstructions(true);
      }
    }
  };

  const dismissIOSInstructions = () => setShowIOSInstructions(false);

  return (
    <PWAContext.Provider 
      value={{ 
        deferredPrompt, 
        isInstallable, 
        isInstalled, 
        showIOSInstructions, 
        installApp,
        dismissIOSInstructions
      }}
    >
      {children}
    </PWAContext.Provider>
  );
}

export function usePWA() {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error("usePWA must be used within a PWAProvider");
  }
  return context;
}
