"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  Plus,
  Minus,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Star,
  UtensilsCrossed,
  ReceiptText,
  CookingPot,
  Utensils,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useSession } from "@/context/SessionContext";
import { MENU_ITEMS } from "@/lib/mock-data";
import { OrderMode } from "@/lib/types";

interface MenuPageContentProps {
  initialMode?: OrderMode;
}

export function MenuPageContent({ initialMode }: MenuPageContentProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [imgError, setImgError] = useState<{ [key: string]: boolean }>({});
  const [sortBy, setSortBy] = useState("default");
  const [dietFilter, setDietFilter] = useState("all");
  const [showFilterModal, setShowFilterModal] = useState(false);

  const { addItem, updateQuantity, getQuantity, totalItemCount, totals } =
    useCart();

  const { tableNumber, mode, setMode } = useSession();

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode, setMode]);

  const currentMode = initialMode || mode;

  const getCategoryLabel = (cat: string) => {
    if (cat === "Semua") return "Semua";
    if (cat === "Populer") return "Populer";
    if (cat === "Makanan Utama") return "Makanan Utama";
    if (cat === "Minuman") return "Minuman";
    if (cat === "Snack") return "Snack";
    return cat;
  };

  const categories = [
    "Semua",
    "Populer",
    "Makanan Utama",
    "Minuman",
    "Snack",
  ];

  const getBadgeTags = (menu: any) => {
    const tags: {
      text: string;
      bg: string;
      isStar?: boolean;
    }[] = [];

    if (menu.tag) {
      tags.push({
        text: menu.tag,
        bg: "bg-[#F4F4F5] text-[#3F3F46]",
      });
    }

    if (menu.rating) {
      tags.push({
        text: `${menu.rating}`,
        bg: "text-yellow-400",
        isStar: true,
      });
    }

    if (tags.length === 0) {
      tags.push({
        text: "Rekomendasi",
        bg: "bg-[#F4F4F5] text-[#3F3F46]",
      });
    }

    return tags;
  };

  const popularMenu =
    MENU_ITEMS.find((item) => item.isPopular) || MENU_ITEMS[0];

  const filteredMenuItems = MENU_ITEMS.filter((item) => {
    const matchesCategory =
      selectedCategory === "Semua" ||
      (selectedCategory === "Populer"
        ? item.isPopular
        : selectedCategory === "Makanan Utama"
          ? item.category === "makanan-utama"
          : selectedCategory === "Minuman"
            ? item.category === "minuman"
            : selectedCategory === "Snack"
              ? item.category === "camilan"
              : item.category === selectedCategory);

    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesDiet = true;

    if (dietFilter === "pedas") {
      matchesDiet =
        item.description.toLowerCase().includes("pedas") ||
        item.name.toLowerCase().includes("pedas");
    } else if (dietFilter === "halal") {
      matchesDiet = true;
    } else if (dietFilter === "vegetarian") {
      matchesDiet =
        item.category === "minuman" || item.category === "camilan";
    } else if (dietFilter === "bebas-kacang") {
      matchesDiet = !item.description.toLowerCase().includes("kacang");
    }

    return matchesCategory && matchesSearch && matchesDiet;
  }).sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "rating")
      return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);

    return 0;
  });

  return (
    <div
      className="min-h-screen bg-[#F8F9FA] pb-36 text-[#1A1A18] font-normal"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      {/* HEADER */}
<header className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-[#E4E4E7]">
  <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-3 flex items-center justify-between">
    <div className="flex items-center gap-3.5">
      <div className="relative w-14 h-14 flex-shrink-0">
        <Image
          src="/images/menu/logo_orderpay1.png"
          alt="Logo OrderPay"
          fill
          sizes="56px"
          className="object-contain"
          priority
        />
      </div>

      <div>
        <p className="text-[10px] text-[#71717A] tracking-widest uppercase font-medium">
          Resto Suka Maju
        </p>

        <h1 className="text-base font-bold text-[#09090B] leading-tight">
          {currentMode === "takeaway"
            ? "Menu Takeaway"
            : "Menu Makanan"}
        </h1>
      </div>
    </div>

    <div className="bg-emerald-50 text-[#054B35] text-xs px-3.5 py-1.5 rounded-full flex items-center gap-2 border border-emerald-200/60 font-semibold shadow-sm">
      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
      {currentMode === "dine-in" ? `Meja ${tableNumber}` : "Takeaway"}
    </div>
  </div>
</header>

      <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">

        {/* INFO MEJA */}
        <div className="bg-white rounded-2xl p-4 md:p-6 border border-[#E4E4E7] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <span className="bg-[#F4F4F5] text-[#3F3F46] px-3 py-1 rounded-full font-medium">
                {currentMode === "dine-in"
                  ? `Meja ${tableNumber} • Makan di Tempat`
                  : "Takeaway • Bawa Pulang"}
              </span>

              <span className="flex items-center gap-1.5 text-[#054B35] font-semibold text-xs bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                <span className="w-2 h-2 rounded-full bg-[#054B35] animate-pulse"></span>
                Sesi Aktif
              </span>
            </div>

            <h2 className="text-lg md:text-xl font-bold text-[#09090B] tracking-tight pt-1">
              Selamat Datang di Bistro
            </h2>

            <p className="text-xs md:text-sm text-[#52525B] leading-relaxed max-w-2xl">
              {currentMode === "dine-in"
                ? "Pesan langsung dari meja Anda tanpa antre. Nikmati masakan Nusantara hangat & lezat."
                : "Pesan langsung untuk dibawa pulang tanpa antre. Nikmati masakan Nusantara hangat & lezat."}
            </p>
          </div>
        </div>

        {/* SEARCH & CATEGORIES */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />

              <input
                type="text"
                placeholder="Cari menu makanan dan minuman ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#E4E4E7] rounded-xl pl-10 pr-4 py-2.5 text-xs md:text-sm text-[#09090B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#054B35] transition shadow-sm"
              />
            </div>

            <button
              onClick={() => setShowFilterModal(true)}
              className="p-2.5 bg-white border border-[#E4E4E7] rounded-xl text-[#3F3F46] hover:bg-[#F4F4F5] transition relative shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4 md:w-5 md:h-5" />

              {(sortBy !== "default" || dietFilter !== "all") && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#054B35] rounded-full border border-white"></span>
              )}
            </button>
          </div>

          <div className="overflow-x-auto no-scrollbar py-1 touch-pan-x md:overflow-visible">
            <div className="flex items-center gap-2 w-max md:w-auto">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs md:text-sm whitespace-nowrap transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-[#054B35] text-white shadow-sm font-semibold"
                        : "bg-white border border-[#E4E4E7] text-[#3F3F46] hover:bg-[#F4F4F5]"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* MENU PALING POPULER HERO */}
        <div
          onClick={() => router.push(`/menu/${popularMenu.id}`)}
          className="relative overflow-hidden rounded-3xl bg-white border border-[#E4E4E7] shadow-sm hover:shadow-md transition-all duration-300 grid grid-cols-1 md:grid-cols-12 items-stretch cursor-pointer group"
        >
          <div className="relative h-48 md:h-64 md:col-span-7 lg:col-span-8 overflow-hidden">
            <Image
              src={popularMenu.image}
              alt={popularMenu.name}
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover transition-transform duration-700 hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>

            <div className="absolute left-4 top-4 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[10px] md:text-xs font-semibold text-[#054B35] shadow-sm backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                Menu Paling Populer
              </span>

              {popularMenu.rating && (
                <span className="inline-flex items-center gap-1 text-[10px] md:text-xs font-bold text-white bg-black/40 backdrop-blur px-2.5 py-1 rounded-full">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  {popularMenu.rating}
                </span>
              )}
            </div>

            <div className="absolute bottom-4 left-4 right-4 md:hidden">
              <h3 className="text-lg font-bold leading-tight text-white drop-shadow-sm">
                {popularMenu.name}
              </h3>

              <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-white/80">
                {popularMenu.description}
              </p>
            </div>
          </div>

          <div className="p-4 md:p-6 md:col-span-5 lg:col-span-4 flex flex-col justify-between space-y-4">
            <div className="hidden md:block">
              <h3 className="text-xl font-bold leading-tight text-[#09090B] group-hover:text-[#054B35] transition-colors">
                {popularMenu.name}
              </h3>

              <p className="mt-2 line-clamp-3 text-xs md:text-sm leading-relaxed text-[#71717A]">
                {popularMenu.description}
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#E4E4E7]/60 md:border-0">
              <div>
                <p className="text-[10px] md:text-xs font-medium uppercase tracking-wider text-[#71717A]">
                  Mulai dari
                </p>

                <p className="text-base md:text-xl font-bold text-[#09090B]">
                  Rp {popularMenu.price.toLocaleString("id-ID")}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-xl border border-[#E4E4E7] bg-[#F8F9FA] px-3.5 py-2 text-xs font-semibold text-[#3F3F46] group-hover:bg-white transition flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Detail
                </span>

                <div className="mt-2 sm:mt-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addItem(popularMenu);
                    }}
                    className="w-full rounded-xl bg-[#054B35] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-800 active:scale-95 transition-all"
                  >
                    + Tambah
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* JUDUL REKOMENDASI */}
        <div className="flex items-center justify-between pt-3 pb-1">
          <div>
            <h2 className="text-base md:text-lg font-bold text-[#09090B]">
              Menu Populer &amp; Rekomendasi
            </h2>

            <p className="text-xs text-[#71717A]">
              Paling digemari para pengunjung hari ini
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-100" />
            <span className="text-xs font-semibold text-amber-700">
              Top Picks
            </span>
          </div>
        </div>

        {/* LIST MENU GRID RESPONSIVE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMenuItems.map((menu) => {
            const qty = getQuantity(menu.id);
            const tags = getBadgeTags(menu);
            const isBroken = imgError[menu.id];

            return (
              <div
                key={menu.id}
                onClick={() => router.push(`/menu/${menu.id}`)}
                className="bg-white rounded-2xl p-3 md:p-4 border border-[#E4E4E7] shadow-sm flex flex-row sm:flex-col justify-between gap-3 items-stretch hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
              >
                <div className="relative w-24 h-24 sm:w-full sm:h-44 rounded-xl overflow-hidden flex-shrink-0 bg-[#F4F4F5] border border-[#E4E4E7] flex items-center justify-center group-hover:border-emerald-300 transition shadow-inner order-2 sm:order-1">
                  {!isBroken && menu.image ? (
                    <Image
                      src={menu.image}
                      alt={menu.name}
                      fill
                      sizes="(max-width: 640px) 96px, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={() =>
                        setImgError((prev) => ({
                          ...prev,
                          [menu.id]: true,
                        }))
                      }
                    />
                  ) : (
                    <div className="text-[#A1A1AA] flex flex-col items-center gap-1">
                      <Utensils className="w-5 h-5" />
                      <span className="text-[8px] md:text-xs">No Image</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between order-1 sm:order-2 sm:mt-1">
                  <div>
                    {/* TAG + RATING */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      {tags.map((tag: any, idx: number) => (
                        <span
                          key={idx}
                          className={
                            tag.isStar
                              ? "text-[9px] md:text-xs flex items-center gap-0.5 text-yellow-400 font-semibold"
                              : `text-[9px] md:text-[10px] px-2 py-0.5 rounded-md flex items-center gap-0.5 ${tag.bg} group-hover:scale-105 transition-transform`
                          }
                        >
                          {tag.isStar && (
                            <Star className="w-2.5 h-2.5 md:w-3 md:h-3 fill-yellow-400 text-yellow-400" />
                          )}

                          {tag.text}
                        </span>
                      ))}
                    </div>

                    <h3 className="text-xs md:text-sm font-semibold text-[#09090B] line-clamp-1 group-hover:text-[#054B35] transition">
                      {menu.name}
                    </h3>

                    <p className="text-[10px] md:text-xs text-[#71717A] line-clamp-2 mt-0.5 leading-relaxed">
                      {menu.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#E4E4E7]/40 sm:border-0 sm:pt-0">
                    <span className="text-sm md:text-base font-bold text-[#09090B]">
                      Rp {menu.price.toLocaleString("id-ID")}
                    </span>

                    {qty === 0 ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addItem(menu);
                        }}
                        className="border border-[#054B35] text-[#054B35] text-[11px] md:text-xs px-3.5 py-1.5 rounded-full hover:bg-emerald-50 hover:border-emerald-500 hover:shadow-sm transition font-medium"
                      >
                        + Tambah
                      </button>
                    ) : (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center border border-[#054B35] rounded-full px-1.5 py-0.5 bg-white gap-2"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantity(menu.id, qty - 1);
                          }}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[#3F3F46] hover:bg-stone-100 hover:text-[#054B35] transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>

                        <span className="text-xs font-semibold text-[#09090B] min-w-[12px] text-center">
                          {qty}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantity(menu.id, qty + 1);
                          }}
                          className="w-5 h-5 rounded-full bg-[#054B35] text-white flex items-center justify-center hover:bg-emerald-800 hover:scale-110 transition-all"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FLOATING CART */}
      {totalItemCount > 0 && (
        <div className="fixed bottom-[88px] md:bottom-[88px] left-0 right-0 px-4 md:px-6 lg:px-8 z-30 max-w-[460px] mx-auto pointer-events-none">
          <Link
            href="/keranjang"
            className="pointer-events-auto bg-[#054B35] text-white rounded-2xl p-4 md:p-5 pl-5 md:pl-6 shadow-xl flex items-center justify-between border border-emerald-900/40 max-w-full hover:bg-[#043d2b] transition-colors group cursor-pointer block"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="relative bg-white/10 p-2.5 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-white stroke-[1.8]" />

                  <span className="absolute -top-1.5 -right-1.5 bg-[#F59E0B] text-[#09090B] font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center border border-[#054B35]">
                    {totalItemCount}
                  </span>
                </div>

                <div>
                  <p className="text-[11px] md:text-xs text-emerald-100/90 font-normal">
                    {totalItemCount} Menu Dipilih
                  </p>

                  <p className="text-sm md:text-base font-bold tracking-tight">
                    Rp {(totals?.subtotal ?? 0).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              <div className="bg-white text-[#09090B] text-xs md:text-sm font-semibold px-4 py-2.5 rounded-xl group-hover:bg-stone-100 transition flex items-center gap-1.5 shadow-sm">
                <span>Lihat Keranjang</span>
                <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* FILTER MODAL */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-2xl sm:rounded-3xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-3">
              <h3 className="text-sm md:text-base font-bold text-[#09090B]">
                Urutkan &amp; Filter Menu
              </h3>

              <button
                onClick={() => setShowFilterModal(false)}
                className="w-7 h-7 rounded-full bg-[#F4F4F5] flex items-center justify-center text-[#71717A] hover:bg-stone-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-[#71717A] uppercase tracking-wider">
                Urutkan Berdasarkan
              </p>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "default", label: "Default" },
                  { id: "price-low", label: "Harga Termurah" },
                  { id: "price-high", label: "Harga Termahal" },
                  { id: "rating", label: "Rating / Populer" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSortBy(s.id)}
                    className={`px-3 py-2.5 rounded-xl text-xs md:text-sm text-left transition border ${
                      sortBy === s.id
                        ? "bg-[#054B35]/10 border-[#054B35] text-[#054B35] font-semibold"
                        : "bg-white border-[#E4E4E7] text-[#3F3F46] hover:bg-[#F4F4F5]"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <p className="text-xs font-bold text-[#71717A] uppercase tracking-wider">
                Filter Preferensi / Diet
              </p>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "all", label: "Semua Menu" },
                  { id: "halal", label: "100% Halal" },
                  { id: "vegetarian", label: "Vegetarian" },
                  { id: "bebas-kacang", label: "Bebas Kacang" },
                ].map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDietFilter(d.id)}
                    className={`px-3 py-2.5 rounded-xl text-xs md:text-sm text-left transition border ${
                      dietFilter === d.id
                        ? "bg-[#054B35]/10 border-[#054B35] text-[#054B35] font-semibold"
                        : "bg-white border-[#E4E4E7] text-[#3F3F46] hover:bg-[#F4F4F5]"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex gap-2">
              <button
                onClick={() => {
                  setSortBy("default");
                  setDietFilter("all");
                }}
                className="flex-1 py-2.5 rounded-xl border border-[#E4E4E7] text-xs font-bold text-[#3F3F46] hover:bg-[#F4F4F5] transition"
              >
                Reset
              </button>

              <button
                onClick={() => setShowFilterModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#054B35] text-white text-xs font-bold hover:bg-emerald-900 transition shadow-sm"
              >
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}