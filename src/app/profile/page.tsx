"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Loader2, Package, Shirt, ExternalLink, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<"standard" | "custom">("standard");
  const [orders, setOrders] = useState<any[]>([]);
  const [customOrders, setCustomOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      Promise.all([
        fetch("/api/orders").then((res) => res.json()),
        fetch("/api/custom-orders").then((res) => res.json()),
      ])
        .then(([standardData, customData]) => {
          if (Array.isArray(standardData)) setOrders(standardData);
          if (customData.orders && Array.isArray(customData.orders)) setCustomOrders(customData.orders);
        })
        .finally(() => setLoading(false));
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center pt-24 px-4 text-center">
        <h1 className="text-3xl font-black tracking-tight mb-4">Access Denied</h1>
        <p className="text-neutral-500 mb-8 max-w-md mx-auto">Please sign in to view your orders and manage your profile.</p>
        <Link href="/login" className="bg-black text-white px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-all">
          {t("nav.signIn")}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-6">
        <div className="bg-white rounded-[2rem] shadow-sm border border-neutral-100 p-8 mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black mb-2">Welcome, {(session?.user as any)?.name}</h1>
            <p className="text-neutral-500 font-medium">{(session?.user as any)?.email}</p>
          </div>
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center text-xl font-bold">
            {(session?.user as any)?.name?.charAt(0).toUpperCase()}
          </div>
        </div>

        <h2 className="text-2xl font-black mb-6">My Orders</h2>

        <div className="flex gap-2 mb-6 p-1 bg-neutral-200/50 rounded-xl inline-flex">
          <button
            onClick={() => setActiveTab("standard")}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === "standard" ? "bg-white text-black shadow-sm" : "text-neutral-500 hover:text-black"}`}
          >
            Standard Orders
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === "custom" ? "bg-white text-black shadow-sm" : "text-neutral-500 hover:text-black"}`}
          >
            Custom Designs
          </button>
        </div>

        {activeTab === "standard" && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-neutral-100 p-12 text-center text-neutral-400">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="font-medium text-lg text-neutral-500">No standard orders found.</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order._id} className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b pb-4">
                    <div>
                      <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mb-1">Order ID: {order._id.slice(-8).toUpperCase()}</p>
                      <p className="text-sm font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="text-xs text-neutral-500 font-mono">
                        {t("checkout.items") || "Items"}: {order.itemsPrice ? order.itemsPrice : order.totalPrice} {t("common.currency")}
                      </div>
                      <div className="text-xs text-neutral-500 font-mono">
                        {t("checkout.shippingFee") || "Shipping"}: {order.shippingPrice > 0 ? `${order.shippingPrice} ${t("common.currency")}` : t("checkout.shippingTBD") || "TBD"}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="font-mono text-lg font-black">{order.totalPrice} {t("common.currency")}</span>
                        <span className="bg-neutral-100 px-3 py-1 rounded-full text-xs font-bold font-mono text-neutral-700">{order.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {order.orderItems?.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 bg-neutral-50 pr-4 rounded-xl border">
                        <img src={item.image} alt="" className="w-12 h-12 rounded-l-xl object-cover" />
                        <div>
                          <p className="text-xs font-bold max-w-[120px] truncate">{item.name}</p>
                          <p className="text-[10px] text-neutral-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "custom" && (
          <div className="space-y-4">
            {customOrders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-neutral-100 p-12 text-center text-neutral-400">
                <Shirt className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="font-medium text-lg text-neutral-500">No custom designs found.</p>
                <Link href="/custom-design" className="mt-4 inline-block text-indigo-600 font-bold hover:underline">Start a new design request →</Link>
              </div>
            ) : (
              customOrders.map((order) => (
                <div key={order._id} className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                  
                  {order.status === "Confirmed" && (
                    <div className="absolute top-0 right-0 bg-yellow-400 text-black text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl shadow-sm z-10">
                      Action Required
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Design ID: {order._id.slice(-8).toUpperCase()}</p>
                        <span className="bg-neutral-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{order.status}</span>
                      </div>
                      <p className="text-sm text-neutral-600 line-clamp-2 max-w-xl leading-relaxed mb-4">{order.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs font-bold text-neutral-500">
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        {order.totalPrice > 0 && <span className="text-black bg-neutral-100 px-2 py-1 rounded">Price set: {order.totalPrice} {t("common.currency")}</span>}
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end justify-between gap-4 sm:w-48 shrink-0 border-t sm:border-t-0 pt-4 sm:pt-0">
                      
                      {order.status === "Confirmed" ? (
                        <div className="w-full">
                          <p className="text-xs text-center text-neutral-500 mb-2 font-medium">Price is ready for approval</p>
                          <Link 
                            href={`/checkout/custom/${order._id}`}
                            className="w-full block text-center bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold shadow-md hover:bg-indigo-700 transition-colors"
                          >
                            Pay Now
                          </Link>
                        </div>
                      ) : (
                        <span className="text-xl font-black">{order.totalPrice > 0 ? `${order.totalPrice} ${t("common.currency")}` : "TBD"}</span>
                      )}

                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
