"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Upload, X, Loader2, Send, MessageCircle, CheckCircle, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import ChatBox from "@/components/ui/ChatBox";

export default function CustomDesignPage() {
  const { t, lang } = useLanguage();
  const { data: session } = useSession();
  const isRTL = lang === "ar";

  // Form state
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [designUrl, setDesignUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [designFile, setDesignFile] = useState<File | null>(null);
  const [quantity, setQuantity] = useState(1);
  
  // Shipping modal state
  const [showShipping, setShowShipping] = useState(false);
  const [shipping, setShipping] = useState({ fullName: "", address: "", city: "", postalCode: "", country: "", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  
  // Post-submit chat state
  const [submittedOrderId, setSubmittedOrderId] = useState<string | null>(null);

  const logoRef = useRef<HTMLInputElement>(null);
  const designRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    setUrl: (u: string | null) => void,
    setFile: (f: File | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "DSfactor");
    const res = await fetch("/api/cloudinary/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!data.secure_url) throw new Error("Upload failed");
    return data.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    setIsSubmitting(true);
    setSubmitError("");

    try {
      let uploadedLogo = "";
      let uploadedDesign = "";
      
      if (logoFile) uploadedLogo = await uploadToCloudinary(logoFile);
      if (designFile) uploadedDesign = await uploadToCloudinary(designFile);

      const res = await fetch("/api/custom-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          uploadedLogoUrl: uploadedLogo || undefined,
          uploadedDesignUrl: uploadedDesign || undefined,
          quantity,
          shippingAddress: shipping,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setSubmittedOrderId(data.order._id);
      setShowShipping(false);
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedOrderId) {
    return (
      <div className="min-h-screen bg-neutral-50" dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Success Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8 mb-6 flex items-center gap-5"
          >
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center shrink-0">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">{t("custom.successTitle")}</h1>
              <p className="text-neutral-500 mt-1">{t("chat.chatIntro") || t("custom.chatIntro") || "Your request has been sent! Chat with our team below."}</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <ChatBox conversationId={(session?.user as any).id} viewerRole="user" title={`Order #${submittedOrderId.slice(-8).toUpperCase()}`} />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4 leading-tight">{t("custom.uploadTitle") || t("custom.title")}</h1>
          <p className="text-neutral-500 text-sm md:text-lg max-w-xl mx-auto leading-relaxed">
            {t("custom.uploadSubtitle") || t("custom.subtitle")}
          </p>
        </motion.div>

        <form onSubmit={(e) => { e.preventDefault(); setShowShipping(true); }} className="space-y-4 md:space-y-6">

          {/* Description */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-5 md:p-6">
            <label className="block text-base md:text-lg font-bold mb-3">
              {t("custom.descriptionLabel")}
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("custom.descriptionPlaceholder")}
              className="w-full border border-neutral-200 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black resize-none leading-relaxed"
            />
          </motion.div>

          {/* File Uploads */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Design Upload */}
            <div
              onClick={() => designRef.current?.click()}
              className="group bg-white border-2 border-dashed border-neutral-200 rounded-3xl p-6 cursor-pointer hover:border-black hover:bg-neutral-50 transition-all flex flex-col items-center text-center min-h-[160px] justify-center"
            >
              {designUrl ? (
                <>
                  <div className="relative w-full h-32 mb-2">
                    <img src={designUrl} alt="Design" className="w-full h-full object-contain rounded-lg" />
                  </div>
                  <p className="text-[10px] text-neutral-500 truncate max-w-full">{designFile?.name}</p>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setDesignUrl(null); setDesignFile(null); }}
                    className="mt-2 text-[10px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1">
                    <X className="w-3 h-3" /> Remove
                  </button>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 bg-neutral-100 group-hover:bg-black group-hover:text-white rounded-xl flex items-center justify-center mb-3 transition-colors">
                    <Upload className="w-4 h-4" />
                  </div>
                  <p className="font-bold text-sm">{t("custom.uploadDesignLabel")}</p>
                  <p className="text-[10px] text-neutral-400 mt-1">PNG, JPG, WebP</p>
                </>
              )}
              <input ref={designRef} type="file" className="hidden" accept="image/*"
                onChange={(e) => handleFileSelect(e, setDesignUrl, setDesignFile)} />
            </div>

            {/* Logo Upload */}
            <div
              onClick={() => logoRef.current?.click()}
              className="group bg-white border-2 border-dashed border-neutral-200 rounded-3xl p-6 cursor-pointer hover:border-black hover:bg-neutral-50 transition-all flex flex-col items-center text-center min-h-[160px] justify-center"
            >
              {logoUrl ? (
                <>
                  <div className="relative w-full h-32 mb-2">
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-contain rounded-lg" />
                  </div>
                  <p className="text-[10px] text-neutral-500 truncate max-w-full">{logoFile?.name}</p>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setLogoUrl(null); setLogoFile(null); }}
                    className="mt-2 text-[10px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1">
                    <X className="w-3 h-3" /> Remove
                  </button>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 bg-neutral-100 group-hover:bg-black group-hover:text-white rounded-xl flex items-center justify-center mb-3 transition-colors">
                    <Upload className="w-4 h-4" />
                  </div>
                  <p className="font-bold text-sm">{t("custom.uploadLogoLabel")}</p>
                  <p className="text-[10px] text-neutral-400 mt-1">{t("custom.step3")?.replace("3. ", "")}</p>
                </>
              )}
              <input ref={logoRef} type="file" className="hidden" accept="image/*"
                onChange={(e) => handleFileSelect(e, setLogoUrl, setLogoFile)} />
            </div>
          </motion.div>

          {/* Quantity */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-6 flex items-center justify-between">
            <label className="font-bold text-sm md:text-base">{t("custom.quantityLabel") || "Quantity"}</label>
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-full bg-neutral-50 border text-xl font-bold hover:bg-black hover:text-white flex items-center justify-center transition-all shadow-sm">−</button>
              <span className="text-xl font-black w-8 text-center">{quantity}</span>
              <button type="button" onClick={() => setQuantity(q => q + 1)}
                className="w-10 h-10 rounded-full bg-neutral-50 border text-xl font-bold hover:bg-black hover:text-white flex items-center justify-center transition-all shadow-sm">+</button>
            </div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            type="submit"
            disabled={!description.trim() || !session}
            className="w-full bg-black text-white py-4 md:py-5 rounded-3xl font-black text-base md:text-lg hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"
          >
            <Send className="w-5 h-5" />
            {!session ? "Sign in to Submit" : (t("custom.submitBtn") || t("custom.submitRequest"))}
          </motion.button>

          {!session && (
            <p className="text-center text-xs text-neutral-400 font-medium">
              You need to be signed in to submit a custom order.
            </p>
          )}
        </form>
      </div>

      {/* Shipping Modal */}
      <AnimatePresence>
        {showShipping && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white rounded-t-[2.5rem] sm:rounded-[2rem] shadow-2xl p-6 sm:p-8 w-full max-w-lg relative max-h-[92vh] overflow-y-auto"
            >
              <button onClick={() => setShowShipping(false)} className={`absolute top-6 ${isRTL ? "left-6" : "right-6"} text-neutral-400 hover:text-black p-2 bg-neutral-50 rounded-full`}>
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-black mb-1">{t("custom.modalTitle")}</h2>
              <p className="text-sm text-neutral-500 mb-6 font-medium">{t("custom.modalDesc")}</p>

              {submitError && <p className="bg-red-50 text-red-600 text-xs p-3 rounded-xl mb-4 font-bold border border-red-100">{submitError}</p>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: "fullName", label: t("custom.fullName"), col2: false },
                    { key: "phone", label: t("custom.phone"), col2: false },
                    { key: "address", label: t("custom.address"), col2: true },
                    { key: "city", label: t("custom.city"), col2: false },
                    { key: "postalCode", label: t("custom.postalCode"), col2: false },
                    { key: "country", label: t("custom.country"), col2: false },
                  ].map(({ key, label, col2 }) => (
                    <div key={key} className={col2 ? "sm:col-span-2" : ""}>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-neutral-400 mb-1.5 ml-1">{label}</label>
                      <input
                        type="text" required
                        value={(shipping as any)[key]}
                        onChange={e => setShipping(prev => ({ ...prev, [key]: e.target.value }))}
                        className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-black transition-all"
                      />
                    </div>
                  ))}
                </div>
                <button type="submit" disabled={isSubmitting}
                  className="w-full bg-black text-white py-4 rounded-2xl font-black hover:bg-neutral-800 flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 mt-6">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {isSubmitting ? t("checkout.processing") : t("custom.submitBtn")}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
