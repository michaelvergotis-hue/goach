"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  getSelectedUser,
  clearSelectedUser,
  getWorkoutHistory,
  HistoryEntry,
} from "@/lib/storage";
import { getFriendById, Friend } from "@/lib/friends";
import { getWorkoutDay } from "@/lib/program";

export default function HistoryPage() {
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [friend, setFriend] = useState<Friend | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }

    const userId = getSelectedUser();
    if (!userId) {
      router.replace("/select");
      return;
    }

    const friendData = getFriendById(userId);
    if (!friendData) {
      router.replace("/select");
      return;
    }

    setFriend(friendData);

    async function loadData() {
      const historyData = await getWorkoutHistory(userId!);
      setHistory(historyData);
      setIsLoading(false);
    }

    loadData();
  }, [status, router]);

  const handleLogout = () => {
    clearSelectedUser();
    signOut({ callbackUrl: "/" });
  };

  const handleSwitchUser = () => {
    clearSelectedUser();
    router.replace("/select");
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split("T")[0]) {
      return "Today";
    }
    if (dateStr === yesterday.toISOString().split("T")[0]) {
      return "Yesterday";
    }

    return date.toLocaleDateString("en-AU", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

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
                <button
                  onClick={handleSwitchUser}
                  className="text-xs text-muted hover:text-accent transition-colors"
                >
                  Switch user
                </button>
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
        {/* Tabs */}
        <div className="flex gap-2 mb-6 max-w-lg">
          <Link
            href="/dashboard"
            className="flex-1 py-2 px-4 bg-card text-muted text-center rounded-lg font-medium hover:bg-card-hover transition-colors"
          >
            Program
          </Link>
          <Link
            href="/history"
            className="flex-1 py-2 px-4 bg-accent text-white text-center rounded-lg font-medium"
          >
            History
          </Link>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold">Workout History</h2>
          <p className="text-muted mt-1">Your past sessions</p>
        </div>

        {/* History list - responsive grid */}
        {history.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted">No workouts logged yet</p>
            <Link
              href="/dashboard"
              className="inline-block mt-4 text-accent hover:underline"
            >
              Start your first workout
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map((entry, index) => {
              const workout = getWorkoutDay(entry.day);
              return (
                <div
                  key={`${entry.day}-${entry.date}-${index}`}
                  className="bg-card border border-border rounded-xl p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted">{formatDate(entry.date)}</p>
                      <h3 className="font-semibold text-lg mt-1">
                        {workout?.name || `Day ${entry.day}`}
                      </h3>
                      <p className="text-sm text-muted">
                        {workout?.focus || "Workout"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-accent">
                        {entry.exercises_logged}
                      </p>
                      <p className="text-xs text-muted">exercises</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
