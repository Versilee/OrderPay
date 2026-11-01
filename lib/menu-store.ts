"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import type { MenuItem } from "@/lib/types";
import { MENU_ITEMS } from "@/lib/mock-data";

interface MenuRow {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price: number | null;
  image_url: string | null;
  category: MenuItem["category"];
  tag: string | null;
  rating: number | null;
  review_count: number;
  prep_time: string | null;
  is_popular: boolean;
  options_title: string | null;
  options: string[] | string | null;
}

function mapMenu(row: MenuRow): MenuItem {
  let parseOptions: string[] | undefined = undefined;

  if (Array.isArray(row.options)) {
    parseOptions = row.options;
  } else if (typeof row.options === "string") {
    try {
      const parsed = JSON.parse(row.options);
      if (Array.isArray(parsed)) {
        parseOptions = parsed;
      }
    } catch {
      parseOptions = undefined;
    }
  }

  const mockItem = MENU_ITEMS.find((item) => item.id === row.id);

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    originalPrice: row.original_price ?? undefined,
    image: row.image_url ?? "",
    category: row.category,
    tag: row.tag ?? undefined,
    rating: row.rating ?? undefined,
    reviewCount: row.review_count,
    prepTime: row.prep_time ?? undefined,
    isPopular: row.is_popular,
    optionsTitle: row.options_title ?? mockItem?.optionsTitle ?? undefined,
    options: parseOptions ?? mockItem?.options ?? undefined,
  };
}

export function useMenuItems() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getSupabase()
      .from("menu_items")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })
      .then(({ data, error: queryError }) => {
        if (cancelled) return;
        if (queryError) {
          setError(queryError.message);
        } else {
          setItems(((data ?? []) as MenuRow[]).map(mapMenu));
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { items, loading, error };
}

export function useMenuItem(id: string) {
  const { items, loading, error } = useMenuItems();
  return { item: items.find((m) => m.id === id), loading, error };
}