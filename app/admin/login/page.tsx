import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

async function loginAction(formData: FormData) {
  "use server";
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/admin/login?error=invalid");
  }

  redirect("/admin/dashboard");
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="font-heading font-bold text-2xl text-navy">
            BPESA<span className="text-orange"> SIH</span>
          </p>
          <p className="caption mt-1">Admin Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-8">
          <h1 className="heading-3 mb-6">Sign in</h1>

          <form action={loginAction} className="flex flex-col gap-4">
            <Input
              id="email"
              name="email"
              type="email"
              label="Email address"
              placeholder="admin@bpesa.org.za"
              required
              autoComplete="email"
            />
            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />

            <ErrorMessage searchParams={searchParams} />

            <Button type="submit" variant="primary" size="lg" className="mt-2 w-full">
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

async function ErrorMessage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  if (!error) return null;
  return (
    <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded px-3 py-2">
      Invalid email or password. Please try again.
    </p>
  );
}
