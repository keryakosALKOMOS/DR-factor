"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Package, Shirt, XCircle, Loader2, Sparkles, Eye } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface CustomOrder {
  _id: string;
  createdAt: string;
  description: string;
  aiPreviewUrl?: string;
  uploadedLogoUrl?: string;
  uploadedDesignUrl?: string;
  hexColors?: string[];
  status: string;
  user?: { name: string; email: string };
  totalPrice: number;
  shippingAddress?: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  paymentMethod?: string;
  paymentProofUrl?: string;
  paymentStatus?: string;
}

export default function AdminCustomOrdersPage() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<string>("All");
  const [selectedOrder, setSelectedOrder] = useState<CustomOrder | null>(null);
  const [priceInput, setPriceInput] = useState<string>("");

  const tabs = [
    { key: "All", label: t("admin.tabAll") },
    { key: "Pending", label: t("admin.tabPending") },
    { key: "Confirmed", label: t("admin.tabConfirmed") },
    { key: "Processing", label: t("admin.tabManufacturing") },
    { key: "Shipped", label: t("admin.tabShipped") },
    { key: "Delivered", label: t("admin.tabDelivered") },
    { key: "Rejected", label: t("admin.tabRejected") },
  ];

  useEffect(() => {
    if (selectedOrder) {
      setPriceInput(selectedOrder.totalPrice > 0 ? selectedOrder.totalPrice.toString() : "");
    }
  }, [selectedOrder]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/custom-orders?t=" + new Date().getTime());
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (e) {
      console.error("Failed to fetch custom orders", e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/custom-orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        if (newStatus === "Rejected") {
          setOrders(prev => prev.filter(o => o._id !== orderId));
          if (selectedOrder?._id === orderId) setSelectedOrder(null);
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

  const handleAction = async (orderId: string, action: "Confirmed" | "Rejected") => {
    handleStatusChange(orderId, action);
  };

  const handleSetPriceAndApprove = async () => {
    if (!selectedOrder || !priceInput) return;
    setUpdatingId(selectedOrder._id);
    try {
      const res = await fetch(`/api/admin/custom-orders/${selectedOrder._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Confirmed", totalPrice: Number(priceInput) }),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o._id === selectedOrder._id ? { ...o, status: "Confirmed", totalPrice: Number(priceInput) } : o));
        setSelectedOrder(null);
      } else {
        alert("Failed to set price and approve.");
      }
    } catch (e) {
      console.error(e);
      alert("Error approving order.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = activeTab === "All" ? orders : orders.filter(o => o.status === activeTab);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-8">{t("admin.manageCustomOrders")}</h1>
      
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
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-neutral-50">
              <tr className="border-b text-neutral-500">
                <th className="p-4 font-medium">{t("admin.orderId")}</th>
                <th className="p-4 font-medium">{t("admin.customer")}</th>
                <th className="p-4 font-medium">{t("admin.prompt")}</th>
                <th className="p-4 font-medium">{t("admin.preview")}</th>
                <th className="p-4 font-medium">{t("admin.price")}</th>
                <th className="p-4 font-medium">{t("admin.status")}</th>
                <th className="p-4 font-medium text-right">{t("admin.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr 
                  key={order._id} 
                  onClick={() => setSelectedOrder(order)}
                  className="border-b last:border-0 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  <td className="p-4 font-mono text-xs">{order._id.slice(-8).toUpperCase()}</td>
                  <td className="p-4">
                    <p className="font-medium text-neutral-900">{order.user?.name || t("admin.unknown")}</p>
                    <p className="text-xs text-neutral-500">{order.user?.email || ""}</p>
                  </td>
                  <td className="p-4 text-xs text-neutral-500 max-w-[200px] truncate" title={order.description}>
                     {order.description}
                  </td>
                  <td className="p-4">
                     {order.aiPreviewUrl ? (
                         <img src={order.aiPreviewUrl} alt="AI Design" className="w-12 h-12 object-cover rounded shadow-sm border" />
                     ) : (
                         <span className="text-neutral-400 italic">{t("admin.noneText")}</span>
                     )}
                  </td>
                  <td className="p-4 font-semibold">
                     {order.totalPrice === 0 ? <span className="text-orange-500 text-xs bg-orange-50 px-2 py-1 rounded">{t("admin.tbd")}</span> : `${order.totalPrice.toFixed(2)} ${t("common.currency")}`}
                  </td>
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                     {updatingId === order._id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                     ) : (
                       <select 
                         value={order.status}
                         onChange={(e) => handleStatusChange(order._id, e.target.value)}
                         className="bg-transparent border rounded p-1 text-xs outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                       >
                          <option value="Pending">{t("admin.tabPendingReview")}</option>
                          <option value="Confirmed">{t("admin.tabConfirmed")}</option>
                          <option value="Processing">{t("admin.tabManufacturing")}</option>
                          <option value="Shipped">{t("admin.tabShipped")}</option>
                          <option value="Delivered">{t("admin.tabDelivered")}</option>
                          <option value="Rejected">{t("admin.tabRejected")}</option>
                       </select>
                     )}
                  </td>
                  <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                     <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="text-neutral-500 hover:text-indigo-600 transition-colors" 
                          title={t("admin.viewDetails")}
                        >
                            <Eye className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleAction(order._id, "Confirmed")}
                          className="text-green-600 hover:text-green-800 disabled:opacity-50" 
                          title={t("admin.approve")}
                          disabled={updatingId === order._id || order.status === "Confirmed"}
                        >
                            <CheckCircle className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleAction(order._id, "Rejected")}
                          className="text-red-500 hover:text-red-700 disabled:opacity-50" 
                          title={t("admin.reject")}
                          disabled={updatingId === order._id || order.status === "Rejected"}
                        >
                            <XCircle className="w-5 h-5" />
                        </button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-neutral-500">
            <Shirt className="w-12 h-12 mb-3 opacity-20 mx-auto" />
            <p>{t("admin.noOrdersFound")}</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl relative max-h-[90vh] overflow-y-auto">
               <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 text-neutral-400 hover:text-black">
                  <XCircle className="w-6 h-6" />
               </button>
               
               <h2 className="text-2xl font-bold mb-6 border-b pb-4">{t("admin.orderDetails")} <span className="font-mono text-indigo-600">{selectedOrder._id.slice(-8).toUpperCase()}</span></h2>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column: Design */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5"/> {t("admin.designSpecs")}</h3>
                    
                    <div className="bg-neutral-50 p-4 rounded-xl mb-4">
                      <p className="text-sm font-medium text-neutral-500 mb-1">{t("admin.prompt")}:</p>
                      <p className="text-neutral-900 text-sm whitespace-pre-wrap leading-relaxed">{selectedOrder.description}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                       <div>
                         <p className="text-sm font-medium text-neutral-500 mb-2 truncate" title={t("admin.aiPreview")}>{t("admin.aiPreview")}:</p>
                         {selectedOrder.aiPreviewUrl ? (
                           <a href={selectedOrder.aiPreviewUrl} target="_blank" rel="noopener noreferrer">
                             <img src={selectedOrder.aiPreviewUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg border shadow-sm hover:opacity-80 transition" />
                           </a>
                         ) : <span className="text-neutral-400 text-sm">{t("admin.noneText")}</span>}
                       </div>
                       <div>
                         <p className="text-sm font-medium text-neutral-500 mb-2 truncate" title={t("custom.uploadDesignLabel") || "User Design"}>{t("custom.uploadDesignLabel") || "User Design"}:</p>
                         {selectedOrder.uploadedDesignUrl ? (
                           <a href={selectedOrder.uploadedDesignUrl} target="_blank" rel="noopener noreferrer">
                             <img src={selectedOrder.uploadedDesignUrl} alt="Design" className="w-full h-32 object-contain bg-neutral-100 rounded-lg border shadow-sm hover:opacity-80 transition" />
                           </a>
                         ) : <span className="text-neutral-400 text-sm">{t("admin.noneText")}</span>}
                       </div>
                       <div>
                         <p className="text-sm font-medium text-neutral-500 mb-2 truncate" title={t("admin.userUploadLogo")}>{t("admin.userUploadLogo")}</p>
                         {selectedOrder.uploadedLogoUrl ? (
                           <a href={selectedOrder.uploadedLogoUrl} target="_blank" rel="noopener noreferrer">
                             <img src={selectedOrder.uploadedLogoUrl} alt="Logo" className="w-full h-32 object-contain bg-neutral-100 rounded-lg border shadow-sm hover:opacity-80 transition" />
                           </a>
                         ) : <span className="text-neutral-400 text-sm">{t("admin.noneText")}</span>}
                       </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-neutral-500 mb-2">{t("admin.colorsText")}</p>
                      <div className="flex gap-2">
                        {selectedOrder.hexColors && selectedOrder.hexColors.length > 0 ? selectedOrder.hexColors.map(c => (
                           <span key={c} className="flex items-center gap-1 bg-white border px-2 py-1 rounded shadow-sm text-xs font-mono">
                             <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c }}></div> {c}
                           </span>
                        )) : <span className="text-neutral-400 text-sm">{t("admin.noColors")}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Customer & Pricing */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Package className="w-5 h-5"/> {t("admin.shippingCustomer")}</h3>
                    
                    <div className="bg-neutral-50 p-4 rounded-xl mb-6">
                      <p className="font-semibold text-neutral-900">{selectedOrder.shippingAddress?.fullName || selectedOrder.user?.name || t("admin.unknown")}</p>
                      <p className="text-neutral-600 text-sm mt-1">{selectedOrder.user?.email}</p>
                      <p className="text-neutral-600 text-sm">{selectedOrder.shippingAddress?.phone}</p>
                      
                      <div className="mt-4 pt-4 border-t border-neutral-200">
                        <p className="text-sm text-neutral-500 mb-1">{t("admin.shippingAddressText")}</p>
                        <p className="text-neutral-800 text-sm">
                           {selectedOrder.shippingAddress?.address}<br/>
                           {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode}<br/>
                           {selectedOrder.shippingAddress?.country}
                        </p>
                      </div>
                    </div>

                    <div className="border p-6 rounded-xl bg-white shadow-sm">
                       <h3 className="font-bold text-lg mb-4">{t("admin.pricingActions")}</h3>
                       <div className="flex items-center justify-between mb-4">
                         <span className="text-neutral-600">{t("admin.currentStatus")}</span>
                         <span className="font-mono font-semibold px-3 py-1 bg-neutral-100 rounded-full text-sm">{selectedOrder.status}</span>
                       </div>
                       
                       {selectedOrder.paymentMethod && (
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-neutral-600">Payment</span>
                            <div className="text-right">
                              <span className="font-mono font-semibold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm block mb-2">{selectedOrder.paymentMethod}</span>
                              {selectedOrder.paymentProofUrl && (
                                 <a href={selectedOrder.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline font-bold flex items-center justify-end gap-1">
                                   View Receipt <Eye className="w-3 h-3" />
                                 </a>
                              )}
                            </div>
                          </div>
                       )}

                       <div className="flex items-center justify-between mb-6">
                         <span className="text-neutral-600">{t("admin.totalPriceText")}</span>
                         <span className="font-bold text-xl">
                            {selectedOrder.totalPrice === 0 ? t("admin.tbd") : `${selectedOrder.totalPrice.toFixed(2)} ${t("common.currency")}`}
                         </span>
                       </div>
                       
                       {selectedOrder.status === "Pending" ? (
                         <div className="bg-neutral-50 border rounded-xl p-4 mb-4">
                           <label className="block text-sm font-semibold mb-2">{t("admin.setFinalPrice")}</label>
                           <div className="flex gap-2">
                             <div className="relative flex-1">
                               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-[10px] font-black">{t("common.currency")}</span>
                               <input 
                                 type="number" 
                                 placeholder="500.00"
                                 value={priceInput}
                                 onChange={(e) => setPriceInput(e.target.value)}
                                 className="w-full pl-12 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                               />
                             </div>
                             <button 
                               onClick={handleSetPriceAndApprove}
                               disabled={!priceInput || updatingId === selectedOrder._id}
                               className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                             >
                               {updatingId === selectedOrder._id ? <Loader2 className="w-4 h-4 animate-spin"/> : <CheckCircle className="w-4 h-4"/>}
                               {t("admin.approve")}
                             </button>
                           </div>
                         </div>
                       ) : null}

                       <button onClick={() => setSelectedOrder(null)} className="w-full bg-neutral-100 hover:bg-neutral-200 text-black py-3 rounded-xl font-bold transition-colors">
                          {t("admin.closeView")}
                       </button>
                    </div>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
