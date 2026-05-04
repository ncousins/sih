"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface DownloadFormProps {
  documentId: string;
  isPaid: boolean;
  price?: number | null;
}

type State = "idle" | "loading" | "success" | "error" | "redirecting";

export default function DownloadForm({ documentId, isPaid, price }: DownloadFormProps) {
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setErrorMsg("");

    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;

    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, documentId }),
      });

      const data = await res.json();

      if (res.status === 402) {
        setState("redirecting");
        const initRes = await fetch("/api/paystack/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, documentId }),
        });

        const initData = await initRes.json();
        if (!initRes.ok) throw new Error(initData.error ?? "Failed to start payment");

        window.location.href = initData.authorizationUrl;
        return;
      }

      if (!res.ok) throw new Error(data.error ?? "Something went wrong");

      setState("success");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="bg-mint/10 border border-mint/30 rounded-lg p-6 text-center">
        <p className="text-2xl mb-2">✅</p>
        <p className="heading-3 mb-1">Check your email</p>
        <p className="text-sm text-slate">
          We&apos;ve sent a download link to your inbox. It expires in 24 hours.
        </p>
      </div>
    );
  }

  if (state === "redirecting") {
    return (
      <div className="bg-navy/5 border border-navy/10 rounded-lg p-6 text-center">
        <p className="text-2xl mb-2">💳</p>
        <p className="heading-3 mb-1">Redirecting to payment…</p>
        <p className="text-sm text-slate">Taking you to Paystack to complete your purchase.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        id="name"
        name="name"
        label="Full name"
        placeholder="Jane Smith"
        required
        autoComplete="name"
      />
      <Input
        id="email"
        name="email"
        type="email"
        label="Email address"
        placeholder="jane@company.co.za"
        required
        autoComplete="email"
      />

      {isPaid && price != null && (
        <div className="bg-orange/5 border border-orange/20 rounded p-3 text-sm text-slate">
          <span className="font-semibold text-navy">R{Number(price).toFixed(0)}</span>
          {" "}· BPESA members get free access — enter your email to check.
        </div>
      )}

      {/* POPIA consent */}
      <label className="flex items-start gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          name="popia_consent"
          required
          className="mt-0.5 w-4 h-4 shrink-0 accent-orange"
        />
        <span className="text-xs text-slate/70 leading-relaxed">
          I consent to BPESA collecting and storing my personal information to
          process this request, in accordance with our{" "}
          <Link
            href="/privacy"
            target="_blank"
            className="text-navy underline hover:text-orange transition-colors"
          >
            Privacy Policy
          </Link>
          . You may request deletion of your data at any time.
        </span>
      </label>

      {state === "error" && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded px-3 py-2">
          {errorMsg}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={state === "loading"}
        className="w-full"
      >
        {isPaid
          ? `Pay R${price != null ? Number(price).toFixed(0) : "—"} or check member access`
          : "Get free download"}
      </Button>
    </form>
  );
}
