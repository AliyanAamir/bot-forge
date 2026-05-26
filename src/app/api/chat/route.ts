import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { groq } from "@/lib/groq";
import { buildContext } from "@/lib/knowledge";

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

    const config = project.config;

    // Get or create chat session
    let session = sessionId
      ? await db.chatSession.findUnique({ where: { id: sessionId } })
      : null;

    if (!session) {
      session = await db.chatSession.create({
        data: { projectId: project.id, visitorId: visitorId || "anonymous" },
      });
    }

    // Load message history (last 10 turns)
    const history = await db.chatMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: "asc" },
      take: 20,
    });

    // Save user message
    await db.chatMessage.create({
      data: { sessionId: session.id, role: "user", content: message },
    });

    // Build RAG context
    const context = await buildContext(project.id, message);

    const systemPrompt = [
      config?.systemPrompt || "You are a helpful assistant.",
      context
        ? `\n\nUse the following knowledge base to answer questions:\n\n${context}`
        : "",
    ].join("");

    // Call Groq
    const completion = await groq.chat.completions.create({
      model: config?.groqModel || "llama-3.3-70b-versatile",
      temperature: config?.temperature ?? 0.7,
      max_tokens: config?.maxTokens ?? 1024,
      messages: [
        { role: "system", content: systemPrompt },
        ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices[0]?.message?.content || "";

    // Save assistant reply
    await db.chatMessage.create({
      data: { sessionId: session.id, role: "assistant", content: reply },
    });

    await db.chatSession.update({
      where: { id: session.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ reply, sessionId: session.id });
  } catch (err) {
    console.error("[CHAT ERROR]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
