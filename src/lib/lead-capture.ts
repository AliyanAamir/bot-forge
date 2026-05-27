const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_RE = /(?:\+?\d[\d\s().-]{7,}\d)/;

export interface ExtractedContact {
  email?: string;
  phone?: string;
  name?: string;
}

export function extractContact(text: string): ExtractedContact {
  const out: ExtractedContact = {};
  const email = text.match(EMAIL_RE)?.[0];
  if (email) out.email = email.toLowerCase();

  const phone = text.match(PHONE_RE)?.[0];
  if (phone) {
    const digits = phone.replace(/\D/g, "");
    if (digits.length >= 8 && digits.length <= 15) out.phone = phone.trim();
  }

  const nameMatch = text.match(/(?:my name is|i am|i'm|this is)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)/i);
  if (nameMatch) out.name = nameMatch[1];

  return out;
}

export function shouldPromptForLead(
  enabled: boolean,
  afterMessages: number,
  userMessageCount: number,
  alreadyCaptured: { email?: string | null; phone?: string | null }
): boolean {
  if (!enabled) return false;
  if (alreadyCaptured.email && alreadyCaptured.phone) return false;
  return userMessageCount >= afterMessages;
}
