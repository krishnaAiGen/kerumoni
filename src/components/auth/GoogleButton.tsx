"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";

export function GoogleButton({ next }: { next: string }) {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      type="button"
      variant="secondary"
      className="w-full"
      loading={loading}
      onClick={() => {
        setLoading(true);
        signIn("google", { callbackUrl: next });
      }}
    >
      {loading ? (
        <span>Connecting…</span>
      ) : (
        <>
          <span className="font-bold">
            <span style={{ color: "#4285F4" }}>G</span>
            <span style={{ color: "#EA4335" }}>o</span>
            <span style={{ color: "#FBBC05" }}>o</span>
            <span style={{ color: "#4285F4" }}>g</span>
            <span style={{ color: "#34A853" }}>l</span>
            <span style={{ color: "#EA4335" }}>e</span>
          </span>
          <span className="ml-1">Continue with Google</span>
        </>
      )}
    </Button>
  );
}
