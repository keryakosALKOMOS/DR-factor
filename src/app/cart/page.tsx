"use client";

import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function CartPage() {
  const { t } = useLanguage();
  const { items, removeItem, updateQuantity, cartTotal } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-3xl font-bold mb-4">{t("cart.empty")}</h1>
        <p className="text-neutral-500 mb-8 mx-auto max-w-md">{t("cart.emptyDesc")}</p>
        <Link href="/products" className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-neutral-800 transition-colors">
          {t("cart.startShopping")}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-12 py-8 md:py-12">
      <h1 className="text-3xl font-extrabold tracking-tight mb-8">{t("cart.title")}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-6">
          {items.map((item, idx) => (
            <div key={`${item.product}-${idx}`} className="flex flex-col sm:flex-row items-center justify-between border-b pb-6">
              <div className="flex items-center gap-6 w-full sm:w-auto mb-4 sm:mb-0">
                <div className="w-24 h-32 bg-neutral-100 rounded overflow-hidden shrink-0">
                  <img src={item.image || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=200"} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-sm text-neutral-500 mt-1">{item.price} {t("common.currency")}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center border rounded-md">
                      <button 
                        onClick={() => updateQuantity(item.product, item.quantity - 1, item.size, item.color)}
                        className="p-1 hover:bg-neutral-100 text-neutral-600"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product, item.quantity + 1, item.size, item.color)}
                        className="p-1 hover:bg-neutral-100 text-neutral-600"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between w-full sm:w-auto">
                <p className="font-semibold text-lg sm:mr-8">{(item.price * item.quantity)} {t("common.currency")}</p>
                <button 
                  onClick={() => removeItem(item.product, item.size, item.color)}
                  className="text-neutral-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-4">
          <div className="bg-neutral-50 p-6 rounded-xl border border-neutral-100 sticky top-24">
            <h2 className="text-xl font-bold mb-6">{t("cart.summary")}</h2>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-neutral-600 border-b pb-4">
                <span>{t("cart.subtotal")}</span>
                <span>{cartTotal()} {t("common.currency")}</span>
              </div>
              <div className="flex justify-between text-neutral-600 border-b pb-4">
                <span>{t("cart.shipping")}</span>
                <span>{t("cart.calculated")}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2">
                <span>{t("cart.total")}</span>
                <span>{cartTotal()} {t("common.currency")}</span>
              </div>
            </div>
            <Link 
              href="/checkout"
              className="w-full bg-black text-white py-4 rounded-full font-bold text-center flex items-center justify-center hover:bg-neutral-800 transition-colors"
            >
              {t("cart.checkout")} <ArrowRight className="w-4 h-4 rtl:-scale-x-100 ms-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
