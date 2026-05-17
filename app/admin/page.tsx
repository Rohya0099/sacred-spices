import { redirect } from "next/navigation";
import { PageShell } from "@/components/brand-shell";
import { AdminConsole } from "@/components/admin-console";
import { getSessionUser } from "@/lib/auth";

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login?next=/admin");
  if (user.role !== "ADMIN") redirect("/");

  return (
    <PageShell>
      <AdminConsole />
    </PageShell>
  );
}
