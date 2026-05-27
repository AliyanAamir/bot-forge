import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">B</span>
          </div>
          <span className="font-semibold text-slate-800 text-lg">BotForge</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-slate-600 hover:text-slate-900 text-sm font-medium">
            Sign in
          </Link>
         
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium mb-6 border border-indigo-100">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
            Powered by Groq LLM
          </div>
          <h1 className="text-5xl font-bold text-slate-900 leading-tight mb-6">
            Build AI chatbots
            <br />
            <span className="text-indigo-600">without writing a line of code</span>
          </h1>
          <p className="text-xl text-slate-500 mb-10 leading-relaxed">
            Create intelligent chatbots trained on your knowledge base. Embed them on any website
            with a single script tag. No infrastructure required.
          </p>
          <div className="flex items-center justify-center gap-4">
           
            <Link href="/login" className="text-slate-600 hover:text-slate-900 text-base font-medium">
              Sign in →
            </Link>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
          {[
            {
              icon: "🧠",
              title: "Knowledge Base",
              desc: "Inject your docs, FAQs, and content to train your bot with domain-specific context.",
            },
            {
              icon: "🎨",
              title: "Custom Appearance",
              desc: "Match your brand with custom colors, bot names, welcome messages, and widget position.",
            },
            {
              icon: "⚡",
              title: "One-line Embed",
              desc: "Get a script snippet that drops your chatbot onto any website in seconds.",
            },
          ].map((f) => (
            <div key={f.title} className="bg-white border border-slate-200 rounded-2xl p-6 text-left shadow-sm">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-slate-800 mb-2">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
