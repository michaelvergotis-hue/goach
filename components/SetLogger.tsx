"use client";

import { SetLog } from "@/lib/storage";
import { calculate1RM, formatWeight } from "@/lib/calculations";

interface SetLoggerProps {
  setNumber: number;
  value: SetLog;
  onChange: (value: SetLog) => void;
  onRemove?: () => void;
  onShare?: () => void;
  showRemove?: boolean;
  canShare?: boolean;
  isPR?: boolean;
  showEstimate?: boolean;
}

export function SetLogger({
  setNumber,
  value,
  onChange,
  onRemove,
  onShare,
  showRemove = false,
  canShare = false,
  isPR = false,
  showEstimate = false,
}: SetLoggerProps) {
  const hasData = value.weight > 0 && value.reps > 0;
  const estimated1RM = hasData ? calculate1RM(value.weight, value.reps) : 0;

  return (
    <div className={`py-2 px-2 -mx-2 rounded-xl transition-all ${isPR && hasData ? "bg-yellow-500/10 ring-1 ring-yellow-500/30" : ""}`}>
      <div className="flex items-center gap-2">
        <span className={`w-7 text-sm font-medium ${isPR && hasData ? "text-yellow-500" : "text-muted"}`}>#{setNumber}</span>

        <div className="flex-1 flex items-center gap-2">
          <div className="flex-1">
            <label className="sr-only">Weight (kg)</label>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                value={value.weight || ""}
                onChange={(e) =>
                  onChange({ ...value, weight: parseFloat(e.target.value) || 0 })
                }
                placeholder="0"
                className={`w-full bg-card border rounded-lg px-3 py-3 text-center text-lg font-semibold focus:outline-none transition-colors ${
                  isPR && hasData
                    ? "border-yellow-500/50 text-yellow-500"
                    : "border-border focus:border-accent focus:ring-1 focus:ring-accent"
                }`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                kg
              </span>
            </div>
          </div>

          <span className="text-muted">×</span>

          <div className="w-20">
            <label className="sr-only">Reps</label>
            <input
              type="number"
              inputMode="numeric"
              value={value.reps || ""}
              onChange={(e) =>
                onChange({ ...value, reps: parseInt(e.target.value) || 0 })
              }
              placeholder="0"
              className={`w-full bg-card border rounded-lg px-3 py-3 text-center text-lg font-semibold focus:outline-none transition-colors ${
                isPR && hasData
                  ? "border-yellow-500/50 text-yellow-500"
                  : "border-border focus:border-accent focus:ring-1 focus:ring-accent"
              }`}
            />
          </div>
        </div>

        {/* Share button - always available */}
        {canShare && onShare && hasData && (
          <button
            onClick={onShare}
            className={`p-2 transition-colors ${isPR ? "text-yellow-500 hover:text-yellow-400" : "text-muted hover:text-accent"}`}
            aria-label={isPR ? "Share PR" : "Share set"}
            title={isPR ? "New PR! Share it" : "Share set"}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        )}

        {showRemove && onRemove && (
          <button
            onClick={onRemove}
            className="p-2 text-muted hover:text-red-400 transition-colors"
            aria-label="Remove set"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Estimated 1RM and PR badge row */}
      {hasData && showEstimate && (
        <div className="flex items-center gap-2 mt-1 ml-9">
          <span className="text-xs text-muted">
            e1RM: <span className="text-accent font-medium">{formatWeight(estimated1RM)}kg</span>
          </span>
          {isPR && (
            <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full font-medium">
              🏆 PR!
            </span>
          )}
        </div>
      )}
    </div>
  );
}
