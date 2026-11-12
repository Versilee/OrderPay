"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Star,
  Plus,
  Minus,
  RefreshCw,
  UtensilsCrossed,
  ShoppingBag,
  Clock,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useSession } from "@/context/SessionContext";
import { useMenuItem } from "@/lib/menu-store";

export default function DetailMenuPage() {
  const params = useParams();
  const router = useRouter();
  const menuId = params?.menuId ? String(params.menuId) : "";

  const { item: menu, loading } = useMenuItem(menuId);
  const { addItem } = useCart();
  const { tableNumber, mode } = useSession();
  const [quantity, setQuantity] = useState<number>(1);
  const [customNote, setCustomNote] = useState<string>("");

  const placeLabel = mode === "dine-in" ? `Meja ${tableNumber}` : "Takeaway";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A18]">
        <div className="max-w-md mx-auto min-h-screen bg-white p-8 text-center text-xs text-stone-500">
          Memuat menu...
        </div>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A18]">
        <div className="max-w-md mx-auto min-h-screen bg-white p-8 flex flex-col items-center text-center">
          <p className="mt-24 text-sm font-medium text-slate-800">Menu tidak ditemukan</p>
          <p className="mt-1 text-xs text-stone-500">
            Menu ini mungkin sudah tidak tersedia.
          </p>
          <button
            type="button"
            onClick={() => router.push("/menu")}
            className="mt-4 rounded-xl bg-[#054B35] px-5 py-2.5 text-sm text-white hover:bg-emerald-900 transition"
          >
            Kembali ke Menu
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(menu, quantity, customNote);
    router.push("/menu");
  };

  const estimatedTotal = menu.price * quantity;
  const hasDiscount = !!menu.originalPrice && menu.originalPrice > menu.price;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A18] font-sans">
      <div className="max-w-2xl mx-auto lg:max-w-5xl relative bg-white min-h-screen shadow-sm pb-24">
        {/* TOP BAR / HEADER */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center border border-stone-200/60 shadow-sm text-slate-800 hover:bg-white transition"
          >
            <ArrowLeft className="w-5 h-5 stroke-[1.8]" />
          </button>

          <div className="flex items-center gap-2">
            <span className="bg-white/90 backdrop-blur-md text-[#3F3F46] text-xs px-3 py-1.5 rounded-full font-normal border border-stone-200/60 shadow-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#054B35]"></span>
              {placeLabel}
            </span>
          </div>
        </div>

        {/* GAMBAR MENU */}
        <div className="relative w-full h-72 bg-stone-100">
          {menu.image ? (
            <Image
              src={menu.image}
              alt={menu.name}
              fill
              priority
              sizes="(max-width: 448px) 100vw, 448px"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-stone-400">
              <UtensilsCrossed className="w-8 h-8 stroke-[1.5]" />
              <span className="text-[11px]">Belum ada foto</span>
            </div>
          )}

          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between z-10">
            {menu.rating ? (
              <div className="bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-normal flex items-center gap-1.5 border border-white/20">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{menu.rating}</span>
                {menu.reviewCount ? (
                  <span className="text-stone-300 font-light">({menu.reviewCount} ulasan)</span>
                ) : null}
              </div>
            ) : (
              <span />
            )}

            {menu.prepTime && (
              <div className="bg-white/90 backdrop-blur-md text-slate-800 px-3 py-1 rounded-full text-xs font-normal flex items-center gap-1 border border-stone-200/60 shadow-sm">
                <Clock className="w-3.5 h-3.5 text-stone-500 stroke-[1.8]" />
                <span>{menu.prepTime}</span>
              </div>
            )}
          </div>
        </div>

        {/* CONTAINER UTAMA SEMUA KARTU */}
        <div className="p-4 space-y-4">
          {/* KARTU 1: DETAIL INFORMASI MENU */}
          <div className="bg-white rounded-2xl p-4 border border-[#E4E4E7] shadow-sm space-y-2">
            {menu.tag && (
              <span className="inline-block text-[10px] font-normal uppercase tracking-wider bg-stone-100 text-stone-600 px-2.5 py-1 rounded-md">
                {menu.tag}
              </span>
            )}
            <h1 className="text-xl font-normal text-[#09090B] tracking-tight leading-snug">
              {menu.name}
            </h1>

            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-lg font-normal text-[#09090B]">
                Rp {menu.price.toLocaleString("id-ID")}
              </span>
              {hasDiscount && (
                <span className="text-xs text-stone-400 line-through font-light">
                  Rp {menu.originalPrice!.toLocaleString("id-ID")}
                </span>
              )}
            </div>

            <p className="text-xs text-stone-600 font-light leading-relaxed pt-1">
              {menu.description}
            </p>
          </div>

          {/* KARTU 2: PREFERENSI SAJIAN / CATATAN PESANAN */}
          <div className="bg-white rounded-2xl p-4 border border-[#E4E4E7] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-normal text-[#09090B]">
                  Preferensi Sajian
                </h2>
                <p className="text-[11px] text-stone-500 font-light mt-0.5">
                  Tambahkan catatan khusus untuk penyajian pesanan ini
                </p>
              </div>
              <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded font-light">
                Opsional
              </span>
            </div>

            <textarea
              rows={2}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Tulis catatan khusus (Contoh: Tanpa bawang, pedas sedang, es dikurangi, dll)..."
              className="w-full bg-stone-50 border border-[#E4E4E7] rounded-xl p-3 text-xs text-slate-900 placeholder-stone-400 focus:outline-none focus:border-[#054B35] focus:bg-white transition resize-none font-light"
            />
          </div>

          {/* KARTU 3: RINGKASAN & TOMBOL TAMBAH KE PESANAN */}
          <div className="bg-white rounded-2xl p-4 border border-[#E4E4E7] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <p className="text-[10px] text-stone-500 uppercase tracking-wider font-medium">
                  ESTIMASI TOTAL
                </p>
                <p className="text-lg font-bold text-[#09090B]">
                  Rp {estimatedTotal.toLocaleString("id-ID")}
                </p>
              </div>

              {/* Kontrol Jumlah / Quantity */}
              <div className="flex items-center border border-stone-200 rounded-full px-2 py-1 bg-stone-50 gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-stone-700 hover:bg-stone-200 transition"
                >
                  <Minus className="w-4 h-4 stroke-[2]" />
                </button>
                <span className="text-sm font-semibold text-slate-900 min-w-[16px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-7 h-7 rounded-full bg-[#054B35] text-white flex items-center justify-center hover:bg-emerald-900 transition"
                >
                  <Plus className="w-4 h-4 stroke-[2]" />
                </button>
              </div>
            </div>

            {/* Tombol Tambah ke Pesanan */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full bg-[#054B35] text-[#FFFFFF] font-medium py-3.5 px-4 rounded-xl hover:bg-emerald-900 transition shadow-md flex items-center justify-between text-sm active:scale-[0.99]"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 stroke-[2]" />
                <span>Tambah ke Pesanan</span>
              </div>
              <span className="font-semibold">
                Rp {estimatedTotal.toLocaleString("id-ID")}
              </span>
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-500 font-light pt-0.5">
              <RefreshCw className="w-3 h-3 text-[#054B35] stroke-[1.8]" />
              <span>Langsung terhubung dengan sistem kasir {placeLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}