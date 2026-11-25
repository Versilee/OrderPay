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
      .select(
        `id, total, service_fee, tax, discount, promo_code, payment_status, order_items(id, name, price, quantity)`
      )
      .eq("id", orderId)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!order) return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    if (order.payment_status === "paid") {
      return NextResponse.json({ error: "Pesanan sudah dibayar." }, { status: 409 });
    }

    const itemDetails = (order.order_items ?? []).map((item) => ({
      id: String(item.id),
      name: String(item.name).slice(0, 50),
      price: Math.round(Number(item.price)),
      quantity: Number(item.quantity),
    }));

    let grossAmount = itemDetails.reduce(
      (sum, it) => sum + it.price * it.quantity,
      0
    );

    if (order.service_fee && Number(order.service_fee) > 0) {
      itemDetails.push({
        id: "sf_" + Date.now(),
        name: "Biaya Layanan",
        price: Math.round(Number(order.service_fee)),
        quantity: 1,
      });
      grossAmount += Math.round(Number(order.service_fee));
    }

    if (order.tax && Number(order.tax) > 0) {
      itemDetails.push({
        id: "tax_" + Date.now(),
        name: "Pajak",
        price: Math.round(Number(order.tax)),
        quantity: 1,
      });
      grossAmount += Math.round(Number(order.tax));
    }

    const origin = request.headers.get("origin") || "http://localhost:3000";
    const midtransOrderId = `${order.id}-T${Date.now().toString().slice(-6)}`;

    const transaction = await snap.createTransaction({
      transaction_details: { order_id: midtransOrderId, gross_amount: grossAmount },
      item_details: itemDetails,
      customer_details: {
        first_name:
          typeof body?.customerName === "string" ? body.customerName : "Customer OrderPay",
        email: typeof body?.customerEmail === "string" ? body.customerEmail : "customer@orderpay.local",
      },
      callbacks: {
        finish: `${origin}/status`,
      },
      expiry: { unit: "minutes", duration: 60 },
    });

    // Simpan midtransOrderId di promo_code secara presisi agar sync bisa menemukan semua percobaan
    try {
      let updatedPromo = `MIDTRANS:${midtransOrderId}`;
      if (order.promo_code) {
        if (order.promo_code.includes("MIDTRANS:")) {
          updatedPromo = `${order.promo_code},MIDTRANS:${midtransOrderId}`;
        } else {
          updatedPromo = `${order.promo_code}|MIDTRANS:${midtransOrderId}`;
        }
      }
      await supabase
        .from("orders")
        .update({ promo_code: updatedPromo })
        .eq("id", order.id);
    } catch (e) {
      console.warn("Gagal simpan midtransOrderId reference:", e);
    }

    return NextResponse.json({
      ok: true,
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
      midtransOrderId,
    });
  } catch (error) {
    console.error("Midtrans create error:", error);
    return NextResponse.json({ error: "Gagal membuat transaksi Midtrans." }, { status: 500 });
  }
}
