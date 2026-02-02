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
  const [showProgramSelector, setShowProgramSelector] = useState(false);
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

    const userId = session?.user?.friendId;
    if (!userId) {
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
      const status = await getDayCompletionStatus(userId!);
      setCompletionStatus(status);
      setIsLoading(false);
    }

    loadData();
  }, [status, session, router]);

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  const isDayComplete = (day: string) => {
    const key = `p${selectedPhase}-w${selectedWeek}-d${day}`;
    return completionStatus[key] === true;
  };

  const completedDaysInWeek = workouts.filter(w => isDayComplete(w.day)).length;

  // Calculate overall program progress
  const totalWeeks = phases.reduce((acc, p) => acc + p.phase.weeks, 0);
  const currentWeekNumber = phases
    .slice(0, parseInt(selectedPhase) - 1)
    .reduce((acc, p) => acc + p.phase.weeks, 0) + selectedWeek;

  if (isLoading || !friend) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8">
      {/* Minimal Header */}
      <header className="px-5 pt-6 pb-4 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-accent to-accent/60 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-accent/20">
              {friend.initials}
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wider font-medium">Welcome back</p>
              <h1 className="text-lg font-bold text-foreground">{friend.name}</h1>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-muted hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-card"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="px-5 max-w-6xl mx-auto">
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-2 mb-6">
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-lg bg-accent/10 text-accent font-medium text-sm"
          >
            Program
          </Link>
          <Link
            href="/feed"
            className="px-4 py-2 rounded-lg text-muted hover:text-foreground hover:bg-card font-medium text-sm transition-colors"
          >
            Feed
          </Link>
          <Link
            href="/history"
            className="px-4 py-2 rounded-lg text-muted hover:text-foreground hover:bg-card font-medium text-sm transition-colors"
          >
            History
          </Link>
          {friend.isAdmin && (
            <Link
              href="/admin"
              className="px-4 py-2 rounded-lg text-muted hover:text-foreground hover:bg-card font-medium text-sm transition-colors"
            >
              Admin
            </Link>
          )}
        </nav>

        {/* Program Selector - Collapsed by default */}
        <div className="mb-6">
          <button
            onClick={() => setShowProgramSelector(!showProgramSelector)}
            className="w-full group"
          >
            <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border hover:border-accent/30 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-accent">{selectedPhase}</span>
                </div>
                <div className="text-left">
                  <p className="text-xs text-muted uppercase tracking-wider">Current Program</p>
                  <h2 className="text-lg font-bold text-foreground">
                    {currentPhase?.phase.name} <span className="text-muted font-normal">·</span> <span className="text-accent">Week {selectedWeek}</span>
                  </h2>
                  <p className="text-sm text-muted">{currentPhase?.phase.description} Focus</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-muted">Progress</p>
                  <p className="text-sm font-semibold text-foreground">Week {currentWeekNumber}/{totalWeeks}</p>
                </div>
                <svg
                  className={`w-5 h-5 text-muted transition-transform ${showProgramSelector ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </button>

          {/* Expanded Program Selector */}
          {showProgramSelector && (
            <div className="mt-3 p-4 rounded-2xl bg-card border border-border animate-in slide-in-from-top-2 duration-200">
              {/* Phase Selection */}
              <div className="mb-4">
                <p className="text-xs text-muted uppercase tracking-wider mb-3 px-1">Select Phase</p>
                <div className="grid grid-cols-3 gap-2">
                  {phases.map(({ id, phase }) => (
                    <button
                      key={id}
                      onClick={() => {
                        setSelectedPhase(id);
                        setSelectedWeek(1);
                      }}
                      className={`p-3 rounded-xl text-center transition-all ${
                        selectedPhase === id
                          ? "bg-accent text-white shadow-lg shadow-accent/25"
                          : "bg-background hover:bg-card-hover border border-border"
                      }`}
                    >
                      <span className="text-2xl font-bold block">{id}</span>
                      <span className={`text-xs ${selectedPhase === id ? 'text-white/80' : 'text-muted'}`}>
                        {phase.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Week Selection */}
              <div>
                <p className="text-xs text-muted uppercase tracking-wider mb-3 px-1">Select Week</p>
                <div className="grid grid-cols-4 gap-2">
                  {currentPhase && Array.from({ length: currentPhase.phase.weeks }, (_, i) => i + 1).map((week) => (
                    <button
                      key={week}
                      onClick={() => {
                        setSelectedWeek(week);
                        setShowProgramSelector(false);
                      }}
                      className={`py-3 px-4 rounded-xl font-semibold transition-all ${
                        selectedWeek === week
                          ? "bg-accent/20 text-accent border-2 border-accent"
                          : "bg-background hover:bg-card-hover border border-border text-foreground"
                      }`}
                    >
                      {week}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section Headers Row */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-6 mb-4">
          <div className="lg:col-span-8">
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-xl font-bold text-foreground">This Week</h3>
                <p className="text-sm text-muted">{completedDaysInWeek} of {workouts.length} workouts complete</p>
              </div>
              <div className="flex items-center gap-1">
                {workouts.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i < completedDaysInWeek ? 'bg-accent' : 'bg-border'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-6 lg:items-start">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Workout Cards */}
            <div className="space-y-3">
              {workouts.map(({ day, workout }, index) => {
                const isComplete = isDayComplete(day);
                return (
                  <Link
                    key={day}
                    href={`/workout/${selectedPhase}/${selectedWeek}/${day}`}
                    className={`group block rounded-2xl transition-all duration-200 ${
                      isComplete
                        ? "bg-success/5 hover:bg-success/10"
                        : "bg-card hover:bg-card-hover"
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="p-4 flex items-center gap-4">
                      {/* Day Number */}
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                        isComplete
                          ? 'bg-success/20'
                          : 'bg-background group-hover:bg-accent/10'
                      }`}>
                        {isComplete ? (
                          <svg className="w-7 h-7 text-success" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <span className="text-2xl font-bold text-muted group-hover:text-accent transition-colors">{day}</span>
                        )}
                      </div>

                      {/* Workout Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-semibold text-base ${isComplete ? 'text-success' : 'text-foreground'}`}>
                            {workout.focus.split('(')[0].trim()}
                          </h4>
                        </div>
                        <p className="text-sm text-muted truncate">
                          {workout.focus.includes('(') ? workout.focus.match(/\((.*?)\)/)?.[1] : workout.focus}
                        </p>
                        <p className="text-xs text-muted mt-1">{workout.exercises.length} exercises</p>
                      </div>

                      {/* Arrow */}
                      <svg
                        className={`w-5 h-5 flex-shrink-0 transition-all ${
                          isComplete ? 'text-success' : 'text-muted group-hover:text-accent group-hover:translate-x-1'
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="lg:sticky lg:top-6 space-y-4">
              <SupplementCard userId={friend.id} />

              <div className="p-4 bg-card rounded-2xl border border-border">
                <h3 className="font-semibold mb-3 text-foreground">Notifications</h3>
                <NotificationToggle userId={friend.id} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border lg:hidden z-50">
        <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
          <Link
            href="/dashboard"
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl bg-accent/10"
          >
            <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-xs font-medium text-accent">Program</span>
          </Link>
          <Link
            href="/feed"
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-card-hover transition-colors"
          >
            <svg className="w-6 h-6 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
            <span className="text-xs font-medium text-muted">Feed</span>
          </Link>
          <Link
            href="/history"
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-card-hover transition-colors"
          >
            <svg className="w-6 h-6 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium text-muted">History</span>
          </Link>
          {friend.isAdmin && (
            <Link
              href="/admin"
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-card-hover transition-colors"
            >
              <svg className="w-6 h-6 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs font-medium text-muted">Admin</span>
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
