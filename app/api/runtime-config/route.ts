import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      apiBaseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api",
      email: process.env.NEXT_PUBLIC_API_EMAIL ?? "admin@ocp.ma",
      password: process.env.NEXT_PUBLIC_API_PASSWORD ?? "admin123",
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
