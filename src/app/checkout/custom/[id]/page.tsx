"use client";

import { useState, useEffect, use } from "react";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, CheckCircle2, ChevronRight, PackageCheck, Upload, X } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function CustomCheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("InstaPay");
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const proofRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState<any>(null);

  const isManualPayment = ["InstaPay", "Mobile Wallet", "Bank Transfer"].includes(paymentMethod);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/custom-orders")
        .then(res => res.json())
        .then(data => {
          const found = data.orders?.find((o: any) => o._id === resolvedParams.id);
          if (!found || found.status !== "Confirmed") {
            router.push("/profile");
          } else {
            setOrder(found);
          }
        })
        .finally(() => setLoading(false));

      fetch("/api/admin/settings")
        .then(res => res.json())
        .then(data => {
            if(!data.error) setSettings(data);
        });
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, resolvedParams.id, router]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setProofUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "DSfactor");
    const res = await fetch("/api/cloudinary/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!data.secure_url) throw new Error("Image upload failed");
    return data.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isManualPayment && !proofFile) {
      alert("Please upload a payment screenshot to proceed.");
      return;
    }

    setIsSubmitting(true);

    try {
      let uploadedProof = "";
      if (proofFile) uploadedProof = await uploadToCloudinary(proofFile);

      const res = await fetch(`/api/custom-orders/${order._id}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod, paymentProofUrl: uploadedProof || undefined }),
      });
      
      if (!res.ok) throw new Error("Failed to process payment");
      setOrderComplete(true);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center text-center px-4 bg-neutral-50">
        <PackageCheck className="w-24 h-24 text-green-500 mb-6 bg-green-100 p-4 rounded-3xl" />
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Payment Confirmed!</h1>
        <p className="text-neutral-500 max-w-md mx-auto mb-8 text-lg">Your custom order has been marked for processing. Our manufacturing team will begin work immediately.</p>
        <Link href="/profile" className="bg-black text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:scale-105 transition-all text-lg">
          Back to Orders
        </Link>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen pt-24 pb-12 bg-neutral-50">
      <div className="max-w-4xl mx-auto px-6">
        <Link href="/profile" className="text-sm font-bold text-neutral-500 hover:text-black mb-6 inline-block">← Back to Profile</Link>
        <h1 className="text-3xl font-black mb-8">Confirm Custom Order</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-neutral-100 mb-6">
              <h2 className="text-xl font-bold mb-4 border-b pb-4">Design Overview</h2>
              <p className="text-sm text-neutral-600 leading-relaxed mb-6">{order.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                 {order.uploadedDesignUrl && (
                   <div>
                     <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Inspiration</p>
                     <img src={order.uploadedDesignUrl} alt="Design" className="w-full h-24 object-contain bg-neutral-50 rounded-xl" />
                   </div>
                 )}
                 {order.uploadedLogoUrl && (
                   <div>
                     <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Logo</p>
                     <img src={order.uploadedLogoUrl} alt="Logo" className="w-full h-24 object-contain bg-neutral-50 rounded-xl" />
                   </div>
                 )}
              </div>
            </div>

            {settings?.isActive && isManualPayment && (
                <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
                      <h3 className="font-bold text-indigo-900">{paymentMethod} Details</h3>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-indigo-50 shadow-sm">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Transfer to:</p>
                      <p className="text-xl font-mono font-black text-indigo-900 break-all select-all">
                        {paymentMethod === "InstaPay" && (settings.instaPayNumber || "Not set")}
                        {paymentMethod === "Mobile Wallet" && (settings.mobileWalletNumber || "Not set")}
                        {paymentMethod === "Bank Transfer" && (settings.bankAccountDetails || "Not set")}
                      </p>
                    </div>
                    <p className="text-[11px] text-indigo-600/70 mt-3 font-medium leading-relaxed">
                      Please complete the transfer of <span className="font-bold text-indigo-900">{order.totalPrice} {t("common.currency")}</span> to the details above, then upload your transaction screenshot below.
                    </p>
                </div>
            )}
          </div>

          <div>
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-neutral-100 sticky top-24">
                    <h3 className="text-xl font-bold mb-6">Payment Method</h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-3">
                        {["Cash on Delivery", "InstaPay", "Mobile Wallet", "Bank Transfer", "Credit/Debit Card"].map((method) => (
                          <label key={method} className={`flex items-center space-x-3 border-2 p-4 rounded-2xl cursor-pointer transition-all ${paymentMethod === method ? "border-black bg-neutral-50" : "border-transparent bg-white hover:bg-neutral-50"}`}>
                            <input 
                              type="radio" 
                              name="paymentMethod" 
                              value={method} 
                              checked={paymentMethod === method}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                              className="w-4 h-4 text-black focus:ring-black" 
                            />
                            <span className="font-bold text-sm">{method}</span>
                          </label>
                        ))}
                      </div>

                {/* File Upload Region */}
                {isManualPayment && (
                  <div className="mt-6 border-t pt-6">
                    <label className="block text-sm font-bold mb-3 focus:text-indigo-600">Upload Payment Screenshot <span className="text-red-500">*</span></label>
                    <div
                      onClick={() => proofRef.current?.click()}
                      className={`group bg-white border-2 border-dashed ${proofFile ? "border-indigo-500" : "border-neutral-200"} rounded-2xl p-6 cursor-pointer hover:border-black hover:bg-neutral-50 transition-all flex flex-col items-center text-center min-h-[140px] justify-center`}
                    >
                      {proofUrl ? (
                         <>
                           <div className="relative w-full h-24 mb-2">
                             <img src={proofUrl} alt="Proof" className="w-full h-full object-contain rounded-lg" />
                           </div>
                           <p className="text-[10px] text-neutral-500 truncate max-w-full">{proofFile?.name}</p>
                           <button type="button" onClick={(e) => { e.stopPropagation(); setProofUrl(null); setProofFile(null); }}
                             className="mt-2 text-[10px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1">
                             <X className="w-3 h-3" /> Remove
                           </button>
                         </>
                      ) : (
                         <>
                           <div className="w-10 h-10 bg-neutral-100 group-hover:bg-black group-hover:text-white rounded-xl flex items-center justify-center mb-3 transition-colors">
                             <Upload className="w-4 h-4" />
                           </div>
                           <p className="font-bold text-sm">Tap to upload screenshot</p>
                           <p className="text-[10px] text-neutral-400 mt-1">PNG, JPG</p>
                         </>
                      )}
                      <input ref={proofRef} type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
                    </div>
                  </div>
                )}

                <div className="border-t pt-6 mb-6">
                   <div className="flex justify-between items-center text-lg font-bold text-neutral-500 mb-2">
                     <span>Design Price</span>
                     <span>{order.totalPrice} {t("common.currency")}</span>
                   </div>
                   <div className="flex justify-between items-center text-2xl font-black mt-4">
                     <span>Total</span>
                     <span>{order.totalPrice} {t("common.currency")}</span>
                   </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-black text-white py-4 rounded-2xl font-black flex justify-center items-center hover:bg-neutral-800 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm & Pay"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
