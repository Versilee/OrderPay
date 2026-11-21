import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Endpoint dipindahkan ke /api/midtrans/create." },
    { status: 410 }
  );
}
