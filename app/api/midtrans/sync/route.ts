import { NextResponse } from "next/server";
import { snap } from "@/lib/midtrans";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as { orderId?: unknown } | null;
    const orderId = typeof body?.orderId === "string" ? body.orderId.trim() : "";

    if (!orderId) {
      return NextResponse.json({ error: "orderId wajib diisi." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: order, error } = await supabase
      .from("orders")
      .select("id, payment_status")
      .eq("id", orderId)
      .maybeSingle();

    if (error || !order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    }

    if (order.payment_status === "paid") {
      return NextResponse.json({ ok: true, paymentStatus: "paid" });
    }

    const statusResponse = await snap.transaction.notification(orderId).catch(async () => {
      // Fallback via direct fetch if notification method isn't available
      const serverKey = process.env.MIDTRANS_SERVER_KEY;
      if (!serverKey) return null;
      const auth = Buffer.from(`${serverKey}:`).toString("base64");
      const res = await fetch(`https://api.sandbox.midtrans.com/v2/${orderId}/status`, {
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: "application/json",
        },
      });
      if (!res.ok) return null;
      return res.json();
    });

    const transactionStatus = String(statusResponse?.transaction_status ?? "");
    const fraudStatus = String(statusResponse?.fraud_status ?? "");

    const isPaid =
      transactionStatus === "settlement" ||
      (transactionStatus === "capture" && fraudStatus !== "deny");

    if (isPaid) {
      const updateData = {
        payment_status: "paid",
        kitchen_status: "received",
        paid_at: statusResponse?.settlement_time ?? new Date().toISOString(),
      };

      await supabase.from("orders").update(updateData).eq("id", orderId);
      return NextResponse.json({ ok: true, paymentStatus: "paid", updated: true });
    }

    return NextResponse.json({ ok: true, paymentStatus: "unpaid", transactionStatus });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: "Gagal menyelaraskan status pembayaran." }, { status: 500 });
  }
}
