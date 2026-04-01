"use client";

import { useState, useEffect } from "react";
import { CreditCard, Package, Loader2, ImageIcon } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Order {
  _id: string;
  createdAt: string;
  totalPrice: number;
  paymentMethod: string;
  status: string;
  paymentProof?: string;
  itemsPrice: number;
  shippingPrice: number;
  user?: { name: string; email: string };
}

export default function AdminOrdersPage() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("All");

  const tabs = [
    { key: "All", label: t("admin.tabAll") },
    { key: "Pending", label: t("admin.tabPending") },
    { key: "Processing", label: t("admin.tabProcessing") },
    { key: "Shipped", label: t("admin.tabShipped") },
    { key: "Delivered", label: t("admin.tabDelivered") },
    { key: "Cancelled", label: t("admin.tabCancelled") },
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders?t=" + new Date().getTime());
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (e) {
      console.error("Failed to fetch orders", e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        if (newStatus === "Cancelled") {
          setOrders(prev => prev.filter(o => o._id !== orderId));
        } else {
          setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
        }
      }
    } catch (e) {
      console.error("Failed to update status", e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleShippingUpdate = async (orderId: string, newShipping: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shippingPrice: Number(newShipping) || 0 }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, ...data.order } : o));
      }
    } catch (e) {
      console.error("Failed to update shipping", e);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = activeTab === "All" ? orders : orders.filter(o => o.status === activeTab);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-8">{t("admin.manageOrders")}</h1>
      
      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 mb-6 pb-2 border-b border-neutral-200">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === tab.key 
                ? "bg-neutral-100 text-black border-b-2 border-black" 
                : "text-neutral-500 hover:text-black hover:bg-neutral-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-neutral-400" /></div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-neutral-50">
              <tr className="border-b text-neutral-500">
                <th className="p-4 font-medium">{t("admin.orderId")}</th>
                <th className="p-4 font-medium">{t("admin.date")}</th>
                <th className="p-4 font-medium">{t("admin.customer")}</th>
                <th className="p-4 font-medium">{t("admin.shippingFee") || "Shipping"}</th>
                <th className="p-4 font-medium">{t("admin.total")}</th>
                <th className="p-4 font-medium">{t("admin.payment")}</th>
                <th className="p-4 font-medium">{t("admin.status")}</th>
                <th className="p-4 font-medium text-right">{t("admin.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id} className="border-b last:border-0 hover:bg-neutral-50 transition-colors">
                  <td className="p-4 font-mono text-xs">{order._id.slice(-8).toUpperCase()}</td>
                  <td className="p-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <p className="font-medium text-neutral-900">{order.user?.name || t("admin.unknown")}</p>
                    <p className="text-xs text-neutral-500">{order.user?.email || ""}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                       <input 
                         type="number"
                         min="0"
                         defaultValue={order.shippingPrice || 0}
                         onBlur={(e) => {
                           if (Number(e.target.value) !== (order.shippingPrice || 0)) {
                             handleShippingUpdate(order._id, e.target.value);
                           }
                         }}
                         className="w-16 border rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-black"
                       />
                       <span className="text-xs text-neutral-500">{t("common.currency")}</span>
                    </div>
                  </td>
                  <td className="p-4 font-medium">{order.totalPrice.toFixed(2)} {t("common.currency")}</td>
                  <td className="p-4">
                     <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1 font-medium"><CreditCard className="w-3 h-3 text-neutral-400"/> {order.paymentMethod}</span>
                        {order.paymentProof ? (
                          <a 
                            href={order.paymentProof} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100 hover:bg-green-100 transition-colors w-fit font-bold flex items-center gap-1"
                          >
                            <ImageIcon className="w-2 h-2" /> {t("admin.viewProof") || "View Proof"}
                          </a>
                        ) : order.paymentMethod !== "Credit/Debit Card" && (
                          <span className="text-[10px] text-neutral-400 italic">No proof uploaded</span>
                        )}
                     </div>
                  </td>
                  <td className="p-4">
                     {updatingId === order._id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                     ) : (
                       <select 
                         value={order.status}
                         onChange={(e) => handleStatusChange(order._id, e.target.value)}
                         className="bg-transparent border rounded p-1 text-xs outline-none focus:ring-1 focus:ring-black cursor-pointer"
                       >
                          <option value="Pending">{t("admin.tabPending")}</option>
                          <option value="Processing">{t("admin.tabProcessing")}</option>
                          <option value="Shipped">{t("admin.tabShipped")}</option>
                          <option value="Delivered">{t("admin.tabDelivered")}</option>
                          <option value="Cancelled">{t("admin.tabCancelled")}</option>
                       </select>
                     )}
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-indigo-600 hover:text-indigo-800 font-medium text-xs">{t("admin.viewDetails")}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        ) : (
          <div className="p-12 text-center text-neutral-500">
            <Package className="w-12 h-12 mb-3 opacity-20 mx-auto" />
            <p>{t("admin.noOrdersFound")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
