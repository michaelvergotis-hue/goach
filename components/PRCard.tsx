"use client";

import { useEffect, useState } from "react";
import { getExerciseName } from "@/lib/program";

interface PRRecord {
  exerciseId: string;
  weight: number;
  reps: number;
  date: string;
  estimated1RM: number;
}

interface PRCardProps {
  userId: string;
  className?: string;
}

export function PRCard({ userId, className = "" }: PRCardProps) {
  const [prs, setPrs] = useState<PRRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPRs() {
      try {
        const response = await fetch(
          `/api/prs?userId=${encodeURIComponent(userId)}&limit=5`
        );
        if (response.ok) {
          const data = await response.json();
          setPrs(data);
        }
      } catch (error) {
        console.error("Error fetching PRs:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPRs();
  }, [userId]);

  if (isLoading) {
    return (
      <div className={`p-4 bg-card rounded-2xl border border-border ${className}`}>
        <h3 className="font-semibold mb-3 text-foreground flex items-center gap-2">
          <span className="text-lg">🏆</span>
          Personal Records
        </h3>
        <div className="flex items-center justify-center py-6">
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-card rounded-2xl border border-border ${className}`}>
      <h3 className="font-semibold mb-3 text-foreground flex items-center gap-2">
        <span className="text-lg">🏆</span>
        Personal Records
      </h3>

      {prs.length === 0 ? (
        <p className="text-sm text-muted py-4 text-center">
          No PRs yet. Start lifting!
        </p>
      ) : (
        <div className="space-y-3">
          {prs.map((pr, index) => (
            <div
              key={pr.exerciseId}
              className="flex items-center gap-3"
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                  index === 0
                    ? "bg-yellow-500/20 text-yellow-500"
                    : index === 1
                    ? "bg-gray-400/20 text-gray-400"
                    : index === 2
                    ? "bg-amber-600/20 text-amber-600"
                    : "bg-accent/10 text-accent"
                }`}
              >
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {getExerciseName(pr.exerciseId)}
                </p>
                <p className="text-xs text-muted">
                  {pr.weight}kg × {pr.reps} reps
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-accent">
                  {pr.estimated1RM}kg
                </p>
                <p className="text-xs text-muted">est. 1RM</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
