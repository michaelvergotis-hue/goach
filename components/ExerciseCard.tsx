"use client";

import { useState, useEffect } from "react";
import { Exercise } from "@/lib/program";
import { ExerciseLog, SetLog, getLastExerciseLog, getExercisePRs } from "@/lib/storage";
import { calculate1RM, formatWeight } from "@/lib/calculations";
import { SetLogger } from "./SetLogger";
import { YouTubeEmbed } from "./YouTubeEmbed";

interface Group {
  id: number;
  name: string;
}

interface ExerciseCardProps {
  exercise: Exercise;
  userId: string;
  log: ExerciseLog;
  onLogChange: (log: ExerciseLog) => void;
  isExpanded: boolean;
  onToggle: () => void;
  groups?: Group[];
}

export function ExerciseCard({
  exercise,
  userId,
  log,
  onLogChange,
  isExpanded,
  onToggle,
  groups = [],
}: ExerciseCardProps) {
  const [lastLog, setLastLog] = useState<ExerciseLog | null>(null);
  const [isLoadingLast, setIsLoadingLast] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [isSharing, setIsSharing] = useState(false);
  const [sharingSet, setSharingSet] = useState<SetLog | null>(null);
  const [sharedSets, setSharedSets] = useState<Set<number>>(new Set());
  const [prRecords, setPrRecords] = useState<Record<number, number>>({});

  useEffect(() => {
    // Get the last workout log and PR records for this exercise
    async function fetchData() {
      setIsLoadingLast(true);
      try {
        const [previousLog, prs] = await Promise.all([
          getLastExerciseLog(userId, exercise.id),
          getExercisePRs(userId, exercise.id),
        ]);

        // Only set lastLog if it's from a different session (not today)
        const today = new Date().toISOString().split("T")[0];
        if (previousLog && previousLog.completedAt.split("T")[0] !== today) {
          setLastLog(previousLog);
        }

        setPrRecords(prs);
      } catch (error) {
        console.error("Error fetching exercise data:", error);
      }
      setIsLoadingLast(false);
    }

    fetchData();
  }, [userId, exercise.id]);

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

  // Check if a set is a PR (beats previous best for that rep count)
  // Only track PRs for 1, 3, and 5 rep sets
  const PR_REP_COUNTS = [1, 3, 5];
  const isSetPR = (set: SetLog): boolean => {
    if (set.weight <= 0 || set.reps <= 0) return false;
    // Only consider 1RM, 3RM, and 5RM as PRs
    if (!PR_REP_COUNTS.includes(set.reps)) return false;
    const previousBest = prRecords[set.reps];
    // It's a PR if there's no previous record, or this beats it
    return !previousBest || set.weight > previousBest;
  };

  const toggleGroup = (groupId: number) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleOpenShareModal = (set: SetLog, setIndex: number) => {
    if (sharedSets.has(setIndex)) return; // Already shared
    setSharingSet(set);
    setSelectedGroups([]);
    setShowShareModal(true);
  };

  const handleSharePR = async () => {
    if (!sharingSet || selectedGroups.length === 0) return;

    setIsSharing(true);
    try {
      for (const groupId of selectedGroups) {
        await fetch("/api/feed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            groupId,
            userId,
            postType: "pr",
            content: {
              exerciseName: exercise.name,
              weight: sharingSet.weight,
              reps: sharingSet.reps,
            },
          }),
        });
      }
      // Mark this set as shared
      const setIndex = log.sets.findIndex(
        (s) => s.weight === sharingSet.weight && s.reps === sharingSet.reps
      );
      if (setIndex !== -1) {
        setSharedSets((prev) => new Set([...prev, setIndex]));
      }
      setShowShareModal(false);
      setSharingSet(null);
    } catch (error) {
      console.error("Error sharing PR:", error);
    } finally {
      setIsSharing(false);
    }
  };

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
                  &quot;{lastLog.notes}&quot;
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
                onShare={() => handleOpenShareModal(set, index)}
                showRemove={log.sets.length > 1}
                canShare={groups.length > 0 && !sharedSets.has(index)}
                isPR={isSetPR(set)}
                showEstimate={exercise.isCompound}
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

          {/* Best 1RM this session - for compound lifts */}
          {best1RM && best1RM > 0 && exercise.isCompound && (
            <div className="mt-4 p-3 bg-accent/10 rounded-lg text-center">
              <p className="text-sm text-muted">Best e1RM This Session</p>
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

      {/* Share PR Modal */}
      {showShareModal && sharingSet && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowShareModal(false)}>
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-2">Share PR 🏆</h2>
            <p className="text-muted text-sm mb-1">{exercise.name}</p>
            <p className="text-accent font-bold text-lg mb-4">
              {formatWeight(sharingSet.weight)}kg × {sharingSet.reps} reps
            </p>

            <p className="text-sm text-muted mb-2">Share to:</p>
            <div className="space-y-2 mb-4">
              {groups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => toggleGroup(group.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                    selectedGroups.includes(group.id)
                      ? "bg-accent/10 border-accent"
                      : "bg-background border-border hover:bg-card-hover"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    selectedGroups.includes(group.id)
                      ? "bg-accent text-white"
                      : "bg-accent/20 text-accent"
                  }`}>
                    {group.name.charAt(0)}
                  </div>
                  <span className="flex-1 text-left">{group.name}</span>
                  {selectedGroups.includes(group.id) && (
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 py-3 bg-background border border-border rounded-xl font-medium hover:bg-card-hover transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSharePR}
                disabled={isSharing || selectedGroups.length === 0}
                className="flex-1 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {isSharing ? "Sharing..." : "Share PR"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
