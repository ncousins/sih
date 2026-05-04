import type { Metadata } from "next";
import DataDeletionForm from "@/components/ui/DataDeletionForm";

export const metadata: Metadata = {
  title: "Privacy Policy — BPESA Skills Intelligence Hub",
};

const sections = [
  {
    heading: "1. Who we are",
    body: `BPESA (Business Process Enabling South Africa) operates the Skills Intelligence Hub (SIH) at this website. We are the responsible party for personal information collected through this platform, as defined under the Protection of Personal Information Act 4 of 2013 (POPIA).`,
  },
  {
    heading: "2. What information we collect",
    body: `When you download a document, we collect your full name and email address. When you make a payment, we additionally collect transaction references processed via Paystack. We do not store payment card details — these are handled solely by Paystack.`,
  },
  {
    heading: "3. Why we collect it",
    body: `We collect your personal information to: deliver requested documents via email; record download activity for reporting purposes; verify member access where applicable; process payments for premium content.`,
  },
  {
    heading: "4. How we store and protect it",
    body: `Your data is stored in a secured Supabase (PostgreSQL) database hosted in a data centre with industry-standard security controls. Access is restricted to authorised personnel only. Download links are time-limited (24 hours) and delivered via Resend.`,
  },
  {
    heading: "5. Sharing of information",
    body: `We share your email address with Resend (our email delivery provider) solely to send you download links. We share transaction references with Paystack to verify payments. We do not sell or share your personal information with any other third parties.`,
  },
  {
    heading: "6. Retention",
    body: `We retain your personal information for as long as necessary to fulfil the purposes described above, or as required by law. You may request deletion of your data at any time using the form below.`,
  },
  {
    heading: "7. Your rights (POPIA)",
    body: `Under POPIA you have the right to: access the personal information we hold about you; request correction of inaccurate information; request deletion of your information; object to the processing of your information; lodge a complaint with the Information Regulator of South Africa.`,
  },
  {
    heading: "8. Contact",
    body: `For any privacy-related queries or to exercise your rights, contact us at: privacy@bpesa.org.za`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="container py-12 max-w-3xl">
      <h1 className="heading-1 mb-2">Privacy Policy</h1>
      <p className="caption mb-10">
        Last updated: May 2026 · Aligned with POPIA (Protection of Personal Information Act 4 of 2013)
      </p>

      <div className="flex flex-col gap-8">
        {sections.map((s) => (
          <section key={s.heading}>
            <h2 className="heading-3 mb-2">{s.heading}</h2>
            <p className="text-sm text-slate leading-relaxed">{s.body}</p>
          </section>
        ))}
      </div>

      {/* Data deletion */}
      <div className="mt-14 bg-white rounded-xl border border-border shadow-sm p-6">
        <h2 className="heading-3 mb-2">Request data deletion</h2>
        <p className="text-sm text-slate mb-5">
          Enter your email address below and we will permanently delete your name,
          email, and download history from our records.
        </p>
        <DataDeletionForm />
      </div>
    </div>
  );
}
