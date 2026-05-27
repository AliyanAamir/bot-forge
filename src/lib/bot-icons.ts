export type BotIconKey =
  | "bot"
  | "chat"
  | "sparkles"
  | "headset"
  | "zap"
  | "heart"
  | "star"
  | "brain"
  | "help"
  | "smile"
  | "mail"
  | "rocket";

export const BOT_ICONS: Record<BotIconKey, { label: string; path: string }> = {
  bot: {
    label: "Bot",
    path: "M12 8V4H8M16 4h-4M4 8h16v12H4zM2 14h2M20 14h2M9 13v2M15 13v2",
  },
  chat: {
    label: "Chat",
    path: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z",
  },
  sparkles: {
    label: "Sparkles",
    path: "M12 3l2.4 5.6L20 11l-5.6 2.4L12 19l-2.4-5.6L4 11l5.6-2.4zM19 3l1 2 2 1-2 1-1 2-1-2-2-1 2-1zM5 16l1 2 2 1-2 1-1 2-1-2-2-1 2-1z",
  },
  headset: {
    label: "Headset",
    path: "M3 14v-3a9 9 0 0 1 18 0v3M21 19a2 2 0 0 1-2 2h-1v-7h3zM3 14h3v7H5a2 2 0 0 1-2-2z",
  },
  zap: {
    label: "Zap",
    path: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  },
  heart: {
    label: "Heart",
    path: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z",
  },
  star: {
    label: "Star",
    path: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z",
  },
  brain: {
    label: "Brain",
    path: "M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2zM14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2z",
  },
  help: {
    label: "Help",
    path: "M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zM9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01",
  },
  smile: {
    label: "Smile",
    path: "M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zM8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01",
  },
  mail: {
    label: "Mail",
    path: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6",
  },
  rocket: {
    label: "Rocket",
    path: "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2zM9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5",
  },
};

export const DEFAULT_ICON: BotIconKey = "bot";

export function isBotIconKey(key: string): key is BotIconKey {
  return key in BOT_ICONS;
}
