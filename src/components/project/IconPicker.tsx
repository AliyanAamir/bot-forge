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
            className={`aspect-square flex items-center justify-center rounded-lg border transition-[border-color,background-color,box-shadow] duration-150 outline-none ${
              active
                ? "border-ember ring-4 ring-ember/15"
                : "border-line-strong hover:border-line-strong hover:bg-sunk"
            }`}
            style={active ? { backgroundColor: `${color}14` } : undefined}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke={active ? color : "oklch(0.495 0.012 58)"}
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
