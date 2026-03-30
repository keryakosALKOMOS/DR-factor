"use client";

import { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { ShoppingBag, User, Globe, LogOut, Menu, X, Download } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useSession, signOut } from "next-auth/react";
import { usePWA } from "@/lib/pwa/PWAContext";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/ui/Logo";

export default function Navbar() {
  const items = useCartStore((state) => state.items);
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const { t, lang, setLang } = useLanguage();
  const { data: session } = useSession();
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isRTL = lang === "ar";

  const navLinks = [
    { href: "/products?category=men", label: t("nav.men") },
    { href: "/products?category=women", label: t("nav.women") },
    { href: "/custom-design", label: t("nav.uploadDesign"), highlight: true },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white/90 border-b z-50 flex items-center justify-between px-6 md:px-12 backdrop-blur-md">
        {/* Left: Hamburger (Mobile) / Brand */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 -ml-2 hover:bg-neutral-100 rounded-xl transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center">
            <Link href="/" className="inline-block flex items-center justify-center">
              <Logo className="h-10 w-auto sm:h-12" />
            </Link>
          </div>
        </div>

        {/* Center: Links (Desktop) */}
        <div className="hidden md:flex items-center space-x-1 font-medium">
          {navLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href} 
              className={`px-4 py-2 rounded-full transition-all text-sm ${
                link.highlight 
                ? "text-indigo-600 bg-indigo-50 hover:bg-indigo-100 font-bold ml-4" 
                : "hover:bg-neutral-100 text-neutral-600"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-2 md:gap-6 text-sm font-medium">
          {/* Language Switcher (Desktop/Tablet) */}
          <button 
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="hidden sm:flex items-center hover:text-indigo-600 transition-colors gap-1.5 text-neutral-600 px-2 py-1"
            title="Switch Language"
          >
            <Globe className="w-5 h-5" />
            <span className="font-bold">{lang === "en" ? "AR" : "EN"}</span>
          </button>

          {/* Auth (Desktop) */}
          <div className="hidden sm:block">
            {session ? (
              <div className="flex items-center gap-4">
                <Link href="/profile" className="flex items-center gap-2 hover:text-indigo-600 transition-colors text-neutral-600">
                  <User className="w-5 h-5" />
                  <span className="hidden lg:inline">My Orders</span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2 hover:text-red-600 transition-colors text-neutral-400"
                  title={t("nav.signOut") || "Sign Out"}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link href="/login" className="flex items-center gap-2 hover:text-black transition-colors text-neutral-600">
                <User className="w-5 h-5" />
                <span className="hidden lg:inline">{t("nav.signIn")}</span>
              </Link>
            )}
          </div>

          {/* Cart (Always) */}
          <Link href="/cart" className="relative p-2 hover:bg-neutral-50 rounded-xl transition-colors">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-black text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-black">
                {cartCount}
              </span>
            )}
          </Link>
          
          {/* Install Button (Desktop) */}
          {isInstallable && !isInstalled && (
            <button 
              onClick={installApp}
              className="hidden lg:flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-xs font-black hover:bg-neutral-800 transition-all active:scale-95 shadow-lg"
            >
              <Download className="w-4 h-4" />
              {isRTL ? "تحميل التطبيق" : "Install App"}
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: isRTL ? "100%" : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? "100%" : "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`fixed top-0 bottom-0 ${isRTL ? "right-0" : "left-0"} w-[280px] bg-white z-[70] shadow-2xl flex flex-col`}
            >
              <div className="p-6 border-b flex items-center justify-between">
                <Logo className="h-10 w-auto" />
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-neutral-100 rounded-xl">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-2xl text-lg font-bold ${
                      link.highlight ? "bg-indigo-50 text-indigo-700" : "hover:bg-neutral-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="p-6 border-t space-y-4">
                {/* Mobile Auth */}
                {session ? (
                  <div className="space-y-3">
                    <Link
                      href="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full flex items-center justify-center gap-3 py-3 bg-indigo-50 text-indigo-700 rounded-2xl font-bold"
                    >
                      <User className="w-5 h-5" />
                      My Orders
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full flex items-center justify-center gap-3 py-3 bg-neutral-100 rounded-2xl font-bold text-red-600"
                    >
                      <LogOut className="w-5 h-5" />
                      {t("nav.signOut") || "Sign Out"}
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-3 py-3 bg-black text-white rounded-2xl font-bold"
                  >
                    <User className="w-5 h-5" />
                    {t("nav.signIn")}
                  </Link>
                )}

                {/* Mobile Install App Button */}
                {isInstallable && !isInstalled && (
                   <button
                    onClick={() => {
                        setIsMobileMenuOpen(false);
                        installApp();
                    }}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-200 active:scale-95 transition-all"
                  >
                    <Download className="w-5 h-5" />
                    {isRTL ? "تحميل التطبيق الآن" : "Install App Now"}
                  </button>
                )}

                {/* Mobile Lang Switch */}
                <button
                  onClick={() => setLang(lang === "en" ? "ar" : "en")}
                  className="w-full flex items-center justify-center gap-3 py-3 border border-neutral-200 rounded-2xl font-bold"
                >
                  <Globe className="w-5 h-5 text-neutral-500" />
                  {lang === "en" ? "العربية" : "English"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
