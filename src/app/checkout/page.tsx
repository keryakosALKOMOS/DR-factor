"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function CheckoutPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { items, cartTotal, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    notes: "",
    paymentMethod: "InstaPay",
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const standardItems = items.filter(item => !item.product.startsWith("custom-"));
      const customItems = items.filter(item => item.product.startsWith("custom-"));

      const shippingAddress = {
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country,
      };

      // 1. Process Standard Order
      if (standardItems.length > 0) {
        const standardTotal = standardItems.reduce((acc, item) => acc + item.price * item.quantity, 0) + 50;
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderItems: standardItems,
            shippingAddress,
            paymentMethod: formData.paymentMethod,
            totalPrice: standardTotal,
            notes: formData.notes,
          }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Failed to place standard order");
        }
      }

      // 2. Process Custom Orders
      for (const item of customItems) {
        if (!item.customDesign) continue;
        const res = await fetch("/api/orders/custom", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...item.customDesign,
            quantity: item.quantity,
            notes: formData.notes,
            shippingAddress,
            totalPrice: item.price * item.quantity,
            status: "Pending"
          }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Failed to place custom order");
        }
      }

      setOrderComplete(true);
      clearCart();
    } catch (error: any) {
      alert(error.message || "An error occurred during checkout");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !orderComplete) {
    router.push("/cart");
    return null;
  }

  if (orderComplete) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <CheckCircle2 className="w-20 h-20 text-green-500 mb-6" />
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">{t("checkout.success")}</h1>
        <p className="text-neutral-500 max-w-md mx-auto mb-8">{t("checkout.successDesc")}</p>
        <Link href="/" className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-neutral-800 transition-colors">
          {t("checkout.continue")}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 border-t pt-8">
        {/* Left Col: Form */}
        <div className="lg:col-span-7">
          <h2 className="text-2xl font-bold tracking-tight mb-8">{t("checkout.details")}</h2>
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">{t("custom.fullName")}</label>
                <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full border rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t("custom.phone")}</label>
                <input required type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full border rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-black" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t("custom.address")}</label>
              <input required type="text" name="address" value={formData.address} onChange={handleChange} className="w-full border rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-black" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div>
                <label className="block text-sm font-medium mb-1">{t("custom.city")}</label>
                <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full border rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t("custom.postalCode")}</label>
                <input required type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} className="w-full border rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t("custom.country")}</label>
                <input required type="text" name="country" value={formData.country} onChange={handleChange} className="w-full border rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-black" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t("checkout.notes")}</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} className="w-full border rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-black h-24 resize-none" />
            </div>

            <div className="pt-6 border-t">
              <h3 className="text-lg font-bold mb-4">{t("checkout.payment")}</h3>
              <div className="space-y-3">
                {["InstaPay", "Mobile Wallet", "Bank Transfer", "Credit/Debit Card"].map((method) => (
                  <label key={method} className="flex items-center space-x-3 border p-4 rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value={method} 
                      checked={formData.paymentMethod === method}
                      onChange={handleChange}
                      className="w-4 h-4 text-black focus:ring-black" 
                    />
                    <span className="font-medium text-sm">{method === "InstaPay" ? "InstaPay" : method === "Mobile Wallet" ? "Mobile Wallet" : method === "Bank Transfer" ? "Bank Transfer" : "Credit/Debit Card"}</span>
                  </label>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Right Col: Summary */}
        <div className="lg:col-span-5">
          <div className="bg-neutral-50 p-8 rounded-xl sticky top-24 border">
            <h3 className="text-xl font-bold mb-6">{t("checkout.inCart")}</h3>
            <div className="space-y-4 mb-8">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-sm">
                  <div className="flex gap-4 max-w-[70%]">
                    <img src={item.image} alt="" className="w-12 h-16 object-cover rounded" />
                    <div>
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-neutral-500">{t("checkout.qty")}: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-medium">{(item.price * item.quantity).toFixed(2)} {t("common.currency")}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 text-sm border-t pt-4 mb-6">
              <div className="flex justify-between">
                <span className="text-neutral-600">{t("cart.subtotal")}</span>
                <span>{cartTotal().toFixed(2)} {t("common.currency")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">{t("cart.shipping")}</span>
                <span>50.00 {t("common.currency")}</span>
              </div>
            </div>

            <div className="flex justify-between text-xl font-extrabold border-t pt-4 mb-8">
              <span>{t("cart.total")}</span>
              <span>{(cartTotal() + 50).toFixed(2)} {t("common.currency")}</span>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="w-full bg-black text-white py-4 rounded-full font-bold flex justify-center items-center hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : t("checkout.placeOrder")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
