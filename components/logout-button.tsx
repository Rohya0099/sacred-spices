"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { csrfFetch } from "@/lib/client-security";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await csrfFetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      className="inline-flex items-center gap-2 text-sm font-medium text-ivory/82 transition hover:text-saffron"
    >
      <LogOut size={15} />
      Logout
    </button>
  );
}
