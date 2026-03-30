"use client";

import { useState, useEffect } from "react";
import { Loader2, MessageCircle, User as UserIcon, Search } from "lucide-react";
import ChatBox from "@/components/ui/ChatBox";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface ChatUser {
  _id: string;
  name: string;
  email: string;
  lastMessage?: { text: string; role: string; createdAt: string };
  unreadCount: number;
}

export default function AdminChatsPage() {
  const { t, lang } = useLanguage();
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const isRTL = lang === "ar";

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/chats");
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const selectedUser = users.find(u => u._id === selectedUserId);

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-black tracking-tight">
          {t("chat.adminPageTitle")}
        </h1>
        {selectedUserId && (
          <button 
            onClick={() => setSelectedUserId(null)}
            className="lg:hidden flex items-center gap-2 text-sm font-bold bg-neutral-100 px-4 py-2 rounded-xl hover:bg-neutral-200 transition-colors w-fit"
          >
            {isRTL ? "← العودة للقائمة" : "← Back to List"}
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-3 gap-8 min-h-0">
        {/* Sidebar: List of users - Hidden on mobile if a chat is selected */}
        <div className={`lg:col-span-1 bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden flex flex-col ${selectedUserId ? "hidden lg:flex" : "flex"}`}>
          <div className="p-4 md:p-6 border-b bg-neutral-50/50 space-y-4">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-black uppercase tracking-widest text-neutral-400">
                {users.length} {t("chat.conversations")}
              </p>
            </div>
            <div className="relative">
              <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400`} />
              <input 
                type="text" 
                placeholder={t("chat.searchUsers") || "Search users..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full bg-white border border-neutral-100 rounded-2xl ${isRTL ? "pr-10 pl-4" : "pl-10 pr-4"} py-3 text-sm outline-none focus:ring-2 focus:ring-black transition-all shadow-sm`}
              />
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1 divide-y divide-neutral-50">
            {loading && users.length === 0 ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-neutral-200" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-neutral-400 px-6 text-center">
                <MessageCircle className="w-12 h-12 mb-4 opacity-5" />
                <p className="text-sm font-bold opacity-40">{t("chat.noUsersFound") || "No users found"}</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <button
                  key={user._id}
                  onClick={() => setSelectedUserId(user._id)}
                  className={`w-full text-start p-4 md:p-5 transition-all hover:bg-neutral-50 active:scale-[0.98] ${
                    selectedUserId === user._id ? "bg-black/5" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-12 h-12 rounded-2xl ${selectedUserId === user._id ? "bg-black text-white" : "bg-neutral-100 text-neutral-300"} flex items-center justify-center shrink-0 transition-all shadow-sm`}>
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-sm truncate text-neutral-900">{user.name}</p>
                        <p className="text-[10px] sm:text-xs text-neutral-400 truncate font-medium">{user.email}</p>
                      </div>
                    </div>
                    {user.unreadCount > 0 && (
                      <span className="shrink-0 bg-indigo-600 text-white text-[10px] font-black min-w-[20px] h-[20px] flex items-center justify-center rounded-full shadow-lg shadow-indigo-200">
                        {user.unreadCount}
                      </span>
                    )}
                  </div>
                  {user.lastMessage && (
                    <p className={`text-xs mt-3 line-clamp-1 ps-[60px] ${user.unreadCount > 0 ? "font-black text-neutral-900" : "text-neutral-500 font-medium"}`}>
                      {user.lastMessage.role === "admin" ? (isRTL ? "أنت: " : "You: ") : ""}{user.lastMessage.text}
                    </p>
                  )}
                  {user.lastMessage && (
                    <p className="text-[10px] text-neutral-300 mt-1 ps-[60px] font-medium">
                      {new Date(user.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat window - Visible on mobile only if selectedUserId is set */}
        <div className={`lg:col-span-2 flex flex-col min-h-[500px] lg:min-h-0 ${!selectedUserId ? "hidden lg:flex" : "flex"}`}>
          {selectedUserId ? (
            <div className="flex-1 bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden flex flex-col relative">
              <div className="lg:hidden p-4 border-b bg-neutral-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
                     <UserIcon className="w-4 h-4" />
                   </div>
                   <span className="font-bold text-sm">{selectedUser?.name}</span>
                </div>
              </div>
              <div className="flex-1">
                <ChatBox
                  conversationId={selectedUserId}
                  viewerRole="admin"
                  title={selectedUser?.name}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-3xl border border-neutral-100 shadow-sm text-neutral-400 border-dashed border-2">
              <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-6">
                <MessageCircle className="w-10 h-10 opacity-20" />
              </div>
              <p className="font-black text-neutral-900 mb-2">{t("chat.selectConversation")}</p>
              <p className="max-w-[280px] text-center text-sm font-medium leading-relaxed p-4 opacity-60">
                {t("chat.adminHelp") || "Select any user from the list to view their conversation history and start chatting."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
