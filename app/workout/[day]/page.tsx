"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { getWorkoutDay, WorkoutDay } from "@/lib/program";
import {
  ExerciseLog,
  WorkoutLog,
  saveWorkoutLog,
  getTodayWorkoutLog,
} from "@/lib/storage";
import { getFriendById } from "@/lib/friends";
import { ExerciseCard } from "@/components/ExerciseCard";

export default function WorkoutPage() {
  const params = useParams();
  const day = params.day as string;
  const router = useRouter();
  const { data: session, status } = useSession();

  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [workout, setWorkout] = useState<WorkoutDay | null>(null);
  const [exerciseLogs, setExerciseLogs] = useState<Record<string, ExerciseLog>>(
    {}
  );
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    const workoutData = getWorkoutDay(day);
    if (!workoutData) {
      router.replace("/dashboard");
      return;
    }

    setWorkout(workoutData);

    // Load existing logs from database
    async function loadExistingLogs(workout: WorkoutDay) {
      const existingLog = await getTodayWorkoutLog(selectedUserId!, day);

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
  }, [day, status, session, router]);

  // Save progress to database
  const saveProgress = useCallback(async () => {
    if (!workout || !userId || Object.keys(exerciseLogs).length === 0) return;

    setIsSaving(true);
    const today = new Date().toISOString().split("T")[0];

    const workoutLog: WorkoutLog = {
      day,
      date: today,
      exercises: Object.values(exerciseLogs).map((log) => ({
        ...log,
        completedAt: new Date().toISOString(),
      })),
    };

    await saveWorkoutLog(userId, workoutLog);
    setIsSaving(false);
  }, [day, workout, userId, exerciseLogs]);

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
          />
        ))}
      </main>

      {/* Finish workout button */}
      {completedCount === workout.exercises.length && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-border">
          <div className="max-w-3xl mx-auto">
            <Link
              href="/dashboard"
              className="block w-full bg-success hover:bg-success/90 text-white font-semibold py-4 rounded-xl text-center transition-colors"
            >
              Workout Complete!
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
