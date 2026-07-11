import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Edge-safe auth middleware using the trimmed config (no Prisma/bcrypt).
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: ["/account/:path*", "/checkout/:path*", "/admin/:path*"],
};
