"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { getWorkoutDay, WorkoutDay, getPhase, Exercise } from "@/lib/program";
import {
  ExerciseLog,
  WorkoutLog,
  saveWorkoutLog,
  getTodayWorkoutLog,
  setWorkoutSessionStatus,
} from "@/lib/storage";
import { getFriendById } from "@/lib/friends";
import { ExerciseCard } from "@/components/ExerciseCard";
import { LibraryExercise } from "@/lib/exerciseLibrary";

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

  // Groups for PR sharing
  const [groups, setGroups] = useState<{ id: number; name: string }[]>([]);

  // Exercise modifications (swaps and target changes)
  const [modifiedExercises, setModifiedExercises] = useState<Record<string, Exercise>>({});

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

    const workoutData = getWorkoutDay(phase, day);
    if (!workoutData) {
      router.replace("/dashboard");
      return;
    }

    // Initialize all state in async function to avoid linter warnings
    async function initializeWorkout(userId: string, workout: WorkoutDay) {
      setUserId(userId);

      const phaseData = getPhase(phase);
      if (phaseData) {
        setPhaseInfo({ name: phaseData.name, description: phaseData.description });
      }

      setWorkout(workout);

      // Load existing logs from database
      const existingLog = await getTodayWorkoutLog(userId, dayKey);

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

      // Fetch groups for sharing
      try {
        const response = await fetch("/api/groups");
        if (response.ok) {
          const data = await response.json();
          setGroups(data);
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    }

    initializeWorkout(selectedUserId, workoutData);
  }, [phase, week, day, dayKey, status, session, router]);

  // Handle exercise swap
  const handleExerciseSwap = (originalId: string, newExercise: LibraryExercise) => {
    if (!workout) return;

    // Find the original exercise to preserve sets/reps
    const originalExercise = workout.exercises.find(e => e.id === originalId);
    if (!originalExercise) return;

    // Create modified exercise with new name/id but same sets/reps
    const modified: Exercise = {
      ...originalExercise,
      id: newExercise.id,
      name: newExercise.name,
      isCompound: newExercise.isCompound,
    };

    setModifiedExercises(prev => ({
      ...prev,
      [originalId]: modified,
    }));

    // Update exercise logs to use new exercise ID
    setExerciseLogs(prev => {
      const newLogs = { ...prev };
      if (prev[originalId]) {
        newLogs[newExercise.id] = {
          ...prev[originalId],
          exerciseId: newExercise.id,
        };
        // Keep the old one too for now (in case they swap back)
      }
      return newLogs;
    });
  };

  // Handle target sets/reps change
  const handleTargetChange = (exerciseId: string, sets: number, reps: string) => {
    if (!workout) return;

    // Find the exercise (could be original or already modified)
    const originalExercise = workout.exercises.find(e => e.id === exerciseId);
    const existingModified = Object.values(modifiedExercises).find(e => e.id === exerciseId);
    const exercise = existingModified || originalExercise;

    if (!exercise) return;

    // Find the original key (in case this is a swapped exercise)
    const originalKey = Object.entries(modifiedExercises).find(
      ([, e]) => e.id === exerciseId
    )?.[0] || exerciseId;

    const modified: Exercise = {
      ...exercise,
      sets,
      reps,
    };

    setModifiedExercises(prev => ({
      ...prev,
      [originalKey]: modified,
    }));

    // Adjust the sets array in exerciseLogs if needed
    setExerciseLogs(prev => {
      const currentLog = prev[exerciseId];
      if (!currentLog) return prev;

      const currentSets = currentLog.sets;
      let newSets = [...currentSets];

      if (sets > currentSets.length) {
        // Add more sets
        const lastSet = currentSets[currentSets.length - 1] || { weight: 0, reps: 0 };
        for (let i = currentSets.length; i < sets; i++) {
          newSets.push({ weight: lastSet.weight, reps: 0 });
        }
      } else if (sets < currentSets.length) {
        // Remove sets (but keep at least 1)
        newSets = currentSets.slice(0, Math.max(1, sets));
      }

      return {
        ...prev,
        [exerciseId]: {
          ...currentLog,
          sets: newSets,
        },
      };
    });
  };

  // Get the effective exercise (modified or original)
  const getEffectiveExercise = (originalExercise: Exercise): Exercise => {
    return modifiedExercises[originalExercise.id] || originalExercise;
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
        const effectiveEx = getEffectiveExercise(ex);
        const log = exerciseLogs[effectiveEx.id] || exerciseLogs[ex.id];
        return (
          log && log.sets.filter((s) => s.weight > 0 && s.reps > 0).length >= effectiveEx.sets
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
          {/* Top row: Back button and saving indicator */}
          <div className="flex items-center justify-between mb-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-foreground hover:bg-card-hover transition-colors"
            >
              <svg
                className="w-4 h-4"
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
              <span className="font-medium text-sm">Back</span>
            </Link>
            {isSaving && (
              <span className="text-xs text-muted flex items-center gap-1">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                Saving...
              </span>
            )}
          </div>
          {/* Phase and week */}
          <p className="text-sm text-muted mb-1">{phaseInfo?.name} · Week {week}</p>
          {/* Workout title */}
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
        {workout.exercises.map((exercise) => {
          const effectiveExercise = getEffectiveExercise(exercise);
          return (
            <ExerciseCard
              key={exercise.id}
              exercise={effectiveExercise}
              userId={userId}
              log={exerciseLogs[effectiveExercise.id] || exerciseLogs[exercise.id]}
              onLogChange={(log) => handleLogChange(effectiveExercise.id, log)}
              isExpanded={expandedExercise === exercise.id}
              onToggle={() =>
                setExpandedExercise(
                  expandedExercise === exercise.id ? null : exercise.id
                )
              }
              groups={groups}
              onExerciseSwap={(originalId, newExercise) => handleExerciseSwap(exercise.id, newExercise)}
              onTargetChange={handleTargetChange}
            />
          );
        })}
      </main>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-border">
        <div className="max-w-3xl mx-auto">
          {/* Mark Complete button */}
          <button
            onClick={handleMarkComplete}
            disabled={isMarkingComplete}
            className={`w-full font-semibold px-8 py-4 rounded-xl text-center transition-colors flex items-center justify-center gap-2 ${
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

    </div>
  );
}
