import { cn } from "@/lib/utils";

/**
 * BotForge mark: an ember-lit tile with a forge spark.
 * Solid ember fill (no gradient), warm shadow for a struck-metal feel.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center rounded-lg text-white shrink-0",
        "size-8 shadow-[0_1px_2px_oklch(0.4_0.1_44/0.35),0_0_0_1px_oklch(0.5_0.16_44/0.3)_inset]",
        className,
      )}
      style={{ backgroundColor: "var(--color-ember)" }}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-[60%]">
        {/* anvil + spark */}
        <path
          d="M5 9h9a4 4 0 0 1-4 4H9v3h4v2H6v-2h1v-3H6a2 2 0 0 1-2-2V9h1Z"
          fill="currentColor"
        />
        <path
          d="M16.5 4.2c1.6 1 2.2 2.4 1.6 3.8-.4 1-.2 1.8.5 2.6-1.7.1-3-.7-3.3-2-.2-1 .1-1.9 1.2-2.8.2-.5.1-1 0-1.6Z"
          fill="currentColor"
          opacity="0.92"
        />
      </svg>
    </span>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="font-semibold tracking-tight text-ink text-[0.975rem]">
        Bot<span className="text-ember-strong">Forge</span>
      </span>
    </span>
  );
}
