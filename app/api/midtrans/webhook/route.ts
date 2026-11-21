import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isValidMidtransSignature } from "@/lib/midtrans";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!payload || !isValidMidtransSignature(payload)) {
      return NextResponse.json({ error: "Signature tidak valid." }, { status: 401 });
    }

    const orderId = String(payload.order_id);
    const transactionStatus = String(payload.transaction_status ?? "");
    const fraudStatus = String(payload.fraud_status ?? "");
    const paid = transactionStatus === "settlement" ||
      (transactionStatus === "capture" && fraudStatus !== "deny");

    const supabase = getSupabaseAdmin();
    const update: Record<string, unknown> = {
      payment_status: paid ? "paid" : "unpaid",
      kitchen_status: paid ? "received" : "waiting_payment",
    };

    if (paid) update.paid_at = payload.settlement_time ?? new Date().toISOString();

    const { error } = await supabase.from("orders").update(update).eq("id", orderId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Midtrans webhook error:", error);
    return NextResponse.json({ error: "Webhook gagal diproses." }, { status: 500 });
  }
}
