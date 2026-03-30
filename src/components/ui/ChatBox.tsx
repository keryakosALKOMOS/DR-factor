"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Loader2, MessageCircle, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface ChatMessage {
  _id: string;
  text: string;
  role: "user" | "admin";
  sender?: { name: string };
  createdAt: string;
}

interface ChatBoxProps {
  conversationId: string; // This is the userId
  viewerRole: "user" | "admin";
  title?: string;
  onClose?: () => void;
}

export default function ChatBox({ conversationId, viewerRole, title, onClose }: ChatBoxProps) {
  const { t, lang } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Determine API endpoint based on viewer role
  const apiEndpoint = viewerRole === "admin" 
    ? `/api/admin/chat/${conversationId}` 
    : `/api/chat/conversation`;

  const fetchMessages = async () => {
    try {
      const res = await fetch(apiEndpoint);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (e) {
      console.error("Failed to fetch messages", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [conversationId, apiEndpoint]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    console.log("ChatBox: sending to", apiEndpoint);
    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        setText("");
        setError("");
        await fetchMessages();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to send");
      }
    } catch (err: any) {
      setError("Network error");
    } finally {
      setSending(false);
    }
  };

  const isRTL = lang === "ar";

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden min-h-[450px]">
      {/* Header */}
      <div className="bg-black text-white px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-xl">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm">
              {title || (viewerRole === "admin" ? t("chat.adminTitle") : t("chat.userTitle"))}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
              <span className="text-[10px] text-neutral-400">{t("chat.live")}</span>
            </div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50/50" dir={isRTL ? "rtl" : "ltr"}>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-neutral-300" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
            <MessageCircle className="w-12 h-12 mb-3 opacity-10" />
            <p className="text-sm font-medium">{t("chat.empty")}</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.role === viewerRole;
            return (
              <div key={msg._id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    isOwn
                      ? "bg-black text-white rounded-br-sm"
                      : "bg-white text-neutral-800 border border-neutral-100 rounded-bl-sm"
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-neutral-400 mt-1 px-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="px-4 py-1 bg-red-50 text-red-500 text-[10px] border-t border-red-100 italic">
          {error}
        </div>
      )}

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 bg-white border-t" dir={isRTL ? "rtl" : "ltr"}>
        <div className="relative flex items-center">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("chat.placeholder")}
            className="w-full bg-neutral-100 rounded-xl pl-4 pr-12 py-3 text-sm outline-none focus:ring-2 focus:ring-black transition-all"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className={`absolute ${isRTL ? "left-2" : "right-2"} p-2 bg-black text-white rounded-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-30`}
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </form>
    </div>
  );
}
