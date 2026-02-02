"use client";

import Link from "next/link";
import { Group } from "./types";

interface WorkoutDayCardProps {
  day: string;
  workout: {
    name: string;
    focus: string;
    exercises: { id: string }[];
  };
  status: "completed" | "missed" | null;
  selectedPhase: string;
  selectedWeek: number;
  groups: Group[];
  onMarkMissed: (day: string, e: React.MouseEvent) => void;
  onRevert: (day: string, e: React.MouseEvent) => void;
  onShare: (day: string, workout: { name: string; focus: string; exercises: { id: string }[] }, e: React.MouseEvent) => void;
}

export function WorkoutDayCard({
  day,
  workout,
  status,
  selectedPhase,
  selectedWeek,
  groups,
  onMarkMissed,
  onRevert,
  onShare,
}: WorkoutDayCardProps) {
  const isCompleted = status === "completed";
  const isMissed = status === "missed";
  const isDone = isCompleted || isMissed;

  return (
    <div
      className={`rounded-2xl transition-all duration-200 ${
        isCompleted
          ? "bg-success/5"
          : isMissed
            ? "bg-card/50 opacity-60"
            : "bg-card hover:bg-card-hover"
      }`}
    >
      <div className="p-4 flex items-center gap-4">
        <Link
          href={`/workout/${selectedPhase}/${selectedWeek}/${day}`}
          className="flex items-center gap-4 flex-1 min-w-0"
        >
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
              isCompleted
                ? "bg-success/20"
                : isMissed
                  ? "bg-muted/20"
                  : "bg-background hover:bg-accent/10"
            }`}
          >
            {isCompleted ? (
              <svg
                className="w-7 h-7 text-success"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : isMissed ? (
              <svg
                className="w-7 h-7 text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <span className="text-2xl font-bold text-muted hover:text-accent transition-colors">
                {day}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4
              className={`font-semibold text-base ${
                isCompleted
                  ? "text-success"
                  : isMissed
                    ? "text-muted line-through"
                    : "text-foreground"
              }`}
            >
              {workout.focus.split("(")[0].trim()}
            </h4>
            <p className="text-sm text-muted truncate">
              {workout.focus.includes("(")
                ? workout.focus.match(/\((.*?)\)/)?.[1]
                : workout.focus}
            </p>
            <p className="text-xs text-muted mt-1">
              {isMissed ? "Skipped" : `${workout.exercises.length} exercises`}
            </p>
          </div>
        </Link>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Skip button - only show if not done */}
          {!isDone && (
            <button
              onClick={(e) => onMarkMissed(day, e)}
              className="px-3 py-1.5 text-xs font-medium text-muted bg-background border border-border rounded-lg hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              Skip
            </button>
          )}

          {/* Share button - only for completed workouts */}
          {isCompleted && groups.length > 0 && (
            <button
              onClick={(e) => onShare(day, workout, e)}
              className="px-3 py-1.5 text-xs font-medium text-accent bg-accent/10 border border-accent/30 rounded-lg hover:bg-accent/20 transition-colors"
            >
              Share
            </button>
          )}

          {/* Undo button - show for completed/missed workouts */}
          {isDone && (
            <button
              onClick={(e) => onRevert(day, e)}
              className="px-3 py-1.5 text-xs font-medium text-muted bg-background border border-border rounded-lg hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              Undo
            </button>
          )}

          {/* Arrow for navigation - only if not done */}
          {!isDone && (
            <Link
              href={`/workout/${selectedPhase}/${selectedWeek}/${day}`}
              className="p-2"
            >
              <svg
                className="w-5 h-5 text-muted hover:text-accent transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
