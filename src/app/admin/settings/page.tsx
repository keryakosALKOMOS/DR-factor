"use client";

import { useState, useEffect } from "react";
import { Settings, Save, BellRing, Loader2, CheckCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import NotificationToggle from "@/components/pwa/NotificationToggle";

export default function AdminSettingsPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [settings, setSettings] = useState({
    instaPayNumber: "",
    mobileWalletNumber: "",
    bankAccountDetails: "",
    isActive: true,
    adminWhatsAppNumber: "",
    whatsAppNotificationsEnabled: false,
  });

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setSettings({
            instaPayNumber: data.instaPayNumber || "",
            mobileWalletNumber: data.mobileWalletNumber || "",
            bankAccountDetails: data.bankAccountDetails || "",
            isActive: data.isActive !== false,
            adminWhatsAppNumber: data.adminWhatsAppNumber || "",
            whatsAppNotificationsEnabled: !!data.whatsAppNotificationsEnabled,
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-16 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-neutral-400" /></div>;
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight mb-8">{t("admin.platformSettings")}</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8 mb-8">
        <h2 className="text-xl font-bold mb-6 flex items-center border-b pb-4">
          <BellRing className="w-5 h-5 mr-3 text-neutral-500" />
          {t("admin.notifications") || "Push Notifications"}
        </h2>
        <div className="mb-6">
          <p className="text-sm text-neutral-600 mb-4">
            Enable push notifications to receive real-time updates for new orders and chat messages directly on this device.
          </p>
          <NotificationToggle />
        </div>
        <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
          <p className="text-xs text-neutral-400 font-medium italic">
            Make sure to "Enable Push Notifications" above first.
          </p>
          <button
            onClick={async () => {
              try {
                const res = await fetch("/api/admin/test-notification", { method: "POST" });
                const data = await res.json();
                if (data.success) {
                  alert("Test notification sent! Check your device.");
                } else {
                  alert("Error: " + data.message);
                }
              } catch (e) {
                alert("Failed to reach server.");
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl text-sm font-bold transition-all text-neutral-700"
          >
            <BellRing className="w-4 h-4" />
            Send Test Push
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8 mb-8">
        <h2 className="text-xl font-bold mb-6 flex items-center border-b pb-4">
          <svg className="w-5 h-5 mr-3 text-green-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          {t("admin.whatsAppNotifications") || "WhatsApp Notifications"}
        </h2>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">{t("admin.whatsAppNumber") || "Admin WhatsApp Number"}</label>
              <input 
                type="text" 
                name="adminWhatsAppNumber" 
                value={settings.adminWhatsAppNumber} 
                onChange={handleChange} 
                className="w-full border rounded-lg px-4 py-2 bg-neutral-50" 
                placeholder="+2010xxxxxxx" 
              />
              <p className="text-xs text-neutral-400 mt-1">Include country code (e.g., +2010...)</p>
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                 <input 
                  type="checkbox" 
                  name="whatsAppNotificationsEnabled" 
                  checked={settings.whatsAppNotificationsEnabled} 
                  onChange={handleChange} 
                  className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-600" 
                />
                 <span className="text-sm font-bold">{t("admin.enableWhatsApp") || "Enable WhatsApp Notifications"}</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
            <p className="text-xs text-neutral-400 font-medium italic">
              Click save to apply changes before testing.
            </p>
            <button
              onClick={async () => {
                if (!settings.adminWhatsAppNumber) return alert("Please enter a WhatsApp number first.");
                try {
                  const res = await fetch("/api/admin/test-whatsapp", { 
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ number: settings.adminWhatsAppNumber })
                  });
                  const data = await res.json();
                  if (data.success) {
                    alert("Test WhatsApp message sent!");
                  } else {
                    alert("Error: " + data.message);
                  }
                } catch (e) {
                  alert("Failed to reach server.");
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 rounded-xl text-sm font-bold transition-all text-green-700 border border-green-200"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Send Test WhatsApp
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8 mb-8">
        <h2 className="text-xl font-bold mb-6 flex items-center border-b pb-4">
          <Settings className="w-5 h-5 mr-3 text-neutral-500" />
          {t("admin.paymentGateway")}
        </h2>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">{t("admin.instaPay")}</label>
              <input type="text" name="instaPayNumber" value={settings.instaPayNumber} onChange={handleChange} className="w-full border rounded-lg px-4 py-2 bg-neutral-50" placeholder="010xxxxxxx" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t("admin.walletNumber")}</label>
              <input type="text" name="mobileWalletNumber" value={settings.mobileWalletNumber} onChange={handleChange} className="w-full border rounded-lg px-4 py-2 bg-neutral-50" placeholder="011xxxxxxx" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t("admin.bankAccount")}</label>
            <textarea name="bankAccountDetails" value={settings.bankAccountDetails} onChange={handleChange} className="w-full border rounded-lg px-4 py-2 bg-neutral-50 h-24 resize-none" placeholder="EG000000000000000000000000" />
          </div>
          <div>
            <label className="flex items-center space-x-3">
               <input type="checkbox" name="isActive" checked={settings.isActive} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
               <span className="text-sm font-medium">{t("admin.acceptManual")}</span>
            </label>
          </div>

          <div className="flex items-center gap-4">
            <button disabled={saving} className="bg-black text-white px-6 py-3 rounded-xl font-medium flex items-center hover:bg-neutral-800 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} 
              {t("admin.saveSettings")}
            </button>
            {success && <span className="text-green-600 flex items-center text-sm font-medium"><CheckCircle className="w-4 h-4 mr-1" /> Saved Support Details</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
