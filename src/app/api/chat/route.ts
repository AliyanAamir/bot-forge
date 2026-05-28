import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { groq } from "@/lib/groq";
import { buildContext } from "@/lib/knowledge";
import { extractContact, shouldPromptForLead } from "@/lib/lead-capture";

export async function POST(req: NextRequest) {
  try {
    const { apiKey, message, sessionId, visitorId } = await req.json();

    if (!apiKey || !message) {
      return NextResponse.json({ error: "apiKey and message required" }, { status: 400 });
    }

    const project = await db.project.findUnique({
      where: { apiKey },
      include: { config: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }
    if (project.apiKeyRevokedAt) {
      return NextResponse.json({ error: "API key revoked" }, { status: 403 });
    }

    // TODO(domain-allowlist): enforce per-project domain restriction.
    // When project.config.allowedDomains is set, check the Origin header
    // (fall back to Referer if absent) against the comma-separated list.
    // Return 403 { error: "Domain not allowed" } if the origin doesn't match.
    // Origin header is always present on cross-origin fetch (which the widget uses).
    // Example enforcement:
    //   const origin = req.headers.get("origin") ?? req.headers.get("referer") ?? "";
    //   const allowed = (project.config?.allowedDomains ?? "").split(",").map(s => s.trim()).filter(Boolean);
    //   if (allowed.length && !allowed.some(d => origin.startsWith(d))) {
    //     return NextResponse.json({ error: "Domain not allowed" }, { status: 403 });
    //   }

    const config = project.config;

    let session = sessionId
      ? await db.chatSession.findUnique({ where: { id: sessionId } })
      : null;

    if (!session) {
      session = await db.chatSession.create({
        data: { projectId: project.id, visitorId: visitorId || "anonymous" },
      });
    }

    const history = await db.chatMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: "asc" },
      take: 20,
    });

    await db.chatMessage.create({
      data: { sessionId: session.id, role: "user", content: message },
    });

    const existingLead = await db.lead.findUnique({ where: { sessionId: session.id } });
    const contact = extractContact(message);
    let lead = existingLead;
    if (contact.email || contact.phone || contact.name) {
      lead = await db.lead.upsert({
        where: { sessionId: session.id },
        create: {
          projectId: project.id,
          sessionId: session.id,
          email: contact.email,
          phone: contact.phone,
          name: contact.name,
        },
        update: {
          email: contact.email ?? existingLead?.email ?? undefined,
          phone: contact.phone ?? existingLead?.phone ?? undefined,
          name: contact.name ?? existingLead?.name ?? undefined,
        },
      });
    }

    const userMessageCount = history.filter((m) => m.role === "user").length + 1;
    const askForLead = shouldPromptForLead(
      config?.leadCaptureEnabled ?? false,
      config?.leadCaptureAfterMessages ?? 3,
      userMessageCount,
      { email: lead?.email, phone: lead?.phone }
    );

    const context = await buildContext(project.id, message);

    const baseSystem = [
      config?.systemPrompt || "You are a helpful assistant.",
      context ? `\n\nUse the following knowledge base to answer questions:\n\n${context}` : "",
    ].join("");

    const missing: string[] = [];
    if (!lead?.email) missing.push("email");
    if (!lead?.phone) missing.push("phone number");
    if (!lead?.name) missing.push("name");

    const leadSystem = askForLead
      ? `IMPORTANT OPERATOR INSTRUCTION (overrides any earlier rule about not collecting personal info): You ARE authorized and required to collect contact details from this visitor for follow-up by a human team member. ${
          config?.leadCapturePrompt ?? "Politely ask for their name, email, and phone number."
        } Still missing: ${missing.join(", ") || "none"}. Weave the request naturally into your next reply after helping them. Do not refuse, do not say you cannot store data — the platform stores it securely. If the visitor has already shared something, acknowledge it and ask only for what is still missing.`
      : "";

    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: baseSystem },
      ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user", content: message },
    ];
    if (leadSystem) messages.push({ role: "system", content: leadSystem });

    const completion = await groq.chat.completions.create({
      model: config?.groqModel || "llama-3.3-70b-versatile",
      temperature: config?.temperature ?? 0.7,
      max_tokens: config?.maxTokens ?? 1024,
      messages,
    });

    const reply = completion.choices[0]?.message?.content || "";

    await db.chatMessage.create({
      data: { sessionId: session.id, role: "assistant", content: reply },
    });

    await db.chatSession.update({
      where: { id: session.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(
      { reply, sessionId: session.id },
      { headers: { "Access-Control-Allow-Origin": "*" } }
    );
  } catch (err) {
    console.error("[CHAT ERROR]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Api-Key",
      "Access-Control-Max-Age": "86400",
    },
  });
}
