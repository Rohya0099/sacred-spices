import { getOrSetCsrfToken, csrfResponse } from "@/lib/security";

export async function GET() {
  const token = await getOrSetCsrfToken();
  return csrfResponse(token);
}
