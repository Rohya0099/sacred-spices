export async function csrfFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const tokenResponse = await fetch("/api/csrf", { credentials: "include" });
  const { csrfToken } = await tokenResponse.json();
  const headers = new Headers(init.headers);
  headers.set("x-csrf-token", csrfToken);
  if (!headers.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(input, {
    ...init,
    credentials: "include",
    headers
  });
}
