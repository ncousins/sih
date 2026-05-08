import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function saveSetting(formData: FormData) {
  "use server";
  const key = formData.get("key") as string;
  const value = (formData.get("value") as string).trim();
  const supabase = createAdminClient();
  await supabase
    .from("site_settings")
    .update({ value, updated_at: new Date().toISOString() })
    .eq("key", key);
  revalidatePath("/admin/settings");
}

export default async function SettingsPage() {
  const supabase = createAdminClient();
  const { data: settings } = await supabase
    .from("site_settings")
    .select("key, label, value")
    .order("key");

  const get = (key: string) => settings?.find((s) => s.key === key)?.value ?? "";

  return (
    <div className="max-w-2xl">
      <h1 className="heading-1 mb-8">Settings</h1>

      {/* Email section */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
        <h2 className="heading-3 mb-1">Email</h2>
        <p className="text-sm text-slate/60 mb-6">
          Sender details used on all outgoing emails (download links, payment receipts).
          The address domain must be verified in your{" "}
          <a href="https://resend.com/domains" target="_blank" rel="noreferrer"
            className="text-navy underline underline-offset-2 hover:text-orange transition-colors">
            Resend account
          </a>{" "}
          before emails will deliver.
        </p>

        <div className="flex flex-col gap-4">
          <SettingField
            action={saveSetting}
            settingKey="email_from_name"
            label="Sender name"
            value={get("email_from_name")}
            placeholder="BPESA SIH"
          />
          <SettingField
            action={saveSetting}
            settingKey="email_from_address"
            label="Sender address"
            value={get("email_from_address")}
            placeholder="noreply@yourdomain.com"
            type="email"
          />
        </div>
      </div>
    </div>
  );
}

function SettingField({
  action,
  settingKey,
  label,
  value,
  placeholder,
  type = "text",
}: {
  action: (fd: FormData) => Promise<void>;
  settingKey: string;
  label: string;
  value: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-1.5">
      <input type="hidden" name="key" value={settingKey} />
      <label className="text-sm font-heading font-semibold text-navy">{label}</label>
      <div className="flex gap-2">
        <input
          name="value"
          type={type}
          defaultValue={value}
          placeholder={placeholder}
          required
          className="flex-1 rounded border border-border bg-white px-3 py-2.5 text-sm text-slate outline-none focus:border-navy focus:ring-2 focus:ring-navy/20 transition"
        />
        <button
          type="submit"
          className="shrink-0 text-sm font-heading font-semibold px-4 py-2.5 rounded bg-navy text-white hover:bg-navy/90 transition-colors cursor-pointer"
        >
          Save
        </button>
      </div>
    </form>
  );
}
