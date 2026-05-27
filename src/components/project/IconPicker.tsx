"use client";

import { BOT_ICONS, BotIconKey } from "@/lib/bot-icons";

interface Props {
  value: string;
  color: string;
  onChange: (key: BotIconKey) => void;
}

export function IconPicker({ value, color, onChange }: Props) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {(Object.keys(BOT_ICONS) as BotIconKey[]).map((key) => {
        const icon = BOT_ICONS[key];
        const active = value === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            title={icon.label}
            className={`aspect-square flex items-center justify-center rounded-xl border-2 transition-all ${
              active
                ? "border-indigo-500 ring-2 ring-indigo-200"
                : "border-slate-200 hover:border-slate-300"
            }`}
            style={active ? { backgroundColor: `${color}10` } : undefined}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke={active ? color : "#475569"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6"
            >
              <path d={icon.path} />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
