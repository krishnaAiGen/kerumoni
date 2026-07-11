import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = { title: "Sign in · Kerumoni" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <AuthForm mode="login" next={next || "/"} />;
}
