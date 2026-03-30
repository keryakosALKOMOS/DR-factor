"use client";

import { CreditCard, Package, Shirt, Users } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useState, useEffect } from "react";

interface DashboardData {
  userCount: number;
  standardOrdersCount: number;
  customOrdersCount: number;
  totalRevenue: number;
  recentOrders: any[];
  recentCustomOrders: any[];
  newCustomCount: number;
}

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [data, setData] = useState<DashboardData>({
    userCount: 0, standardOrdersCount: 0, customOrdersCount: 0,
    totalRevenue: 0, recentOrders: [], recentCustomOrders: [], newCustomCount: 0,
  });

  useEffect(() => {
    fetch("/api/admin/dashboard").then(r => r.json()).then(d => {
      if (d) setData(d);
    }).catch(() => {});
  }, []);

  const stats = [
    { name: t("admin.totalRevenue"), value: `${data.totalRevenue.toFixed(2)} ${t("common.currency")}`, icon: <CreditCard className="w-5 h-5 text-neutral-700" />, change: "100%" },
    { name: t("admin.standardOrders"), value: data.standardOrdersCount.toString(), icon: <Package className="w-5 h-5 text-neutral-700" />, change: t("admin.lifetime") },
    { name: t("admin.customAiOrders"), value: data.customOrdersCount.toString(), icon: <Shirt className="w-5 h-5 text-neutral-700" />, change: t("admin.lifetime") },
    { name: t("admin.totalUsers"), value: data.userCount.toString(), icon: <Users className="w-5 h-5 text-neutral-700" />, change: t("admin.lifetime") },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-8">{t("admin.systemOverview")}</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-medium text-neutral-500">{stat.name}</p>
              <div className="bg-neutral-100 p-2 rounded-lg">
                {stat.icon}
              </div>
            </div>
            <div className="mt-auto">
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-sm text-green-600 font-medium mt-1">{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Standard Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 flex flex-col min-h-96 overflow-hidden">
          <h2 className="text-xl font-bold mb-4">{t("admin.recentStandardOrders")}</h2>
          {data.recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-neutral-500">
                    <th className="pb-3 font-medium">{t("admin.customer")}</th>
                    <th className="pb-3 font-medium">{t("admin.amount")}</th>
                    <th className="pb-3 font-medium">{t("admin.status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order: any) => (
                    <tr key={order._id?.toString()} className="border-b last:border-0 hover:bg-neutral-50">
                      <td className="py-4">{order.user?.name || t("admin.unknown")}</td>
                      <td className="py-4">{order.totalPrice?.toFixed(2)} {t("common.currency")}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === "Pending" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center text-neutral-400">
              <Package className="w-12 h-12 mb-3 opacity-20" />
              <p>{t("admin.noStandardOrders")}</p>
            </div>
          )}
        </div>

        {/* Custom Design Orders Overview */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 flex flex-col min-h-96 border-t-4 border-t-indigo-600">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            {t("admin.recentCustomDesigns")}
            {data.newCustomCount > 0 && (
              <span className="ml-3 bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">{data.newCustomCount} {t("admin.tabPending")}</span>
            )}
          </h2>
          {data.recentCustomOrders.length > 0 ? (
             <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-neutral-500">
                    <th className="pb-3 font-medium">{t("admin.customer")}</th>
                    <th className="pb-3 font-medium">{t("admin.aiPreview")}</th>
                    <th className="pb-3 font-medium">{t("admin.status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentCustomOrders.map((order: any) => (
                    <tr key={order._id?.toString()} className="border-b last:border-0 hover:bg-neutral-50">
                      <td className="py-4">{order.user?.name || t("admin.unknown")}</td>
                      <td className="py-4">
                        {order.aiPreviewUrl ? (
                          <img src={order.aiPreviewUrl} alt="Preview" className="w-10 h-10 object-cover rounded" />
                        ) : (
                          t("admin.noImage")
                        )}
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === "Pending" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center text-neutral-400">
              <Shirt className="w-12 h-12 mb-3 opacity-20" />
              <p>{t("admin.noCustomDesigns")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
