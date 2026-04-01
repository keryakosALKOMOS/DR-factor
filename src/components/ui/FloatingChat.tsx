"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import ChatBox from "./ChatBox";

export default function FloatingChat() {
  const { data: session } = useSession();
  const { t, lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [hasMessages, setHasMessages] = useState(false);
  const [loading, setLoading] = useState(true);

  const isRTL = lang === "ar";

  useEffect(() => {
    if (!session) return;

    const checkMessages = async () => {
      try {
        const res = await fetch("/api/chat/conversation/unread");
        if (res.ok) {
          const data = await res.json();
          // Show the widget if there are any messages at all (or if admin initiated)
          // For now, let's just check if the conversation exists/has messages
          const msgRes = await fetch("/api/chat/conversation");
          const msgData = await msgRes.json();
          setHasMessages(msgData.messages?.length > 0);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    checkMessages();
    const interval = setInterval(checkMessages, 10000);
    return () => clearInterval(interval);
  }, [session]);

  // If not logged in, don't show anything
  if (!session) return null;

  // Show the bubble for all logged in users, even if no messages yet
  // If loading and not open, we can wait a bit, but for UX it's better to just show it once session is confirmed.
  if (loading && !isOpen) {
     // Still show the button but with a loading state if we want, 
     // or just wait for session. For now, we have session, so show it.
  }
  
  // No longer hide if !hasMessages. Users need the button to START a message.

  return (
    <div className={`fixed bottom-6 ${isRTL ? "left-6" : "right-6"} z-[60] flex flex-col items-end`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: isRTL ? "bottom left" : "bottom right" }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[calc(100vw-2rem)] sm:w-[400px]"
          >
            <ChatBox 
              conversationId={(session.user as any).id} 
              viewerRole="user" 
              onClose={() => setIsOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full bg-black text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all relative overflow-hidden group`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {!isOpen && hasMessages && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
        )}
      </button>
    </div>
  );
}
