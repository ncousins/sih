import AdminNav from "@/components/ui/AdminNav";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex" style={{ background: "var(--color-surface)" }}>
      <AdminNav />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
