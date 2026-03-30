"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { Plus } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ProductsPage() {
  const { t, lang } = useLanguage();
  const isRTL = lang === "ar";
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryFilter = searchParams.get("category");
  
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (e) {
        console.error("Failed to fetch categories", e);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const url = categoryFilter ? `/api/products?category=${categoryFilter}` : "/api/products";
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryFilter]);

  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.sizes?.length > 0 || product.colors?.length > 0) {
      router.push(`/products/${product._id}`);
      return;
    }

    addItem({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.[0] || "https://via.placeholder.com/600",
    });
  };

  // Logic for dynamic categories
  const topLevelCategories = categories.filter(c => !c.parent || c.parent === null);
  const activeCategoryDoc = categories.find(c => c.slug === categoryFilter);
  const isSubCategory = !!activeCategoryDoc?.parent;
  
  const parentCategoryDoc = isSubCategory 
    ? categories.find(c => c._id === (typeof activeCategoryDoc.parent === 'string' ? activeCategoryDoc.parent : activeCategoryDoc.parent._id))
    : activeCategoryDoc;

  const subCategories = parentCategoryDoc 
    ? categories.filter(c => c.parent && (typeof c.parent === 'string' ? c.parent : c.parent._id) === parentCategoryDoc._id) 
    : [];

  const activeParentSlug = parentCategoryDoc?.slug || null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-8 md:py-12">
      <div className="flex flex-col mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-baseline mb-8">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-6 md:mb-0">
            {!categoryFilter ? t("products.allProducts") : activeCategoryDoc?.name || categoryFilter}
          </h1>
          <div className="flex w-full md:w-auto overflow-x-auto no-scrollbar gap-4 text-sm font-medium border-b pb-2">
            <Link href="/products" className={`whitespace-nowrap hover:text-black transition-all ${!categoryFilter ? 'text-black border-b-2 border-black font-bold' : 'text-neutral-400'}`}>{t("products.all")}</Link>
            {topLevelCategories.map(cat => (
              <Link 
                key={cat._id}
                href={`/products?category=${cat.slug}`} 
                className={`whitespace-nowrap hover:text-black transition-all ${(categoryFilter === cat.slug || activeParentSlug === cat.slug) ? 'text-black border-b-2 border-black font-bold' : 'text-neutral-400'}`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Subcategories (Visible if active category has children) */}
        {subCategories.length > 0 && (
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
             <div className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-neutral-400 mr-2 shrink-0">{t("products.refine") || (isRTL ? "تصفية: " : "Refine: ")}</div>
             {subCategories.map(sub => (
                <Link
                  key={sub._id}
                  href={`/products?category=${sub.slug}`}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0 ${
                    categoryFilter === sub.slug 
                      ? "bg-black text-white border-black" 
                      : "bg-white text-neutral-600 border-neutral-100 hover:border-neutral-300"
                  }`}
                >
                  {sub.name}
                </Link>
             ))}
          </div>
        )}
      </div>

      {loading ? (
         <div className="py-24 text-center">
           <div className="w-8 h-8 border-4 border-neutral-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
           <p className="text-neutral-500 font-medium">{t("products.loading")}</p>
         </div>
      ) : products.length === 0 ? (
         <div className="py-24 text-center bg-neutral-50 rounded-3xl border-2 border-dashed border-neutral-200">
           <p className="text-neutral-500 font-medium">{t("products.empty")}</p>
         </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-10 md:gap-y-12">
          {products.map((product) => (
            <Link href={`/products/${product._id}`} key={product._id} className="group flex flex-col h-full cursor-pointer">
              <div className="relative aspect-[3/4] bg-neutral-100 rounded-3xl overflow-hidden mb-4 shadow-sm group-hover:shadow-md transition-shadow">
                <img
                  src={product.images?.[0] || "https://via.placeholder.com/600"}
                  alt={product.name}
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Desktop: Hover | Mobile: Always visible or better interaction */}
                <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 md:group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/60 to-transparent flex justify-center translate-y-2 group-hover:translate-y-0 transition-transform">
                  <button 
                    onClick={(e) => handleAddToCart(e, product)}
                    className="bg-white text-black w-full py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center shadow-2xl hover:bg-neutral-100 active:scale-95 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> {(product.sizes?.length > 0 || product.colors?.length > 0) ? t("products.selectOptions") || "Select Options" : t("products.addToCart")}
                  </button>
                </div>
                
                {/* Quick Add for Mobile (Small circle button) */}
                <button
                  onClick={(e) => handleAddToCart(e, product)}
                  className="md:hidden absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg active:scale-90"
                >
                  <Plus className="w-4 h-4 text-black" />
                </button>
              </div>
              <div className="flex-1 flex flex-col">
                <h3 className="text-sm font-bold text-neutral-900 line-clamp-1 mb-1">{product.name}</h3>
                <p className="text-sm text-neutral-500 font-medium mt-auto decoration-indigo-500/30 group-hover:underline underline-offset-4">{product.price.toFixed(2)} {t("common.currency")}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
