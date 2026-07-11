import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = { title: "Create account · Kerumoni" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <AuthForm mode="register" next={next || "/"} />;
}
