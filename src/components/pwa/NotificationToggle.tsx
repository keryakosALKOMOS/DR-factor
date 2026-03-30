"use client";

import { useState, useEffect } from "react";
import { requestForToken, onMessageListener } from "@/lib/firebase";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Bell, BellOff, Loader2 } from "lucide-react";

export default function NotificationToggle() {
  const [tokenFound, setTokenFound] = useState<boolean | null>(false);
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<NotificationPermission | null>(null);
  const { lang } = useLanguage();
  const isRTL = lang === 'ar';

  useEffect(() => {
    if ("Notification" in window) {
      setHasPermission(Notification.permission);
    }
  }, []);

  const handleEnableNotifications = async () => {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setHasPermission(permission);

      if (permission === 'granted') {
        const token = await requestForToken();
        if (token) {
          setTokenFound(true);
          
          // Save the token to user profile
          const res = await fetch('/api/user/fcm-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
          });
          
          if (!res.ok && res.status !== 401) {
            console.error("Failed to register FCM token with server.");
          }
        }
      }
    } catch (err) {
      console.error("Error setting up notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Optional: Start listening for messages in foreground
    (async () => {
      if (typeof window !== "undefined") {
        try {
          const payload = await onMessageListener();
          if (payload) {
            console.log("Foreground message received:", payload);
          }
        } catch (e) {
            // Service worker or messaging not ready
        }
      }
    })();
  }, []);

  if (hasPermission === 'granted') {
    return (
      <div className="flex items-center text-green-600 bg-green-50 px-4 py-3 rounded-2xl shadow-sm w-full max-w-sm border border-green-200">
        <Bell className={`w-5 h-5 ${isRTL ? "ml-3" : "mr-3"}`} />
        <div>
          <span className="block font-black text-sm uppercase tracking-widest leading-none mb-1">
            {isRTL ? "الإشعارات مفعلة" : "Push Enabled"}
          </span>
          <span className="block text-xs font-medium text-green-700/80">
            {isRTL ? "ستتلقى تنبيهات بالطلبات والمحادثات." : "You will receive real-time updates."}
          </span>
        </div>
      </div>
    );
  }

  if (hasPermission === 'denied') {
    return (
      <div className="flex items-center text-red-600 bg-red-50 px-4 py-3 rounded-2xl shadow-sm w-full max-w-sm border border-red-200">
        <BellOff className={`w-5 h-5 ${isRTL ? "ml-3" : "mr-3"}`} />
        <div>
          <span className="block font-black text-sm uppercase tracking-widest leading-none mb-1">
            {isRTL ? "الإشعارات محظورة" : "Push Blocked"}
          </span>
          <span className="block text-xs font-medium text-red-700/80">
            {isRTL ? "قم بتعديل إعدادات المتصفح للتفعيل." : "Allow notifications in browser settings."}
          </span>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleEnableNotifications}
      disabled={loading}
      className="flex items-center bg-black hover:bg-neutral-800 text-white px-6 py-4 rounded-full shadow-2xl active:scale-95 transition-all text-sm font-bold w-full max-w-xs justify-center"
    >
      {loading ? (
        <Loader2 className={`w-5 h-5 animate-spin ${isRTL ? "ml-2" : "mr-2"}`} />
      ) : (
        <Bell className={`w-5 h-5 ${isRTL ? "ml-2" : "mr-2"}`} />
      )}
      {isRTL ? "تفعيل الإشعارات الآن" : "Enable Push Notifications"}
    </button>
  );
}
