"use client";

import { useState, useEffect } from "react";
import { Exercise } from "@/lib/program";
import { ExerciseLog, SetLog, getLastExerciseLog } from "@/lib/storage";
import { calculate1RM, formatWeight } from "@/lib/calculations";
import { SetLogger } from "./SetLogger";
import { YouTubeEmbed } from "./YouTubeEmbed";

interface ExerciseCardProps {
  exercise: Exercise;
  log: ExerciseLog;
  onLogChange: (log: ExerciseLog) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

export function ExerciseCard({
  exercise,
  log,
  onLogChange,
  isExpanded,
  onToggle,
}: ExerciseCardProps) {
  const [lastLog, setLastLog] = useState<ExerciseLog | null>(null);
  const [isLoadingLast, setIsLoadingLast] = useState(true);

  useEffect(() => {
    // Get the last workout log for this exercise from database
    async function fetchLastLog() {
      setIsLoadingLast(true);
      try {
        const previousLog = await getLastExerciseLog(exercise.id);
        // Only set if it's from a different session (not today)
        const today = new Date().toISOString().split("T")[0];
        if (previousLog && previousLog.completedAt.split("T")[0] !== today) {
          setLastLog(previousLog);
        }
      } catch (error) {
        console.error("Error fetching last log:", error);
      }
      setIsLoadingLast(false);
    }

    fetchLastLog();
  }, [exercise.id]);

  const handleSetChange = (index: number, value: SetLog) => {
    const newSets = [...log.sets];
    newSets[index] = value;
    onLogChange({ ...log, sets: newSets });
  };

  const handleAddSet = () => {
    const lastSet = log.sets[log.sets.length - 1] || { weight: 0, reps: 0 };
    onLogChange({
      ...log,
      sets: [...log.sets, { weight: lastSet.weight, reps: 0 }],
    });
  };

  const handleRemoveSet = (index: number) => {
    if (log.sets.length > 1) {
      const newSets = log.sets.filter((_, i) => i !== index);
      onLogChange({ ...log, sets: newSets });
    }
  };

  // Calculate best 1RM from logged sets
  const best1RM =
    exercise.isCompound && log.sets.some((s) => s.weight > 0 && s.reps > 0)
      ? Math.max(
          ...log.sets
            .filter((s) => s.weight > 0 && s.reps > 0)
            .map((s) => calculate1RM(s.weight, s.reps))
        )
      : null;

  // Check if exercise is complete (all target sets logged)
  const completedSets = log.sets.filter((s) => s.weight > 0 && s.reps > 0).length;
  const isComplete = completedSets >= exercise.sets;

  return (
    <div
      className={`bg-card rounded-xl border transition-all ${
        isComplete
          ? "border-success/50"
          : isExpanded
            ? "border-accent"
            : "border-border"
      }`}
    >
      {/* Header - always visible */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-4 flex items-center justify-between text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg truncate">{exercise.name}</h3>
            {isComplete && (
              <svg
                className="w-5 h-5 text-success flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
          <p className="text-sm text-muted mt-0.5">
            {exercise.sets} sets × {exercise.reps} reps
            {!isLoadingLast && lastLog && lastLog.sets[0] && (
              <span className="ml-2 text-accent">
                • Last: {formatWeight(lastLog.sets[0].weight)}kg
              </span>
            )}
          </p>
        </div>

        <svg
          className={`w-5 h-5 text-muted transition-transform flex-shrink-0 ml-2 ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-border pt-4">
          {/* Last workout info */}
          {lastLog && (
            <div className="mb-4 p-3 bg-background rounded-lg">
              <p className="text-sm text-muted mb-1">Last session:</p>
              <div className="flex flex-wrap gap-2">
                {lastLog.sets.map((set, i) => (
                  <span
                    key={i}
                    className="text-sm bg-card px-2 py-1 rounded"
                  >
                    {formatWeight(set.weight)}kg × {set.reps}
                  </span>
                ))}
              </div>
              {lastLog.notes && (
                <p className="text-sm text-muted mt-2 italic">
                  "{lastLog.notes}"
                </p>
              )}
            </div>
          )}

          {/* Set loggers */}
          <div className="space-y-1">
            {log.sets.map((set, index) => (
              <SetLogger
                key={index}
                setNumber={index + 1}
                value={set}
                onChange={(value) => handleSetChange(index, value)}
                onRemove={() => handleRemoveSet(index)}
                showRemove={log.sets.length > 1}
              />
            ))}
          </div>

          {/* Add set button */}
          <button
            onClick={handleAddSet}
            className="mt-3 w-full py-2 border border-dashed border-border rounded-lg text-sm text-muted hover:text-foreground hover:border-foreground transition-colors"
          >
            + Add Set
          </button>

          {/* 1RM display for compound lifts */}
          {best1RM && best1RM > 0 && (
            <div className="mt-4 p-3 bg-accent/10 rounded-lg text-center">
              <p className="text-sm text-muted">Predicted 1RM</p>
              <p className="text-2xl font-bold text-accent">
                {formatWeight(best1RM)}kg
              </p>
            </div>
          )}

          {/* Notes */}
          <div className="mt-4">
            <textarea
              value={log.notes}
              onChange={(e) => onLogChange({ ...log, notes: e.target.value })}
              placeholder="Add notes for this exercise..."
              rows={2}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
            />
          </div>

          {/* YouTube embed */}
          {exercise.youtubeId && (
            <YouTubeEmbed videoId={exercise.youtubeId} title={exercise.name} />
          )}
        </div>
      )}
    </div>
  );
}
