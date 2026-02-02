"use client";

import { HistoryEntry, ExerciseLog } from "@/lib/storage";
import { getExerciseName, getWorkoutDay, getPhase, getAllPhases } from "@/lib/program";
import { parseDayKey, formatDate } from "./types";

interface HistoryTabProps {
  history: HistoryEntry[];
  historyPhase: string | "all";
  historyWeek: number | "all";
  setHistoryPhase: (phase: string | "all") => void;
  setHistoryWeek: (week: number | "all") => void;
  expandedKey: string | null;
  historyDetails: ExerciseLog[] | null;
  loadingDetails: boolean;
  onToggleDetails: (entry: HistoryEntry) => void;
  onSwitchToProgram: () => void;
}

export function HistoryTab({
  history,
  historyPhase,
  historyWeek,
  setHistoryPhase,
  setHistoryWeek,
  expandedKey,
  historyDetails,
  loadingDetails,
  onToggleDetails,
  onSwitchToProgram,
}: HistoryTabProps) {
  const phases = getAllPhases();

  const filteredHistory = history.filter((entry) => {
    const parsed = parseDayKey(entry.day);
    if (!parsed) return historyPhase === "all";
    if (historyPhase !== "all" && parsed.phase !== historyPhase) return false;
    if (historyWeek !== "all" && parseInt(parsed.week) !== historyWeek) return false;
    return true;
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Workout History</h2>
        <p className="text-muted mt-1">Your past sessions</p>
      </div>

      {/* Phase/Week Filter */}
      <div className="mb-6 flex flex-wrap gap-3">
        {/* Phase filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">Phase:</span>
          <div className="flex gap-1">
            <button
              onClick={() => {
                setHistoryPhase("all");
                setHistoryWeek("all");
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                historyPhase === "all"
                  ? "bg-accent text-white"
                  : "bg-card text-muted hover:bg-card-hover"
              }`}
            >
              All
            </button>
            {phases.map(({ id }) => (
              <button
                key={id}
                onClick={() => {
                  setHistoryPhase(id);
                  setHistoryWeek("all");
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  historyPhase === id
                    ? "bg-accent text-white"
                    : "bg-card text-muted hover:bg-card-hover"
                }`}
              >
                {id}
              </button>
            ))}
          </div>
        </div>

        {/* Week filter - only show when phase is selected */}
        {historyPhase !== "all" && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">Week:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setHistoryWeek("all")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  historyWeek === "all"
                    ? "bg-accent text-white"
                    : "bg-card text-muted hover:bg-card-hover"
                }`}
              >
                All
              </button>
              {phases.find((p) => p.id === historyPhase) &&
                Array.from(
                  {
                    length: phases.find((p) => p.id === historyPhase)!.phase.weeks,
                  },
                  (_, i) => i + 1
                ).map((week) => (
                  <button
                    key={week}
                    onClick={() => setHistoryWeek(week)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      historyWeek === week
                        ? "bg-accent text-white"
                        : "bg-card text-muted hover:bg-card-hover"
                    }`}
                  >
                    {week}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted">No workouts logged yet</p>
          <button
            onClick={onSwitchToProgram}
            className="inline-block mt-4 text-accent hover:underline"
          >
            Start your first workout
          </button>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted">No workouts found for this phase/week</p>
          <button
            onClick={() => {
              setHistoryPhase("all");
              setHistoryWeek("all");
            }}
            className="inline-block mt-4 text-accent hover:underline"
          >
            View all history
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((entry, index) => {
            const parsed = parseDayKey(entry.day);
            const workout = parsed ? getWorkoutDay(parsed.phase, parsed.day) : null;
            const phase = parsed ? getPhase(parsed.phase) : null;
            const key = `${entry.day}-${entry.date}`;
            const isExpanded = expandedKey === key;

            return (
              <div
                key={`${entry.day}-${entry.date}-${index}`}
                className="bg-card border border-border rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => onToggleDetails(entry)}
                  className="w-full p-4 text-left hover:bg-card-hover transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted">{formatDate(entry.date)}</p>
                      {parsed && phase && (
                        <p className="text-xs text-accent mt-1">
                          {phase.name} - Week {parsed.week}
                        </p>
                      )}
                      <h3 className="font-semibold text-lg mt-1">
                        {workout?.name || `Day ${parsed?.day || entry.day}`}
                      </h3>
                      <p className="text-sm text-muted">
                        {workout?.focus || "Workout"}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-accent">
                          {entry.exercises_logged}
                        </p>
                        <p className="text-xs text-muted">exercises</p>
                      </div>
                      <svg
                        className={`w-5 h-5 text-muted transition-transform ${
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
                    </div>
                  </div>
                </button>

                {/* Expanded exercise details */}
                {isExpanded && (
                  <div className="border-t border-border p-4 bg-background/50">
                    {loadingDetails ? (
                      <div className="flex justify-center py-4">
                        <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : historyDetails && historyDetails.length > 0 ? (
                      <div className="space-y-3">
                        {historyDetails.map((exercise, i) => (
                          <div key={i} className="bg-card rounded-xl p-3">
                            <h4 className="font-medium text-sm mb-2">
                              {getExerciseName(exercise.exerciseId)}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {exercise.sets.map((set, j) => (
                                <span
                                  key={j}
                                  className="text-xs bg-background px-2 py-1 rounded"
                                >
                                  {set.weight}kg × {set.reps}
                                </span>
                              ))}
                            </div>
                            {exercise.notes && (
                              <p className="text-xs text-muted mt-2 italic">
                                &quot;{exercise.notes}&quot;
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted text-center py-4">
                        No exercise data found
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
