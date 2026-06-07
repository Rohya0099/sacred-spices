import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminConsole } from "@/components/admin-console";
import { getSessionUser } from "@/lib/auth";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Admin Dashboard",
  description: "Sacred Spices admin dashboard for protected product, order, and operations management.",
  path: "/admin",
  noIndex: true
});

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login?next=/admin");
  if (user.role !== "ADMIN") redirect("/");

  return <AdminConsole />;
}
