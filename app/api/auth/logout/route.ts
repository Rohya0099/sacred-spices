import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";
import { verifyCsrf } from "@/lib/security";

export async function POST(request: Request) {
  await verifyCsrf(request);
  await clearSessionCookie();
  return NextResponse.json({ status: "signed-out" });
}
