import crypto from "node:crypto";
import midtransClient from "midtrans-client";

const serverKey = process.env.MIDTRANS_SERVER_KEY;
const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

if (!serverKey) throw new Error("SB-Mid-server-c1~iFF0syrZV_8OrsEzUj4Y6");
if (!clientKey) throw new Error("Mid-client-cSRZt_9XRo_JFy37");

export const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey,
  clientKey,
});

export function isValidMidtransSignature(payload: {
  order_id?: unknown;
  status_code?: unknown;
  gross_amount?: unknown;
  signature_key?: unknown;
}) {
  if (
    typeof payload.order_id !== "string" ||
    typeof payload.status_code !== "string" ||
    typeof payload.gross_amount !== "string" ||
    typeof payload.signature_key !== "string"
  ) return false;

  const expected = crypto
    .createHash("sha512")
    .update(`${payload.order_id}${payload.status_code}${payload.gross_amount}${serverKey}`)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(payload.signature_key)
  );
}
