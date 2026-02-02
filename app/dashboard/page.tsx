"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  isAuthenticated,
  setAuthenticated,
  getWorkoutStats,
  getDayCompletionStatus,
} from "@/lib/storage";
import { getAllDays } from "@/lib/program";

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [workoutDays, setWorkoutDays] = useState<ReturnType<typeof getAllDays>>(
    []
  );
  const [todayLogs, setTodayLogs] = useState<Record<string, boolean>>({});
  const [stats, setStats] = useState({ todayCount: 0, totalSessions: 0 });
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/");
      return;
    }

    async function loadData() {
      setWorkoutDays(getAllDays());

      // Fetch completion status and stats from database
      const [completionStatus, workoutStats] = await Promise.all([
        getDayCompletionStatus(),
        getWorkoutStats(),
      ]);

      setTodayLogs(completionStatus);
      setStats(workoutStats);
      setIsLoading(false);
    }

    loadData();
  }, [router]);

  const handleLogout = () => {
    setAuthenticated(false);
    router.replace("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg border-b border-border z-10">
        <div className="px-4 py-4 flex items-center justify-between max-w-lg mx-auto">
          <h1 className="text-xl font-bold">Goach</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 max-w-lg mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Select Workout</h2>
          <p className="text-muted mt-1">Choose your training day</p>
        </div>

        {/* Workout days */}
        <div className="space-y-3">
          {workoutDays.map(({ day, workout }) => (
            <Link
              key={day}
              href={`/workout/${day}`}
              className="block bg-card hover:bg-card-hover border border-border rounded-xl p-4 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{workout.name}</h3>
                    {todayLogs[day] && (
                      <span className="px-2 py-0.5 bg-success/20 text-success text-xs font-medium rounded-full">
                        Done today
                      </span>
                    )}
                  </div>
                  <p className="text-muted text-sm mt-0.5">{workout.focus}</p>
                  <p className="text-muted text-xs mt-1">
                    {workout.exercises.length} exercises
                  </p>
                </div>
                <svg
                  className="w-5 h-5 text-muted"
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
              </div>
            </Link>
          ))}
        </div>

        {/* Stats summary */}
        <div className="mt-8 p-4 bg-card rounded-xl border border-border">
          <h3 className="font-semibold mb-3">Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-bold text-accent">{stats.todayCount}</p>
              <p className="text-sm text-muted">Workouts today</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalSessions}</p>
              <p className="text-sm text-muted">Total sessions</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
