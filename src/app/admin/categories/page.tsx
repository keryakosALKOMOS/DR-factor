"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, LayoutDashboard, X, Trash2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Category {
  _id: string;
  name: string;
  slug: string;
  parent?: { _id: string; name: string };
}

export default function AdminCategoriesPage() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    if (data.categories) setCategories(data.categories);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true); setError("");
    const url = editingId ? `/api/admin/categories/${editingId}` : "/api/admin/categories";
    const method = editingId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, parent: parentId || null }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); }
    else { setName(""); setParentId(""); setEditingId(null); setShowForm(false); fetchCategories(); }
    setSaving(false);
  };

  const openEdit = (cat: Category) => {
    setEditingId(cat._id);
    setName(cat.name);
    setParentId(cat.parent?._id || "");
    setShowForm(true);
    setError("");
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    setConfirmDeleteId(null);
    fetchCategories();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t("admin.categories")}</h1>
        <button onClick={() => { setShowForm(true); setEditingId(null); setName(""); setParentId(""); setError(""); }}
          className="bg-black text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-neutral-800 transition-colors">
          <Plus className="w-4 h-4" /> {t("admin.newCategory")}
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-neutral-400 hover:text-black"><X className="w-5 h-5" /></button>
            <h2 className="text-xl font-bold mb-6">{editingId ? t("admin.editCategory") : t("admin.newCategory")}</h2>
            {error && <p className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">{t("admin.categoryName")}</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">{t("admin.parentCategory")}</label>
                <select value={parentId} onChange={e => setParentId(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black">
                  <option value="">None (Root)</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <button type="submit" disabled={saving}
                className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-neutral-800 transition-colors flex justify-center items-center">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingId ? t("admin.updateCategory") : t("admin.createCategory"))}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden max-w-4xl">
        {loading ? (
          <div className="p-16 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-neutral-400" /></div>
        ) : categories.length > 0 ? (
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50">
              <tr className="border-b text-neutral-500">
                <th className="p-4 font-medium">{t("admin.nameTh")}</th>
                <th className="p-4 font-medium">{t("admin.slugTh")}</th>
                <th className="p-4 font-medium">{t("admin.parentTh")}</th>
                <th className="p-4 font-medium text-right">{t("admin.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id} className="border-b last:border-0 hover:bg-neutral-50 transition-colors">
                  <td className="p-4 font-medium">{cat.name}</td>
                  <td className="p-4 text-neutral-500 font-mono text-xs">{cat.slug}</td>
                  <td className="p-4">
                    {cat.parent ? (
                      <span className="text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md text-xs">{cat.parent.name}</span>
                    ) : (
                      <span className="text-neutral-400 italic text-xs">Root</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {confirmDeleteId === cat._id ? (
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-xs text-neutral-500">{t("admin.sure")}</span>
                        <button onClick={() => handleDelete(cat._id)}
                          className="text-white bg-red-500 hover:bg-red-700 rounded-lg px-2 py-1 text-xs font-semibold">{t("admin.yesDelete")}</button>
                        <button onClick={() => setConfirmDeleteId(null)}
                          className="text-neutral-500 hover:text-black text-xs font-semibold">{t("admin.cancel")}</button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => openEdit(cat)} className="text-indigo-600 hover:text-indigo-800 font-medium text-xs">
                          {t("admin.editBtn")}
                        </button>
                        <button onClick={() => setConfirmDeleteId(cat._id)}
                          className="text-red-500 hover:text-red-700 font-medium text-xs flex items-center gap-1">
                          <Trash2 className="w-3 h-3" /> {t("admin.deleteBtn")}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-neutral-500">
            <LayoutDashboard className="w-12 h-12 mb-3 opacity-20 mx-auto" />
            <p>{t("admin.noCategories")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
