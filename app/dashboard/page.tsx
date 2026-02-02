"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  getDayCompletionStatus,
} from "@/lib/storage";
import { getAllPhases, getPhaseWorkouts } from "@/lib/program";
import { getFriendById, Friend } from "@/lib/friends";
import { NotificationToggle } from "@/components/NotificationToggle";
import { SupplementCard } from "@/components/SupplementCard";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [friend, setFriend] = useState<Friend | null>(null);
  const [selectedPhase, setSelectedPhase] = useState("1");
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [completionStatus, setCompletionStatus] = useState<Record<string, boolean>>({});
  const router = useRouter();

  const phases = getAllPhases();
  const currentPhase = phases.find(p => p.id === selectedPhase);
  const workouts = getPhaseWorkouts(selectedPhase);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }

    // Get friendId from session (set by NextAuth callback)
    const userId = session?.user?.friendId;
    if (!userId) {
      // This shouldn't happen if auth is set up correctly
      console.error("No friendId in session");
      signOut({ callbackUrl: "/" });
      return;
    }

    const friendData = getFriendById(userId);
    if (!friendData) {
      console.error("Friend not found:", userId);
      signOut({ callbackUrl: "/" });
      return;
    }

    setFriend(friendData);

    async function loadData() {
      // Fetch completion status from database
      const status = await getDayCompletionStatus(userId!);
      setCompletionStatus(status);
      setIsLoading(false);
    }

    loadData();
  }, [status, session, router]);

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  // Check if a specific workout day is complete (format: p{phase}-w{week}-d{day})
  const isDayComplete = (day: string) => {
    const key = `p${selectedPhase}-w${selectedWeek}-d${day}`;
    return completionStatus[key] === true;
  };

  // Count completed days in current week
  const completedDaysInWeek = workouts.filter(w => isDayComplete(w.day)).length;

  if (isLoading || !friend) {
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
        <div className="px-4 py-4 max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center text-accent font-bold">
                {friend.initials}
              </div>
              <div>
                <h1 className="text-lg font-bold">{friend.name}</h1>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 max-w-xl overflow-x-auto">
          <Link
            href="/dashboard"
            className="flex-1 py-2 px-4 bg-accent text-white text-center rounded-lg font-medium whitespace-nowrap"
          >
            Program
          </Link>
          <Link
            href="/feed"
            className="flex-1 py-2 px-4 bg-card text-muted text-center rounded-lg font-medium hover:bg-card-hover transition-colors whitespace-nowrap"
          >
            Feed
          </Link>
          <Link
            href="/history"
            className="flex-1 py-2 px-4 bg-card text-muted text-center rounded-lg font-medium hover:bg-card-hover transition-colors whitespace-nowrap"
          >
            History
          </Link>
          {friend.isAdmin && (
            <Link
              href="/admin"
              className="flex-1 py-2 px-4 bg-card text-muted text-center rounded-lg font-medium hover:bg-card-hover transition-colors whitespace-nowrap"
            >
              Admin
            </Link>
          )}
        </div>

        {/* Desktop: Two column layout */}
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Main content - workout program */}
          <div className="lg:col-span-2">
            {/* Phase Tabs */}
            <div className="mb-4">
              <div className="flex gap-2">
                {phases.map(({ id, phase }) => (
                  <button
                    key={id}
                    onClick={() => {
                      setSelectedPhase(id);
                      setSelectedWeek(1);
                    }}
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                      selectedPhase === id
                        ? "bg-accent text-white"
                        : "bg-card text-muted hover:bg-card-hover border border-border"
                    }`}
                  >
                    <div className="text-sm">{phase.name}</div>
                    <div className={`text-xs mt-0.5 ${selectedPhase === id ? "text-white/70" : "text-muted"}`}>
                      {phase.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Week Selector */}
            <div className="mb-6">
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {currentPhase && Array.from({ length: currentPhase.phase.weeks }, (_, i) => i + 1).map((week) => (
                  <button
                    key={week}
                    onClick={() => setSelectedWeek(week)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                      selectedWeek === week
                        ? "bg-accent/20 text-accent border-2 border-accent"
                        : "bg-card text-muted hover:bg-card-hover border border-border"
                    }`}
                  >
                    Week {week}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Phase/Week Header */}
            <div className="mb-4">
              <h2 className="text-2xl font-bold">
                {currentPhase?.phase.name} - Week {selectedWeek}
              </h2>
              <p className="text-muted mt-1">
                {completedDaysInWeek}/{workouts.length} days completed
              </p>
            </div>

            {/* Progress bar for the week */}
            <div className="mb-6">
              <div className="h-2 bg-card rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${(completedDaysInWeek / workouts.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Workout days */}
            <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:grid-cols-1 xl:grid-cols-2">
              {workouts.map(({ day, workout }) => {
                const isComplete = isDayComplete(day);
                return (
                  <Link
                    key={day}
                    href={`/workout/${selectedPhase}/${selectedWeek}/${day}`}
                    className={`block rounded-xl p-4 transition-all border ${
                      isComplete
                        ? "bg-success/10 border-success/50 hover:bg-success/20"
                        : "bg-card hover:bg-card-hover border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{workout.name}</h3>
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
                );
              })}
            </div>
          </div>

          {/* Sidebar - supplements and notifications */}
          <div className="mt-8 lg:mt-0 space-y-4">
            {/* Supplements */}
            <SupplementCard userId={friend.id} />

            {/* Notifications */}
            <div className="p-4 bg-card rounded-xl border border-border">
              <h3 className="font-semibold mb-3">Notifications</h3>
              <NotificationToggle userId={friend.id} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
