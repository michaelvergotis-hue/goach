"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { getWorkoutDay, WorkoutDay, getPhase } from "@/lib/program";
import {
  ExerciseLog,
  WorkoutLog,
  saveWorkoutLog,
  getTodayWorkoutLog,
  setWorkoutSessionStatus,
} from "@/lib/storage";
import { getFriendById } from "@/lib/friends";
import { ExerciseCard } from "@/components/ExerciseCard";

export default function WorkoutPage() {
  const params = useParams();
  const phase = params.phase as string;
  const week = params.week as string;
  const day = params.day as string;
  const router = useRouter();
  const { data: session, status } = useSession();

  // Composite day key for storage: p{phase}-w{week}-d{day}
  const dayKey = `p${phase}-w${week}-d${day}`;

  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [workout, setWorkout] = useState<WorkoutDay | null>(null);
  const [phaseInfo, setPhaseInfo] = useState<{ name: string; description: string } | null>(null);
  const [exerciseLogs, setExerciseLogs] = useState<Record<string, ExerciseLog>>(
    {}
  );
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Share state
  const [groups, setGroups] = useState<{ id: number; name: string }[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [isSharing, setIsSharing] = useState(false);
  const [hasShared, setHasShared] = useState(false);

  // Completion state
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);

  // Load workout data
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }

    const selectedUserId = session?.user?.friendId;
    if (!selectedUserId) {
      signOut({ callbackUrl: "/" });
      return;
    }

    const friend = getFriendById(selectedUserId);
    if (!friend) {
      signOut({ callbackUrl: "/" });
      return;
    }

    setUserId(selectedUserId);

    const workoutData = getWorkoutDay(phase, day);
    if (!workoutData) {
      router.replace("/dashboard");
      return;
    }

    const phaseData = getPhase(phase);
    if (phaseData) {
      setPhaseInfo({ name: phaseData.name, description: phaseData.description });
    }

    setWorkout(workoutData);

    // Load existing logs from database
    async function loadExistingLogs(workout: WorkoutDay) {
      const existingLog = await getTodayWorkoutLog(selectedUserId!, dayKey);

      const initialLogs: Record<string, ExerciseLog> = {};
      workout.exercises.forEach((exercise) => {
        const existingExerciseLog = existingLog?.exercises.find(
          (e) => e.exerciseId === exercise.id
        );

        if (existingExerciseLog) {
          initialLogs[exercise.id] = existingExerciseLog;
        } else {
          // Create empty sets based on target
          initialLogs[exercise.id] = {
            exerciseId: exercise.id,
            sets: Array(exercise.sets)
              .fill(null)
              .map(() => ({ weight: 0, reps: 0 })),
            notes: "",
            completedAt: new Date().toISOString(),
          };
        }
      });

      setExerciseLogs(initialLogs);

      // Auto-expand first incomplete exercise
      const firstIncomplete = workout.exercises.find((ex) => {
        const log = initialLogs[ex.id];
        return (
          !log || log.sets.filter((s) => s.weight > 0 && s.reps > 0).length < ex.sets
        );
      });
      if (firstIncomplete) {
        setExpandedExercise(firstIncomplete.id);
      }

      setIsLoading(false);
    }

    loadExistingLogs(workoutData);

    // Fetch groups for sharing
    fetchGroups(selectedUserId);
  }, [phase, week, day, dayKey, status, session, router]);

  const fetchGroups = async (userId: string) => {
    try {
      const response = await fetch(`/api/groups?userId=${encodeURIComponent(userId)}`);
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const handleShare = async () => {
    if (!workout || !userId || selectedGroups.length === 0) return;

    setIsSharing(true);
    try {
      for (const groupId of selectedGroups) {
        await fetch("/api/feed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            groupId,
            userId,
            postType: "workout",
            content: {
              workoutName: workout.name,
              exerciseCount: workout.exercises.length,
              phase: phaseInfo?.name || `Phase ${phase}`,
              week: `Week ${week}`,
              day: dayKey,
            },
          }),
        });
      }
      setHasShared(true);
      setShowShareModal(false);
    } catch (error) {
      console.error("Error sharing workout:", error);
    } finally {
      setIsSharing(false);
    }
  };

  const toggleGroup = (groupId: number) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  // Mark workout as complete and navigate back
  const handleMarkComplete = async () => {
    if (!userId) return;

    setIsMarkingComplete(true);

    // Save final progress first
    await saveProgress();

    // Mark the workout session as completed
    const success = await setWorkoutSessionStatus(userId, dayKey, "completed");

    if (success) {
      router.push("/dashboard");
    } else {
      setIsMarkingComplete(false);
      // Could show an error toast here
    }
  };

  // Save progress to database
  const saveProgress = useCallback(async () => {
    if (!workout || !userId || Object.keys(exerciseLogs).length === 0) return;

    setIsSaving(true);
    const today = new Date().toISOString().split("T")[0];

    const workoutLog: WorkoutLog = {
      day: dayKey,
      date: today,
      exercises: Object.values(exerciseLogs).map((log) => ({
        ...log,
        completedAt: new Date().toISOString(),
      })),
    };

    await saveWorkoutLog(userId, workoutLog);
    setIsSaving(false);
  }, [dayKey, workout, userId, exerciseLogs]);

  // Auto-save when logs change (debounced)
  useEffect(() => {
    if (!isLoading && Object.keys(exerciseLogs).length > 0) {
      // Clear previous timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set new timeout for debounced save
      saveTimeoutRef.current = setTimeout(() => {
        saveProgress();
      }, 1500);

      return () => {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
      };
    }
  }, [exerciseLogs, isLoading, saveProgress]);

  const handleLogChange = (exerciseId: string, log: ExerciseLog) => {
    setExerciseLogs((prev) => ({
      ...prev,
      [exerciseId]: log,
    }));
  };

  const completedCount = workout
    ? workout.exercises.filter((ex) => {
        const log = exerciseLogs[ex.id];
        return (
          log && log.sets.filter((s) => s.weight > 0 && s.reps > 0).length >= ex.sets
        );
      }).length
    : 0;

  if (isLoading || !workout || !userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg border-b border-border z-10">
        <div className="px-4 py-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-1 text-muted hover:text-foreground transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </Link>
            {isSaving && (
              <span className="text-xs text-muted flex items-center gap-1">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                Saving...
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted mb-1">
            <span>{phaseInfo?.name}</span>
            <span>-</span>
            <span>Week {week}</span>
          </div>
          <h1 className="text-xl font-bold">{workout.name}</h1>
          <p className="text-sm text-muted">{workout.focus}</p>

          {/* Progress bar */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-2 bg-card rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{
                  width: `${(completedCount / workout.exercises.length) * 100}%`,
                }}
              />
            </div>
            <span className="text-sm text-muted">
              {completedCount}/{workout.exercises.length}
            </span>
          </div>
        </div>
      </header>

      {/* Exercises */}
      <main className="px-4 py-4 max-w-3xl mx-auto space-y-3">
        {workout.exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            userId={userId}
            log={exerciseLogs[exercise.id]}
            onLogChange={(log) => handleLogChange(exercise.id, log)}
            isExpanded={expandedExercise === exercise.id}
            onToggle={() =>
              setExpandedExercise(
                expandedExercise === exercise.id ? null : exercise.id
              )
            }
            groups={groups}
          />
        ))}
      </main>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-border">
        <div className="max-w-3xl mx-auto flex gap-3">
          {/* Share workout button - always visible when in a group */}
          {groups.length > 0 && !hasShared && (
            <button
              onClick={() => setShowShareModal(true)}
              className="px-4 py-4 bg-card hover:bg-card-hover border border-border text-foreground font-semibold rounded-xl transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          )}
          {hasShared && (
            <div className="px-4 py-4 bg-success/20 text-success font-semibold rounded-xl flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Shared!
            </div>
          )}

          {/* Mark Complete button */}
          <button
            onClick={handleMarkComplete}
            disabled={isMarkingComplete}
            className={`flex-1 font-semibold py-4 rounded-xl text-center transition-colors flex items-center justify-center gap-2 ${
              completedCount === workout.exercises.length
                ? "bg-success hover:bg-success/90 text-white"
                : "bg-accent hover:bg-accent-hover text-white"
            } disabled:opacity-50`}
          >
            {isMarkingComplete ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : completedCount === workout.exercises.length ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Workout Complete!
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Mark Complete ({completedCount}/{workout.exercises.length})
              </>
            )}
          </button>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold mb-2">Share Workout</h2>
            <p className="text-muted text-sm mb-4">
              Share your {workout.name} completion to:
            </p>

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
                onClick={handleShare}
                disabled={isSharing || selectedGroups.length === 0}
                className="flex-1 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {isSharing ? "Sharing..." : "Share"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
