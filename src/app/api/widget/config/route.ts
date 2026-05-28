import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { BOT_ICONS, isBotIconKey } from "@/lib/bot-icons";

export async function GET(req: NextRequest) {
  const apiKey = req.nextUrl.searchParams.get("apiKey");
  if (!apiKey) return NextResponse.json({ error: "apiKey required" }, { status: 400 });

  const project = await db.project.findUnique({
    where: { apiKey },
    include: { config: true },
  });
  if (!project) return NextResponse.json({ error: "Invalid apiKey" }, { status: 401 });
  if (project.apiKeyRevokedAt) return NextResponse.json({ error: "API key revoked" }, { status: 403 });

  // TODO(domain-allowlist): same Origin-header check as /api/chat.
  // Config is fetched on widget init — blocking it here prevents the widget
  // from loading at all on unlisted domains (fail-fast, no partial render).

  const c = project.config;
  const iconKey = c?.iconKey && isBotIconKey(c.iconKey) ? c.iconKey : "bot";

  return NextResponse.json(
    {
      botName: c?.botName ?? "Assistant",
      welcomeMessage: c?.welcomeMessage ?? "Hi! How can I help you today?",
      placeholder: c?.placeholder ?? "Type a message...",
      primaryColor: c?.primaryColor ?? "#6366f1",
      textColor: c?.textColor ?? "#1e293b",
      position: c?.position ?? "bottom-right",
      widgetWidth: c?.widgetWidth ?? 380,
      widgetHeight: c?.widgetHeight ?? 560,
      showBranding: c?.showBranding ?? true,
      iconKey,
      iconPath: BOT_ICONS[iconKey].path,
    },
    { headers: { "Access-Control-Allow-Origin": "*" } }
  );
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}
