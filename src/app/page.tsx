"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Star, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useCartStore } from "@/store/useCartStore";

export default function Home() {
  const { t } = useLanguage();
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch("/api/products?isFeatured=true");
        if (res.ok) {
          const data = await res.json();
          setFeaturedProducts(data.slice(0, 4)); // Only show up to 4 featured items
        }
      } catch (err) {
        console.error("Failed to fetch featured products", err);
      }
    };
    fetchFeatured();
  }, []);

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

  const categories = [
    { title: t("home.menCol"), image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=800", link: "/products?category=men" },
    { title: t("home.womenCol"), image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800", link: "/products?category=women" },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black z-10 opacity-30"></div>
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000"
          alt="Fashion Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-20 text-center text-white px-6 w-full max-w-4xl"
        >
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">{t("home.heroTitle")}</h1>
          <p className="text-base md:text-xl font-light max-w-2xl mx-auto mb-10 opacity-90 leading-relaxed md:leading-normal">
            {t("home.heroDesc")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto sm:max-w-none">
            <Link 
              href="/products" 
              className="bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-neutral-200 transition-all w-full sm:w-auto text-center active:scale-95"
            >
              {t("home.shopBtn")}
            </Link>
            <Link 
              href="/custom-design" 
              className="bg-transparent border border-white text-white px-8 py-4 rounded-full font-bold hover:bg-white hover:text-black transition-all flex items-center justify-center w-full sm:w-auto active:scale-95"
            >
              {t("home.designBtn")} <ArrowRight className="ms-2 w-4 h-4 rtl:-scale-x-100" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Categories */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {categories.map((cat, idx) => (
            <Link href={cat.link} key={idx} className="group relative h-[40vh] sm:h-[50vh] md:h-[60vh] overflow-hidden rounded-3xl block shadow-xl shadow-black/5">
              <div className="absolute inset-0 bg-black z-10 opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
              <img
                src={cat.image}
                alt={cat.title}
                className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
              />
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center">
                <h2 className="text-3xl sm:text-4xl text-white font-black tracking-tight mb-4 drop-shadow-lg">{cat.title}</h2>
                <span className="text-white border-b-2 border-white/50 pb-1 flex items-center font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  {t("home.discover")} <ArrowRight className="ms-2 w-4 h-4 rtl:-scale-x-100" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">{t("home.featuredTitle")}</h2>
            <Link href="/products" className="text-sm font-bold flex items-center hover:text-neutral-500 transition-colors">
              {t("home.shopBtn")} <ArrowRight className="ms-2 w-4 h-4 rtl:-scale-x-100" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-10 md:gap-y-12">
            {featuredProducts.map((product) => (
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
                  
                  {/* Quick Add for Mobile */}
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
        </section>
      )}

      {/* Featured Banner / Quote */}
      <section className="bg-neutral-50 py-24 md:py-32 text-center px-6">
        <Star className="w-8 h-8 text-black fill-black mx-auto mb-8 opacity-20" />
        <h3 className="text-2xl md:text-5xl font-light tracking-tight max-w-4xl mx-auto leading-snug md:leading-tight italic text-neutral-800">
          {t("home.quote")}
        </h3>
        <p className="mt-10 text-neutral-400 uppercase tracking-[0.2em] text-[10px] sm:text-sm font-black">{t("home.quoteAuthor")}</p>
      </section>
    </div>
  );
}
