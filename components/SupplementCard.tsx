"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Supplement {
  name: string;
  dosage: string;
}

interface TodayData {
  schedule: {
    day_of_week: number;
    reminder_time: string;
    supplements: Supplement[];
    enabled: boolean;
  } | null;
  log: {
    taken_at: string | null;
    skipped: boolean;
  } | null;
  date: string;
}

export function SupplementCard({ userId }: { userId: string }) {
  const [data, setData] = useState<TodayData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchToday = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/supplements?userId=${encodeURIComponent(userId)}&type=today`
      );
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error("Error fetching supplements:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchToday();
  }, [fetchToday]);

  const handleMarkTaken = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch("/api/supplements", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, taken: true }),
      });
      if (response.ok) {
        await fetchToday();
      }
    } catch (error) {
      console.error("Error marking taken:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUnmark = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch("/api/supplements", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, taken: false, skipped: false }),
      });
      if (response.ok) {
        await fetchToday();
      }
    } catch (error) {
      console.error("Error unmarking:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-card rounded-xl border border-border">
        <h3 className="font-semibold mb-3">Supplements</h3>
        <div className="flex justify-center py-4">
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const hasTaken = data?.log?.taken_at != null;
  const hasSchedule = data?.schedule && data.schedule.supplements?.length > 0;

  return (
    <div className="p-4 bg-card rounded-xl border border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Today&apos;s Supplements</h3>
        <Link
          href="/supplements"
          className="text-xs text-accent hover:underline"
        >
          Edit schedule
        </Link>
      </div>

      {!hasSchedule ? (
        <div className="text-center py-4">
          <p className="text-muted text-sm mb-3">No supplements scheduled for today</p>
          <Link
            href="/supplements"
            className="text-accent text-sm hover:underline"
          >
            Set up your schedule
          </Link>
        </div>
      ) : (
        <>
          {/* Time */}
          <p className="text-xs text-muted mb-3">
            Reminder at {data?.schedule?.reminder_time?.slice(0, 5) || "08:00"}
          </p>

          {/* Supplements list */}
          <div className="space-y-2 mb-4">
            {data?.schedule?.supplements.map((supp, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-2 rounded-lg ${
                  hasTaken ? "bg-success/10" : "bg-background"
                }`}
              >
                <span className={hasTaken ? "line-through text-muted" : ""}>
                  {supp.name}
                </span>
                <span className={`text-sm ${hasTaken ? "text-muted" : "text-accent"}`}>
                  {supp.dosage}
                </span>
              </div>
            ))}
          </div>

          {/* Action button */}
          {hasTaken ? (
            <button
              onClick={handleUnmark}
              disabled={isUpdating}
              className="w-full py-2 bg-success/20 text-success rounded-lg text-sm font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Taken
              <span className="text-xs text-success/70">(tap to undo)</span>
            </button>
          ) : (
            <button
              onClick={handleMarkTaken}
              disabled={isUpdating}
              className="w-full py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isUpdating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                "Mark as Taken"
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
}
