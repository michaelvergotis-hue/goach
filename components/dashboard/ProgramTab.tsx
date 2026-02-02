"use client";

import { getAllPhases, getPhaseWorkouts } from "@/lib/program";
import { WorkoutDayCard } from "./WorkoutDayCard";
import { Group } from "./types";

interface ProgramTabProps {
  selectedPhase: string;
  selectedWeek: number;
  setSelectedPhase: (phase: string) => void;
  setSelectedWeek: (week: number) => void;
  showProgramSelector: boolean;
  setShowProgramSelector: (show: boolean) => void;
  sessionStatuses: Record<string, { status: string; date: string }>;
  groups: Group[];
  onMarkMissed: (day: string, e: React.MouseEvent) => void;
  onRevert: (day: string, e: React.MouseEvent) => void;
  onShare: (day: string, workout: { name: string; focus: string; exercises: { id: string }[] }, e: React.MouseEvent) => void;
}

export function ProgramTab({
  selectedPhase,
  selectedWeek,
  setSelectedPhase,
  setSelectedWeek,
  showProgramSelector,
  setShowProgramSelector,
  sessionStatuses,
  groups,
  onMarkMissed,
  onRevert,
  onShare,
}: ProgramTabProps) {
  const phases = getAllPhases();
  const currentPhase = phases.find((p) => p.id === selectedPhase);
  const workouts = getPhaseWorkouts(selectedPhase);

  const getDayStatus = (day: string): "completed" | "missed" | null => {
    const key = `p${selectedPhase}-w${selectedWeek}-d${day}`;
    return (sessionStatuses[key]?.status as "completed" | "missed" | null) || null;
  };

  const completedDaysInWeek = workouts.filter(
    (w) => getDayStatus(w.day) === "completed"
  ).length;
  const missedDaysInWeek = workouts.filter(
    (w) => getDayStatus(w.day) === "missed"
  ).length;
  const doneDaysInWeek = completedDaysInWeek + missedDaysInWeek;

  const totalWeeks = phases.reduce((acc, p) => acc + p.phase.weeks, 0);
  const currentWeekNumber =
    phases
      .slice(0, parseInt(selectedPhase) - 1)
      .reduce((acc, p) => acc + p.phase.weeks, 0) + selectedWeek;

  return (
    <div className="flex flex-col">
      {/* Program Selector */}
      <div className="mb-6">
        <button
          onClick={() => setShowProgramSelector(!showProgramSelector)}
          className="w-full group"
        >
          <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border hover:border-accent/30 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-accent">
                  {selectedPhase}
                </span>
              </div>
              <div className="text-left">
                <p className="text-xs text-muted uppercase tracking-wider">
                  Current Program
                </p>
                <h2 className="text-lg font-bold text-foreground">
                  {currentPhase?.phase.name}{" "}
                  <span className="text-muted font-normal">·</span>{" "}
                  <span className="text-accent">Week {selectedWeek}</span>
                </h2>
                <p className="text-sm text-muted">
                  {currentPhase?.phase.description} Focus
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-muted">Progress</p>
                <p className="text-sm font-semibold text-foreground">
                  Week {currentWeekNumber}/{totalWeeks}
                </p>
              </div>
              <svg
                className={`w-5 h-5 text-muted transition-transform ${
                  showProgramSelector ? "rotate-180" : ""
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

        {showProgramSelector && (
          <div className="mt-3 p-4 rounded-2xl bg-card border border-border">
            <div className="mb-4">
              <p className="text-xs text-muted uppercase tracking-wider mb-3 px-1">
                Select Phase
              </p>
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
                    <span
                      className={`text-xs ${
                        selectedPhase === id ? "text-white/80" : "text-muted"
                      }`}
                    >
                      {phase.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wider mb-3 px-1">
                Select Week
              </p>
              <div className="grid grid-cols-4 gap-2">
                {currentPhase &&
                  Array.from(
                    { length: currentPhase.phase.weeks },
                    (_, i) => i + 1
                  ).map((week) => (
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

      {/* Week Header */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-foreground">This Week</h3>
          <p className="text-sm text-muted">
            {completedDaysInWeek} completed
            {missedDaysInWeek > 0 && `, ${missedDaysInWeek} skipped`}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {workouts.map(({ day }) => {
            const status = getDayStatus(day);
            return (
              <div
                key={day}
                className={`w-2 h-2 rounded-full transition-colors ${
                  status === "completed"
                    ? "bg-success"
                    : status === "missed"
                      ? "bg-muted"
                      : "bg-border"
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Week Complete Banner */}
      {doneDaysInWeek === workouts.length && (
        <div className="mb-4 p-4 bg-success/10 border border-success/30 rounded-2xl text-center">
          <p className="text-success font-semibold">Week Complete!</p>
          <p className="text-sm text-muted mt-1">
            {completedDaysInWeek} workouts completed
          </p>
        </div>
      )}

      {/* Workout Cards */}
      <div className="space-y-3">
        {workouts.map(({ day, workout }) => (
          <WorkoutDayCard
            key={day}
            day={day}
            workout={workout}
            status={getDayStatus(day)}
            selectedPhase={selectedPhase}
            selectedWeek={selectedWeek}
            groups={groups}
            onMarkMissed={onMarkMissed}
            onRevert={onRevert}
            onShare={onShare}
          />
        ))}
      </div>
    </div>
  );
}
