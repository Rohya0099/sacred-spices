import { cookies, headers } from "next/headers";
import { randomBytes, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

const CSRF_COOKIE = "sacred_csrf";
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

export function assertEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }
  return value;
}

export function sanitizeText(value: string, max = 2000) {
  return value.replace(/[<>]/g, "").trim().slice(0, max);
}

export function validateStrongPassword(password: string) {
  return (
    password.length >= 10 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

export async function getOrSetCsrfToken() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(CSRF_COOKIE)?.value;
  if (existing) return existing;
  const token = randomBytes(32).toString("hex");
  cookieStore.set(CSRF_COOKIE, token, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24
  });
  return token;
}

export async function verifyCsrf(request: Request) {
  const method = request.method.toUpperCase();
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) return;
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE)?.value;
  const headerToken = request.headers.get("x-csrf-token");
  if (!cookieToken || !headerToken) {
    throw new Response("CSRF token missing.", { status: 403, statusText: "CSRF token missing" });
  }

  const cookieBuffer = Buffer.from(cookieToken);
  const headerBuffer = Buffer.from(headerToken);
  if (cookieBuffer.length !== headerBuffer.length || !timingSafeEqual(cookieBuffer, headerBuffer)) {
    throw new Response("CSRF token invalid.", { status: 403, statusText: "CSRF token invalid" });
  }
}

export async function rateLimit(bucket: string, limit: number, windowMs: number) {
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || headerStore.get("x-real-ip") || "local";
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const current = rateBuckets.get(key);

  if (!current || current.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (current.count >= limit) {
    throw new Response("Too many requests. Please wait a moment.", {
      status: 429,
      statusText: "Too many requests"
    });
  }

  current.count += 1;
}

export function csrfResponse(token: string) {
  return NextResponse.json({ csrfToken: token });
}
