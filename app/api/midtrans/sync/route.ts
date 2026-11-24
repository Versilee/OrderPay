import { NextResponse } from "next/server";
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
      .select("id, payment_status, promo_code")
      .eq("id", orderId)
      .maybeSingle();

    if (error || !order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    }

    if (order.payment_status === "paid") {
      return NextResponse.json({ ok: true, paymentStatus: "paid" });
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      return NextResponse.json({ ok: true, paymentStatus: "unpaid" });
    }

    const auth = Buffer.from(`${serverKey}:`).toString("base64");

    // Dapatkan ID yang mungkin digunakan saat pendaftaran Midtrans
    const candidateIds: string[] = [];
    
    if (order.promo_code && order.promo_code.startsWith("MIDTRANS:")) {
      candidateIds.push(order.promo_code.replace("MIDTRANS:", ""));
    }
    
    candidateIds.push(orderId);

    let isPaid = false;
    let settlementTime: string | undefined = undefined;

    for (const idToCheck of candidateIds) {
      try {
        const res = await fetch(`https://api.sandbox.midtrans.com/v2/${idToCheck}/status`, {
          headers: {
            Authorization: `Basic ${auth}`,
            Accept: "application/json",
          },
        });

        if (res.ok) {
          const data = (await res.json()) as Record<string, unknown>;
          const status = String(data.transaction_status ?? "");
          const fraud = String(data.fraud_status ?? "");

          if (status === "settlement" || (status === "capture" && fraud !== "deny")) {
            isPaid = true;
            settlementTime = String(data.settlement_time ?? new Date().toISOString());
            break;
          }
        }
      } catch (e) {
        console.warn(`Gagal cek status Midtrans untuk ID ${idToCheck}:`, e);
      }
    }

    if (isPaid) {
      const updateData = {
        payment_status: "paid",
        kitchen_status: "received",
        paid_at: settlementTime ?? new Date().toISOString(),
      };

      await supabase.from("orders").update(updateData).eq("id", orderId);
      return NextResponse.json({ ok: true, paymentStatus: "paid", updated: true });
    }

    return NextResponse.json({ ok: true, paymentStatus: "unpaid" });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: "Gagal menyelaraskan status pembayaran." }, { status: 500 });
  }
}
