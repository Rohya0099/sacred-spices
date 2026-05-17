import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export function handleApiError(error: unknown) {
  if (error instanceof Response) {
    return NextResponse.json({ error: error.statusText || "Request failed" }, { status: error.status });
  }

  if (error instanceof Error && error.message.endsWith("is not configured.")) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return NextResponse.json({ error: "Database request failed.", code: error.code }, { status: 400 });
  }

  console.error(error);
  return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
}

export function money(value: { toString: () => string } | number | string) {
  return Number(value.toString());
}

export function parseList(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value.map((item) => item.trim()).filter(Boolean);
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
