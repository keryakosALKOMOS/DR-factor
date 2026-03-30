"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, Tags, X, Trash2, Image as ImageIcon, Upload } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Category { _id: string; name: string; parent?: { _id: string } | string | null; }
interface Product {
  _id: string; name: string; slug: string; price: number; stock: number;
  images: string[]; category?: { _id?: string; name: string }; isFeatured: boolean;
}

export default function AdminProductsPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [mainCategoryId, setMainCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sizeInput, setSizeInput] = useState("");
  const [colorInput, setColorInput] = useState("#000000");
  const [colors, setColors] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [pRes, cRes] = await Promise.all([
      fetch("/api/admin/products"),
      fetch("/api/admin/categories"),
    ]);
    const [pData, cData] = await Promise.all([pRes.json(), cRes.json()]);
    if (pData.products) setProducts(pData.products);
    if (cData.categories) setCategories(cData.categories);
    setLoading(false);
  };

  const addSize = () => {
    const s = sizeInput.trim().toUpperCase();
    if (s && !selectedSizes.includes(s)) setSelectedSizes(prev => [...prev, s]);
    setSizeInput("");
  };

  const addColor = () => { if (!colors.includes(colorInput)) setColors([...colors, colorInput]); };

  const resetForm = () => {
    setName(""); setDescription(""); setPrice(""); setStock("0"); setMainCategoryId(""); setSubCategoryId("");
    setSelectedSizes([]); setColors([]); setImages([]); setIsFeatured(false);
    setColorInput("#000000"); setError(""); setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError("");
    const url = editingId ? `/api/admin/products/${editingId}` : "/api/admin/products";
    const method = editingId ? "PUT" : "POST";
    const finalCategoryId = subCategoryId || mainCategoryId;
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, price, stock, category: finalCategoryId, sizes: selectedSizes, colors, images, isFeatured }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); }
    else { resetForm(); setShowForm(false); fetchData(); }
    setSaving(false);
  };

  const openEdit = (product: Product) => {
    setEditingId(product._id);
    setName(product.name);
    setDescription((product as any).description || "");
    setPrice(product.price.toString());
    setStock(product.stock.toString());
    const pCatId = (product as any).category?._id || (product as any).category || "";
    const pCat = categories.find(c => c._id === pCatId);
    if (pCat?.parent) {
      setMainCategoryId(typeof pCat.parent === "string" ? pCat.parent : pCat.parent._id);
      setSubCategoryId(pCat._id);
    } else {
      setMainCategoryId(pCat?._id || "");
      setSubCategoryId("");
    }
    setSelectedSizes((product as any).sizes || []);
    setColors((product as any).colors || []);
    setImages(product.images || []);
    setIsFeatured(product.isFeatured);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("admin.sure"))) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    fetchData();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t("admin.manageProducts")}</h1>
        <button onClick={() => { setShowForm(true); resetForm(); }}
          className="bg-black text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-neutral-800 transition-colors">
          <Plus className="w-4 h-4" /> {t("admin.addProduct")}
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative max-h-[95vh] flex flex-col">
            <button onClick={() => setShowForm(false)} className="absolute top-4 z-10 right-4 bg-white/50 backdrop-blur-sm rounded-full p-1 text-neutral-500 hover:text-black hover:bg-neutral-100 transition-all"><X className="w-5 h-5" /></button>
            <div className="p-8 overflow-y-auto custom-scrollbar">
              <h2 className="text-xl font-bold mb-6">{editingId ? t("admin.editProduct") : t("admin.addNewProduct")}</h2>
            {error && <p className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">{t("admin.productName")}</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black" placeholder="DS Classic Tee" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">{t("admin.priceUsd")}</label>
                  <input type="number" required min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black" placeholder="100.00" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">{t("admin.stockQuantity")}</label>
                  <input type="number" min="0" value={stock} onChange={e => setStock(e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-semibold mb-1">{t("admin.categoryStar")}</label>
                  <select required value={mainCategoryId} onChange={e => { setMainCategoryId(e.target.value); setSubCategoryId(""); }}
                    className="w-full border border-neutral-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black">
                    <option value="">{t("admin.selectCategory")}</option>
                    {categories.filter(c => !c.parent).map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-semibold mb-1">{t("admin.subCategory") || "Sub Category"}</label>
                  <select value={subCategoryId} onChange={e => setSubCategoryId(e.target.value)} disabled={!mainCategoryId || categories.filter(c => c.parent && (typeof c.parent === 'string' ? c.parent : c.parent._id) === mainCategoryId).length === 0}
                    className="w-full border border-neutral-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black disabled:opacity-50 disabled:bg-neutral-100">
                    <option value="">{t("admin.selectSubCategory") || "Select Sub Category"}</option>
                    {categories.filter(c => c.parent && (typeof c.parent === 'string' ? c.parent : c.parent._id) === mainCategoryId).map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">{t("admin.descriptionStar")}</label>
                  <textarea required rows={3} value={description} onChange={e => setDescription(e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black resize-none" placeholder={t("admin.describeProduct")} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">{t("admin.availableSizes")}</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={sizeInput} onChange={e => setSizeInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSize(); }}}
                    className="flex-1 border border-neutral-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-black text-sm"
                    placeholder={t("admin.typeSize")} />
                  <button type="button" onClick={addSize}
                    className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-700">{t("admin.addBtn")}</button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {selectedSizes.map(s => (
                    <span key={s} className="flex items-center gap-1 bg-black text-white px-3 py-1.5 rounded-lg text-sm font-semibold">
                      {s}
                      <button type="button" onClick={() => setSelectedSizes(prev => prev.filter(x => x !== s))}
                        className="ml-1 opacity-70 hover:opacity-100">×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">{t("admin.colorsLabel")}</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={colorInput} onChange={e => setColorInput(e.target.value)} className="w-10 h-10 cursor-pointer border-0 p-0" />
                  <button type="button" onClick={addColor} className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-700">{t("admin.addBtn")}</button>
                </div>
                <div className="flex gap-2 flex-wrap mt-2">
                  {colors.map(c => (
                    <div key={c} className="flex items-center gap-1 bg-neutral-100 px-3 py-1 rounded-full text-xs">
                      <span className="w-4 h-4 rounded-full inline-block" style={{ background: c }} />
                      {c}
                      <button type="button" onClick={() => setColors(colors.filter(x => x !== c))} className="ml-1 text-neutral-400 hover:text-red-500">×</button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-neutral-700 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> {t("admin.productImages")}
                </label>
                <CldUploadWidget uploadPreset="DSfactor" signatureEndpoint="/api/cloudinary/sign"
                  onSuccess={(result: any) => {
                    if (result.info?.secure_url) { setImages(prev => [...prev, result.info.secure_url]); }
                  }}
                  options={{ multiple: true, maxFiles: 5, resourceType: "image", clientAllowedFormats: ["webp", "png", "jpg", "jpeg"] }}>
                  {({ open }) => (
                    <button type="button" onClick={() => open()}
                      className="w-full border-2 border-dashed border-neutral-300 rounded-2xl py-8 flex flex-col items-center justify-center hover:border-black hover:bg-neutral-50 transition-all group">
                      <div className="bg-neutral-100 p-3 rounded-full group-hover:bg-black group-hover:text-white transition-colors mb-2">
                        <Upload className="w-6 h-6" />
                      </div>
                      <span className="font-semibold text-sm">{t("admin.clickUpload")}</span>
                      <span className="text-xs text-neutral-500 mt-1">{t("admin.imageFormats")}</span>
                    </button>
                  )}
                </CldUploadWidget>
                {images.length > 0 && (
                  <div className="flex gap-3 mt-4 flex-wrap">
                    {images.map((img, i) => (
                      <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-neutral-200 shadow-sm group">
                        <img src={img} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))}
                          className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-lg backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="featured" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="w-4 h-4 cursor-pointer" />
                <label htmlFor="featured" className="text-sm font-semibold cursor-pointer">{t("admin.featuredProduct")}</label>
              </div>

              <button type="submit" disabled={saving}
                className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-neutral-800 transition-colors flex justify-center items-center">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingId ? t("admin.updateProduct") : t("admin.createProduct"))}
              </button>
            </form>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-neutral-400" /></div>
        ) : products.length > 0 ? (
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50">
              <tr className="border-b text-neutral-500">
                <th className="p-4 font-medium">{t("admin.productTh")}</th>
                <th className="p-4 font-medium">{t("admin.categoryTh")}</th>
                <th className="p-4 font-medium">{t("admin.price")}</th>
                <th className="p-4 font-medium">{t("admin.stockTh")}</th>
                <th className="p-4 font-medium text-right">{t("admin.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-b last:border-0 hover:bg-neutral-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-neutral-200 rounded-lg overflow-hidden shrink-0">
                        {product.images?.[0] && <img src={product.images[0]} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        {product.isFeatured && <span className="text-xs text-yellow-600 font-medium">⭐ {t("admin.featuredBadge")}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-neutral-600">{product.category?.name || "—"}</td>
                  <td className="p-4 font-semibold">{product.price.toFixed(2)} {t("common.currency")}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                      {product.stock > 0 ? `${product.stock} ${t("admin.inStock")}` : t("admin.outOfStock")}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => openEdit(product)} className="text-indigo-600 hover:text-indigo-800 font-medium text-xs">
                        {t("admin.editBtn")}
                      </button>
                      <button onClick={() => handleDelete(product._id)} className="text-red-500 hover:text-red-700 font-medium text-xs flex items-center gap-1">
                        <Trash2 className="w-3 h-3" /> {t("admin.deleteBtn")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-neutral-500">
            <Tags className="w-12 h-12 mb-3 opacity-20 mx-auto" />
            <p>{t("admin.noProductsYet")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
