// Storage utilities for workout logs
// Uses API routes that connect to Neon Postgres database

export interface SetLog {
  reps: number;
  weight: number;
}

export interface ExerciseLog {
  exerciseId: string;
  sets: SetLog[];
  notes: string;
  completedAt: string;
}

export interface WorkoutLog {
  day: string;
  date: string;
  exercises: ExerciseLog[];
}

export interface HistoryEntry {
  day: string;
  date: string;
  exercises_logged: number;
}

const USER_KEY = "goach_selected_user";

// Save workout log to database
export async function saveWorkoutLog(
  userId: string,
  log: WorkoutLog
): Promise<boolean> {
  try {
    const response = await fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...log }),
    });
    return response.ok;
  } catch (error) {
    console.error("Error saving workout log:", error);
    return false;
  }
}

// Get the most recent log for a specific exercise
export async function getLastExerciseLog(
  userId: string,
  exerciseId: string
): Promise<ExerciseLog | null> {
  try {
    const response = await fetch(
      `/api/logs?userId=${encodeURIComponent(userId)}&exerciseId=${encodeURIComponent(exerciseId)}&lastOnly=true`
    );
    if (!response.ok) return null;

    const data = await response.json();
    if (!data) return null;

    return {
      exerciseId: data.exercise_id,
      sets: typeof data.sets === "string" ? JSON.parse(data.sets) : data.sets,
      notes: data.notes || "",
      completedAt: data.completed_at,
    };
  } catch (error) {
    console.error("Error fetching last exercise log:", error);
    return null;
  }
}

// Get today's workout log for a specific day
export async function getTodayWorkoutLog(
  userId: string,
  day: string
): Promise<WorkoutLog | null> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const response = await fetch(
      `/api/logs?userId=${encodeURIComponent(userId)}&day=${encodeURIComponent(day)}&date=${today}`
    );
    if (!response.ok) return null;

    const data = await response.json();
    if (!data || data.length === 0) return null;

    // Transform database rows into WorkoutLog format
    const exercises: ExerciseLog[] = data.map(
      (row: {
        exercise_id: string;
        sets: string | SetLog[];
        notes: string;
        completed_at: string;
      }) => ({
        exerciseId: row.exercise_id,
        sets: typeof row.sets === "string" ? JSON.parse(row.sets) : row.sets,
        notes: row.notes || "",
        completedAt: row.completed_at,
      })
    );

    return { day, date: today, exercises };
  } catch (error) {
    console.error("Error fetching today's workout log:", error);
    return null;
  }
}

// Get workout stats (count of unique workout days)
export async function getWorkoutStats(
  userId: string
): Promise<{
  todayCount: number;
  totalSessions: number;
}> {
  try {
    const response = await fetch(
      `/api/logs?userId=${encodeURIComponent(userId)}`
    );
    if (!response.ok) return { todayCount: 0, totalSessions: 0 };

    const data = await response.json();
    const today = new Date().toISOString().split("T")[0];

    const todayCount = data.filter(
      (row: { date: string }) => row.date === today
    ).length;
    const totalSessions = data.length;

    return { todayCount, totalSessions };
  } catch (error) {
    console.error("Error fetching workout stats:", error);
    return { todayCount: 0, totalSessions: 0 };
  }
}

// Check if a specific day was completed today
export async function getDayCompletionStatus(
  userId: string
): Promise<Record<string, boolean>> {
  try {
    const response = await fetch(
      `/api/logs?userId=${encodeURIComponent(userId)}`
    );
    if (!response.ok) return {};

    const data = await response.json();
    const today = new Date().toISOString().split("T")[0];

    const completed: Record<string, boolean> = {};
    data.forEach((row: { day: string; date: string }) => {
      if (row.date === today) {
        completed[row.day] = true;
      }
    });

    return completed;
  } catch (error) {
    console.error("Error fetching completion status:", error);
    return {};
  }
}

// Get workout history for a user
export async function getWorkoutHistory(
  userId: string
): Promise<HistoryEntry[]> {
  try {
    const response = await fetch(
      `/api/logs?userId=${encodeURIComponent(userId)}&history=true`
    );
    if (!response.ok) return [];

    const data = await response.json();
    return data.map((row: { day: string; date: string; exercises_logged: string }) => ({
      day: row.day,
      date: row.date,
      exercises_logged: parseInt(row.exercises_logged) || 0,
    }));
  } catch (error) {
    console.error("Error fetching workout history:", error);
    return [];
  }
}

// Selected user helpers
export function getSelectedUser(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_KEY);
}

export function setSelectedUser(userId: string): void {
  localStorage.setItem(USER_KEY, userId);
}

export function clearSelectedUser(): void {
  localStorage.removeItem(USER_KEY);
}
