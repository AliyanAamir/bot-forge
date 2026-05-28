/** Shared client/server types for the paginated API envelope + list rows. */

export interface Paginated<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ProjectListItem {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  config: { primaryColor: string | null } | null;
  _count: { knowledgeDocs: number; chatSessions: number };
}

export interface LeadListItem {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  notes: string | null;
  sessionId: string;
  createdAt: string;
  session: { id: string; visitorId: string } | null;
}

export interface ConversationListItem {
  id: string;
  visitorId: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage: string | null;
  lastMessageRole: string | null;
  lead: { id: string; name: string | null; email: string | null; phone: string | null; status: string } | null;
}

export interface KnowledgeListItem {
  id: string;
  title: string;
  content: string;
  source: string | null;
  type: string;
  createdAt: string;
}

export interface InviteListItem {
  id: string;
  email: string;
  role: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  invitedBy: { name: string | null; email: string };
}
