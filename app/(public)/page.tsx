import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

const features = [
  {
    title: "Skills Reports",
    description:
      "Access curated reports on workforce trends, skill gaps, and sector insights across the GBS industry.",
    icon: "📊",
  },
  {
    title: "Industry Events",
    description:
      "Stay informed about upcoming BPESA events, conferences, and professional development opportunities.",
    icon: "📅",
  },
  {
    title: "Member Benefits",
    description:
      "BPESA members unlock exclusive access to premium documents and in-depth intelligence reports.",
    icon: "🔓",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white py-20 md:py-28">
        <div className="container text-center max-w-3xl mx-auto">
          <p className="caption text-mint uppercase tracking-widest mb-4 font-semibold">
            BPESA Skills Intelligence Hub
          </p>
          <h1
            className="font-heading font-bold text-4xl md:text-5xl leading-tight mb-6"
            style={{ color: "white" }}
          >
            Sector intelligence for the{" "}
            <span className="text-orange">GBS industry</span>
          </h1>
          <p className="text-white/70 text-lg mb-10 leading-relaxed">
            Access skills insights, research reports, and labour market data
            that drive smarter decisions across South Africa&apos;s business
            process services sector.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/documents">
              <Button variant="primary" size="lg">
                Browse Documents
              </Button>
            </Link>
            <Link href="/events">
              <Button variant="ghost" size="lg" className="border-white/30 text-white hover:bg-white/10">
                View Events
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="py-16 md:py-20">
        <div className="container">
          <h2 className="heading-2 text-center mb-12">
            What the SIH offers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="flex flex-col gap-4">
                <span className="text-3xl">{f.icon}</span>
                <h3 className="heading-3">{f.title}</h3>
                <p className="text-sm text-slate leading-relaxed">
                  {f.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-teal text-white py-14">
        <div className="container text-center max-w-2xl mx-auto">
          <h2
            className="font-heading font-bold text-3xl mb-4"
            style={{ color: "white" }}
          >
            Ready to explore?
          </h2>
          <p className="text-white/70 mb-8">
            Browse our library of skills reports and download the insights your
            organisation needs.
          </p>
          <Link href="/documents">
            <Button variant="primary" size="lg">
              View All Documents
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
