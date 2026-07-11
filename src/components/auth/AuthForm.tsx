"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { registerUser } from "@/actions/auth.actions";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { GoogleButton } from "./GoogleButton";
import { Logo } from "@/components/layout/Logo";

export function AuthForm({ mode, next }: { mode: "login" | "register"; next: string }) {
  const router = useRouter();
  const isRegister = mode === "register";
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "");
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    startTransition(async () => {
      if (isRegister) {
        const res = await registerUser({ name, email, password });
        if (!res.ok) {
          setError(res.error ?? "Could not create account");
          return;
        }
      }
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (signInRes?.error) {
        setError("Invalid email or password.");
        return;
      }
      router.push(next);
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-line bg-paper/70 p-8">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <h1 className="text-center font-serif text-3xl font-semibold text-ink">
          {isRegister ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-1 text-center text-sm text-ink2">
          {isRegister
            ? "Join to order and track your pickles."
            : "Sign in to continue your order."}
        </p>

        <div className="mt-6">
          <GoogleButton next={next} />
        </div>

        <div className="my-5 flex items-center gap-3 text-xs text-ink2">
          <span className="h-px flex-1 bg-line" />
          or
          <span className="h-px flex-1 bg-line" />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <Label>Full name</Label>
              <Input name="name" placeholder="Priya Sharma" required />
            </div>
          )}
          <div>
            <Label>Email</Label>
            <Input name="email" type="email" placeholder="you@email.com" required />
          </div>
          <div>
            <Label>Password</Label>
            <Input name="password" type="password" placeholder="••••••" required minLength={6} />
          </div>

          <FieldError>{error}</FieldError>

          <Button type="submit" className="w-full" loading={pending}>
            {pending
              ? isRegister
                ? "Creating account…"
                : "Signing in…"
              : isRegister
                ? "Create account"
                : "Sign in"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-ink2">
          {isRegister ? (
            <>
              Already have an account?{" "}
              <Link
                href={`/login?next=${encodeURIComponent(next)}`}
                className="text-terra-d hover:underline"
              >
                Sign in
              </Link>
            </>
          ) : (
            <>
              New here?{" "}
              <Link
                href={`/register?next=${encodeURIComponent(next)}`}
                className="text-terra-d hover:underline"
              >
                Create account
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
