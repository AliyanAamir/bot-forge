import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Wordmark } from "@/components/brand/Logo";
import { BookOpen, Palette, Code2, ArrowRight } from "lucide-react";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto w-full">
        <Wordmark />
        <Link href="/login" className="btn btn-secondary btn-sm">
          Sign in
        </Link>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6">
        {/* Hero */}
        <section className="pt-20 pb-16 md:pt-28 md:pb-24 max-w-3xl">
          <span className="badge badge-ember mb-6">
            <span className="size-1.5 rounded-full bg-ember" />
            Powered by Groq LLM
          </span>
          <h1 className="text-[2.75rem] md:text-6xl font-semibold leading-[1.04] tracking-tight text-ink">
            Forge a chatbot that
            <br />
            <span className="text-ember-strong">knows your business.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted leading-relaxed max-w-xl">
            Train an assistant on your own docs and FAQs, shape its voice, and drop it onto
            any site with one script tag. No infrastructure, no glue code.
          </p>
          <div className="mt-9 flex items-center gap-4">
            <Link href="/login" className="btn btn-primary group">
              Open the workshop
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
            </Link>
            <span className="text-sm text-faint">Invite-only access</span>
          </div>
        </section>

        {/* Capabilities — asymmetric, not an identical card grid */}
        <section className="grid md:grid-cols-12 gap-px rounded-2xl overflow-hidden border border-line bg-line mb-24">
          <Feature
            className="md:col-span-7"
            icon={BookOpen}
            title="Knowledge base"
            desc="Inject docs, FAQs, and product content. The bot answers from your material, with the context retrieved per question."
            wide
          />
          <Feature
            className="md:col-span-5"
            icon={Palette}
            title="Your brand, your voice"
            desc="Colors, name, welcome copy, widget placement, system prompt."
          />
          <Feature
            className="md:col-span-5"
            icon={Code2}
            title="One-line embed"
            desc="Copy a script tag. Live in seconds, anywhere."
          />
          <div className="md:col-span-7 bg-surface p-8 flex flex-col justify-center">
            <p className="font-mono text-xs text-faint mb-3">// drop-in</p>
            <code className="font-mono text-sm text-ink leading-relaxed">
              <span className="text-faint">&lt;script</span> src=
              <span className="text-ember-strong">&quot;.../widget.js&quot;</span>
              <br />
              {"  "}data-bot=<span className="text-ember-strong">&quot;acme&quot;</span>
              <span className="text-faint">&gt;&lt;/script&gt;</span>
            </code>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="max-w-6xl mx-auto w-full px-6 py-5 flex items-center justify-between text-sm text-faint">
          <span>BotForge</span>
          <span>Built for support teams that ship.</span>
        </div>
      </footer>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  desc,
  className = "",
  wide = false,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  desc: string;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div className={`bg-surface p-8 ${className}`}>
      <span className="inline-flex size-10 items-center justify-center rounded-lg bg-ember-soft text-ember-strong mb-4">
        <Icon className="size-5" strokeWidth={1.75} />
      </span>
      <h3 className={`font-semibold text-ink mb-2 ${wide ? "text-lg" : ""}`}>{title}</h3>
      <p className="text-muted text-sm leading-relaxed max-w-md">{desc}</p>
    </div>
  );
}
