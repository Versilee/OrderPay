import { NextResponse } from "next/server";
import { snap } from "@/lib/midtrans";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      orderId?: unknown;
      customerName?: unknown;
      customerEmail?: unknown;
    } | null;

    const orderId = typeof body?.orderId === "string" ? body.orderId.trim() : "";
    if (!orderId) return NextResponse.json({ error: "orderId wajib diisi." }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { data: order, error } = await supabase
      .from("orders")
      .select("id,total,payment_status,order_items(id,name,price,quantity)")
      .eq("id", orderId)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!order) return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    if (order.payment_status === "paid") {
      return NextResponse.json({ error: "Pesanan sudah dibayar." }, { status: 409 });
    }

    const grossAmount = Math.round(Number(order.total));
    if (!Number.isFinite(grossAmount) || grossAmount <= 0) {
      return NextResponse.json({ error: "Total pesanan tidak valid." }, { status: 400 });
    }

    const itemDetails = (order.order_items ?? []).map((item) => ({
      id: String(item.id),
      name: String(item.name).slice(0, 50),
      price: Math.round(Number(item.price)),
      quantity: Number(item.quantity),
    }));

    const transaction = await snap.createTransaction({
      transaction_details: { order_id: order.id, gross_amount: grossAmount },
      item_details: itemDetails,
      customer_details: {
        first_name: typeof body?.customerName === "string" ? body.customerName : "Customer OrderPay",
        email: typeof body?.customerEmail === "string" ? body.customerEmail : "customer@orderpay.local",
      },
      expiry: { unit: "minutes", duration: 60 },
    });

    return NextResponse.json({ ok: true, token: transaction.token, redirectUrl: transaction.redirect_url });
  } catch (error) {
    console.error("Midtrans create error:", error);
    return NextResponse.json({ error: "Gagal membuat transaksi Midtrans." }, { status: 500 });
  }
}
