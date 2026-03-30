"use client";

import { useState } from "react";
import { Download, X, Smartphone, Share } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { usePWA } from "@/lib/pwa/PWAContext";
import { AnimatePresence, motion } from "framer-motion";

export default function InstallPrompt() {
  const { isInstallable, deferredPrompt, showIOSInstructions, dismissIOSInstructions, installApp, isInstalled } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);
  const { lang, t } = useLanguage();
  const isRTL = lang === 'ar';

  if (isDismissed || isInstalled) return null;

  return (
    <AnimatePresence>
      {/* Android/Desktop Mini Prompt */}
      {deferredPrompt && !isDismissed && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-sm"
        >
          <div className="bg-black text-white p-4 rounded-[2rem] shadow-2xl flex items-center justify-between border border-white/10 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest leading-none mb-1">
                  {isRTL ? "تثبيت التطبيق" : "Install App"}
                </p>
                <p className="text-[10px] text-neutral-400 font-medium whitespace-nowrap">
                  {isRTL ? "دخول أسرع وبدون إنترنت" : "Faster, seamless experience"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={installApp}
                className="bg-white text-black text-[10px] font-black uppercase px-4 py-2 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg"
              >
                {isRTL ? "تثبيت" : "Install"}
              </button>
              <button onClick={() => setIsDismissed(true)} className="p-2 text-neutral-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* iOS Manual Instructions Modal */}
      {showIOSInstructions && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={dismissIOSInstructions}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[110] w-[90%] max-w-sm"
          >
            <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden text-center">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-600" />
              <button onClick={dismissIOSInstructions} className="absolute top-6 right-6 p-2 bg-neutral-100 rounded-full text-neutral-400 hover:text-black hover:rotate-90 transition-all">
                <X className="w-4 h-4" />
              </button>
              
              <div className="w-16 h-16 bg-neutral-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Smartphone className="w-8 h-8 text-indigo-600" />
              </div>
              
              <h3 className="text-xl font-black mb-2">{isRTL ? "أضف DOK-RAN لشاشتك" : "Add to Home Screen"}</h3>
              <p className="text-neutral-500 text-sm mb-8 leading-relaxed px-4">
                {isRTL 
                  ? "لتحصل على متعة التسوق الكاملة وتنبيهات فورية بطلباتك."
                  : "To get the best experience and instant notifications for your custom orders."}
              </p>
              
              <div className="space-y-4 text-left font-medium">
                 <div className="flex items-start gap-4 p-4 bg-neutral-50 rounded-2xl">
                    <span className="w-6 h-6 bg-white border rounded-full flex items-center justify-center text-xs font-black shrink-0">1</span>
                    <p className="text-xs text-neutral-600">
                      {isRTL ? "اضغط على أيقونة 'مشاركة' في متصفح سفاري." : "Tap the 'Share' icon in the Safari toolbar."}
                      <span className="inline-flex items-center ml-1 opacity-50"><Share className="w-3 h-3" /></span>
                    </p>
                 </div>
                 <div className="flex items-start gap-4 p-4 bg-neutral-50 rounded-2xl">
                    <span className="w-6 h-6 bg-white border rounded-full flex items-center justify-center text-xs font-black shrink-0">2</span>
                    <p className="text-xs text-neutral-600">
                      {isRTL ? "مرر للأسفل واختر 'أضف إلى الصفحة الرئيسية'." : "Scroll down and tap 'Add to Home Screen'."}
                    </p>
                 </div>
              </div>

              <button 
                onClick={dismissIOSInstructions}
                className="w-full mt-8 bg-black text-white py-4 rounded-2xl font-black shadow-lg hover:scale-[1.02] active:scale-95 transition-all text-sm"
              >
                {isRTL ? "تم، فهمت!" : "Got it!"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
