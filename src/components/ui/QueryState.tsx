import { TriangleAlert, RefreshCw } from "lucide-react";

/** Standard error panel with retry, for failed useQuery calls. */
export function QueryError({
  message = "Something went wrong loading this.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="panel flex flex-col items-center text-center px-6 py-14">
      <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-danger-soft text-danger mb-4">
        <TriangleAlert className="size-6" strokeWidth={1.5} />
      </span>
      <p className="text-ink font-medium">Couldn&apos;t load</p>
      <p className="text-muted text-sm mt-1 max-w-sm">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-secondary btn-sm mt-5">
          <RefreshCw className="size-3.5" strokeWidth={1.75} /> Try again
        </button>
      )}
    </div>
  );
}
