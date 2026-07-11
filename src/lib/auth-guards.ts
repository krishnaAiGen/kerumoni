import "server-only";
import { redirect } from "next/navigation";
import { auth } from "./auth";

/** Returns the session or redirects to login. Use in gated server code. */
export async function requireUser(nextPath?: string) {
  const session = await auth();
  if (!session?.user) {
    const q = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";
    redirect(`/login${q}`);
  }
  return session;
}

/** Returns the session or redirects. Throws-by-redirect unless role is ADMIN. */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/admin");
  if (session.user.role !== "ADMIN") redirect("/");
  return session;
}
