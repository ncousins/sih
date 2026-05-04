import crypto from "crypto";

const PAYSTACK_API = "https://api.paystack.co";
const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

export interface PaystackMetadata {
  name: string;
  documentId: string;
  documentTitle: string;
}

export interface InitializeResult {
  authorizationUrl: string;
  reference: string;
}

// ZAR amounts are in cents (kobo equivalent)
export function zarToKobo(zar: number): number {
  return Math.round(zar * 100);
}

export async function initializeTransaction({
  email,
  amountZAR,
  reference,
  callbackUrl,
  metadata,
}: {
  email: string;
  amountZAR: number;
  reference: string;
  callbackUrl: string;
  metadata: PaystackMetadata;
}): Promise<InitializeResult> {
  const res = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: zarToKobo(amountZAR),
      currency: "ZAR",
      reference,
      callback_url: callbackUrl,
      metadata: {
        name: metadata.name,
        document_id: metadata.documentId,
        document_title: metadata.documentTitle,
      },
    }),
  });

  const data = await res.json();
  if (!data.status) throw new Error(data.message ?? "Paystack init failed");

  return {
    authorizationUrl: data.data.authorization_url,
    reference: data.data.reference,
  };
}

export async function verifyTransaction(reference: string) {
  const res = await fetch(
    `${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${SECRET_KEY}` },
    }
  );

  const data = await res.json();
  if (!data.status) throw new Error(data.message ?? "Paystack verify failed");

  return data.data as {
    status: string; // "success" | "failed" | "abandoned"
    reference: string;
    amount: number; // in kobo
    currency: string;
    customer: { email: string };
    metadata: {
      name?: string;
      document_id?: string;
      document_title?: string;
    };
  };
}

export function verifyWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET || SECRET_KEY;
  const hash = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");
  return hash === signature;
}
