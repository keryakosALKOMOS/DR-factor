"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, Package, Tags, Users, Settings, Globe, MessageCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/ui/Logo";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t, lang, setLang } = useLanguage();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigation = [
    { name: t("admin.dashboard"), href: "/admin", icon: <LayoutDashboard className="w-5 h-5 shrink-0" /> },
    { name: t("admin.orders"), href: "/admin/orders", icon: <ShoppingCart className="w-5 h-5 shrink-0" /> },
    { name: t("admin.customOrders"), href: "/admin/custom-orders", icon: <Package className="w-5 h-5 shrink-0" /> },
    { name: t("admin.chats") || "Customer Chats", href: "/admin/chats", icon: <MessageCircle className="w-5 h-5 shrink-0" /> },
    { name: t("admin.products"), href: "/admin/products", icon: <Tags className="w-5 h-5 shrink-0" /> },
    { name: t("admin.categories"), href: "/admin/categories", icon: <LayoutDashboard className="w-5 h-5 shrink-0" /> },
    { name: t("admin.users"), href: "/admin/users", icon: <Users className="w-5 h-5 shrink-0" /> },
    { name: t("admin.settings"), href: "/admin/settings", icon: <Settings className="w-5 h-5 shrink-0" /> },
  ];

  const isRTL = lang === "ar";

  return (
    <div className="flex bg-neutral-100 min-h-[calc(100vh-4rem)]" dir={isRTL ? "rtl" : "ltr"}>
      {/* Mobile Sidebar Toggle Button */}
      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden fixed bottom-6 left-6 z-[100] w-14 h-14 bg-black text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
        >
          <LayoutDashboard className="w-6 h-6" />
        </button>
      )}

      {/* Sidebar Overlay (Mobile) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Content */}
      <aside className={`
        fixed inset-y-0 ${isRTL ? "right-0" : "left-0"} z-[120] w-64 bg-black text-white flex flex-col pt-8 transition-transform duration-300 lg:sticky lg:top-0 lg:h-[calc(100vh-4rem)] lg:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : (isRTL ? "translate-x-full" : "-translate-x-full")}
      `}>
        <div className="px-6 mb-8 text-2xl font-black border-b border-neutral-800 pb-6 tracking-tighter flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo isDark className="h-10 w-auto" />
            <span className="text-sm font-medium text-white/50 border-l border-white/20 pl-3">Admin</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-neutral-800 rounded-lg">
            <Globe className="w-5 h-5 opacity-40 rotate-45" />
          </button>
        </div>
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                  isActive ? "bg-white text-black translate-x-2" : "text-neutral-500 hover:text-white hover:bg-neutral-900"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pb-8 px-4 flex flex-col gap-2">
           <button 
             onClick={() => setLang(lang === "en" ? "ar" : "en")}
             className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm text-neutral-500 hover:text-white hover:bg-neutral-900"
           >
             <Globe className="w-5 h-5 shrink-0" />
             {lang === "en" ? "العربية" : "English"}
           </button>
           <button 
             onClick={() => setIsSidebarOpen(false)}
             className="lg:hidden w-full py-3 bg-red-600/10 text-red-500 rounded-xl font-bold text-xs"
           >
             Close Navigation
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-neutral-50 p-4 md:p-8 pt-8 min-w-0 min-h-[calc(100vh-4rem)]">
        <div className="max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
