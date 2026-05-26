"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import { csrfFetch } from "@/lib/client-security";

type AuthFormProps = {
  role?: "CUSTOMER" | "ADMIN";
  passwordResetAvailable?: boolean;
};

export function AuthForm({ role = "CUSTOMER", passwordResetAvailable = false }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const isAdmin = role === "ADMIN";
  const showDemoCredentials = process.env.NODE_ENV !== "production";

  function redirectTarget(userRole: "CUSTOMER" | "ADMIN") {
    const next = searchParams.get("next");
    if (next?.startsWith("/") && !next.startsWith("//")) return next;
    if (userRole === "ADMIN") return "/admin";
    return mode === "register" ? "/" : "/checkout";
  }

  async function submit(formData: FormData) {
    setLoading(true);
    setMessage(null);
    const payload = {
      ...Object.fromEntries(formData.entries()),
      ...(mode === "login" ? { expectedRole: role } : {})
    };
    const response = await csrfFetch(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    const json = await response.json();
    setLoading(false);

    if (!response.ok) {
      if (json.error === "This account cannot sign in here." && !isAdmin) {
        setMessage("This is an admin account. Please use the admin login page.");
      } else {
        setMessage(json.error ?? "Something went wrong.");
      }
      return;
    }

    router.push(redirectTarget(json.user.role));
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-lg rounded-lg border border-turmeric/16 bg-charcoal p-6 shadow-glow">
      {isAdmin ? (
        <div className="rounded-lg border border-saffron/20 bg-obsidian p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-saffron">Admin Login</p>
          <p className="mt-2 text-sm leading-6 text-ivory/60">Protected access for Sacred Spices operators.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-2 rounded-full border border-turmeric/16 p-1">
          {(["login", "register"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                mode === item ? "bg-saffron text-obsidian" : "text-ivory/64 hover:text-saffron"
              }`}
            >
              {item === "login" ? "Login" : "Register"}
            </button>
          ))}
          </div>
          {mode === "register" ? (
            <p className="rounded-lg border border-turmeric/12 bg-obsidian p-3 text-sm leading-6 text-ivory/62">
              Create a customer account with your email. Name and phone are optional and can be added later.
            </p>
          ) : (
            <p className="rounded-lg border border-turmeric/12 bg-obsidian p-3 text-sm leading-6 text-ivory/62">
              Login to continue your Sacred Spices journey.
            </p>
          )}
        </div>
      )}
      <form action={submit} className="mt-6 grid gap-4">
        {!isAdmin && mode === "register" ? <Field name="name" label="Name" autoComplete="name" /> : null}
        <Field name="email" label="Email" type="email" autoComplete="email" required />
        <Field name="password" label="Password" type="password" autoComplete={mode === "login" || isAdmin ? "current-password" : "new-password"} required />
        {!isAdmin && mode === "register" ? <Field name="confirmPassword" label="Confirm password" type="password" required /> : null}
        {!isAdmin && mode === "register" ? <Field name="phone" label="Phone" type="tel" autoComplete="tel" /> : null}
        {message ? <p className="rounded-lg border border-rose/30 bg-rose/10 p-3 text-sm text-ivory">{message}</p> : null}
        <button
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-saffron px-6 py-4 font-semibold text-obsidian transition hover:bg-turmeric disabled:cursor-wait disabled:opacity-70"
        >
          {mode === "login" || isAdmin ? <LogIn size={18} /> : <UserPlus size={18} />}
          {loading ? "Please wait..." : isAdmin ? "Enter admin dashboard" : mode === "login" ? "Login" : "Create account"}
        </button>
      </form>
      {(mode === "login" || isAdmin) && passwordResetAvailable ? (
        <Link href="/forgot-password" className="mt-4 inline-flex text-sm font-semibold text-saffron hover:text-turmeric">
          Forgot password?
        </Link>
      ) : null}
      {showDemoCredentials ? (
        <p className="mt-5 text-xs text-ivory/40">
  Secure login. Contact support if needed.
</p>
      ) : null}
    </div>
  );
}

function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const [visible, setVisible] = useState(false);
  const isPassword = props.type === "password";

  return (
    <label className="grid gap-2 text-sm text-ivory/72">
      {label}
      <span className="relative">
        <input
          {...props}
          type={isPassword && visible ? "text" : props.type}
          className="w-full rounded-lg border border-turmeric/16 bg-obsidian px-4 py-3 pr-12 text-ivory outline-none transition focus:border-saffron"
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-ivory/58 transition hover:bg-ivory/8 hover:text-saffron"
            aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          >
            {visible ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        ) : null}
      </span>
    </label>
  );
}
