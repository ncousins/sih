"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function DataDeletionForm() {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setError("");

    const email = (
      (e.currentTarget.elements.namedItem("email") as HTMLInputElement).value
    ).toLowerCase().trim();

    try {
      const res = await fetch("/api/user/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to process request");

      setState("success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="bg-mint/10 border border-mint/30 rounded-lg p-4 text-sm text-slate">
        ✓ Your data has been deleted from our records.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input
        id="del-email"
        name="email"
        type="email"
        label="Email address"
        placeholder="jane@company.co.za"
        required
      />
      {state === "error" && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}
      <div>
        <Button type="submit" variant="ghost" size="sm" loading={state === "loading"}>
          Delete my data
        </Button>
      </div>
    </form>
  );
}
