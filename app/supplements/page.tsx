"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { getFriendById, Friend } from "@/lib/friends";

interface Supplement {
  name: string;
  dosage: string;
}

interface DaySchedule {
  day_of_week: number;
  reminder_time: string;
  supplements: Supplement[];
  enabled: boolean;
}

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function SupplementsPage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [friend, setFriend] = useState<Friend | null>(null);
  const [schedules, setSchedules] = useState<DaySchedule[]>([]);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{
    time: string;
    supplements: Supplement[];
  }>({ time: "08:00", supplements: [] });
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }

    const userId = session?.user?.friendId;
    if (!userId) {
      signOut({ callbackUrl: "/" });
      return;
    }

    const friendData = getFriendById(userId);
    if (!friendData) {
      signOut({ callbackUrl: "/" });
      return;
    }

    setFriend(friendData);
    fetchSchedules(userId);
  }, [status, session, router]);

  const fetchSchedules = async (userId: string) => {
    try {
      const response = await fetch(
        `/api/supplements?userId=${encodeURIComponent(userId)}&type=schedule`
      );
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditDay = (dayOfWeek: number) => {
    const existing = schedules.find((s) => s.day_of_week === dayOfWeek);
    if (existing) {
      setEditForm({
        time: existing.reminder_time?.slice(0, 5) || "08:00",
        supplements: existing.supplements || [],
      });
    } else {
      setEditForm({ time: "08:00", supplements: [] });
    }
    setEditingDay(dayOfWeek);
  };

  const handleAddSupplement = () => {
    setEditForm({
      ...editForm,
      supplements: [...editForm.supplements, { name: "", dosage: "" }],
    });
  };

  const handleRemoveSupplement = (index: number) => {
    setEditForm({
      ...editForm,
      supplements: editForm.supplements.filter((_, i) => i !== index),
    });
  };

  const handleSupplementChange = (
    index: number,
    field: "name" | "dosage",
    value: string
  ) => {
    const newSupplements = [...editForm.supplements];
    newSupplements[index][field] = value;
    setEditForm({ ...editForm, supplements: newSupplements });
  };

  const handleSaveDay = async () => {
    if (editingDay === null || !friend) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/supplements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: friend.id,
          dayOfWeek: editingDay,
          reminderTime: editForm.time,
          supplements: editForm.supplements.filter((s) => s.name.trim()),
          enabled: true,
        }),
      });

      if (response.ok) {
        await fetchSchedules(friend.id);
        setEditingDay(null);
      }
    } catch (error) {
      console.error("Error saving schedule:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearDay = async (dayOfWeek: number) => {
    if (!friend) return;

    try {
      await fetch(
        `/api/supplements?userId=${encodeURIComponent(friend.id)}&dayOfWeek=${dayOfWeek}`,
        { method: "DELETE" }
      );
      await fetchSchedules(friend.id);
    } catch (error) {
      console.error("Error clearing schedule:", error);
    }
  };

  const handleCopyToAll = async () => {
    if (editingDay === null || !friend) return;

    setIsSaving(true);
    try {
      // Save to all days
      for (let day = 0; day < 7; day++) {
        await fetch("/api/supplements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: friend.id,
            dayOfWeek: day,
            reminderTime: editForm.time,
            supplements: editForm.supplements.filter((s) => s.name.trim()),
            enabled: true,
          }),
        });
      }
      await fetchSchedules(friend.id);
      setEditingDay(null);
    } catch (error) {
      console.error("Error copying to all days:", error);
    } finally {
      setIsSaving(false);
    }
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
        <div className="px-4 py-4 max-w-2xl mx-auto flex items-center justify-between">
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
          <h1 className="text-lg font-bold">Supplement Schedule</h1>
          <div className="w-12" />
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 max-w-2xl mx-auto">
        <p className="text-muted mb-6">
          Set up your weekly supplement reminder. You&apos;ll get a push notification
          at the scheduled time if you haven&apos;t marked your supps as taken.
        </p>

        {/* Weekly schedule */}
        <div className="space-y-3">
          {DAYS.map((dayName, dayIndex) => {
            const schedule = schedules.find((s) => s.day_of_week === dayIndex);
            const hasSupplements = (schedule?.supplements?.length ?? 0) > 0;

            return (
              <div
                key={dayIndex}
                className="bg-card border border-border rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{dayName}</h3>
                    {hasSupplements && schedule ? (
                      <div className="mt-1">
                        <p className="text-xs text-muted">
                          {schedule.reminder_time?.slice(0, 5)} •{" "}
                          {schedule.supplements.length} supplement
                          {schedule.supplements.length !== 1 ? "s" : ""}
                        </p>
                        <p className="text-sm text-accent mt-1">
                          {schedule.supplements.map((s) => s.name).join(", ")}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted mt-1">Not scheduled</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleEditDay(dayIndex)}
                    className="px-3 py-1 bg-background border border-border rounded-lg text-sm hover:bg-card-hover transition-colors"
                  >
                    {hasSupplements ? "Edit" : "Add"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Edit Modal */}
      {editingDay !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{DAYS[editingDay]}</h2>

            {/* Time picker */}
            <div className="mb-4">
              <label className="block text-sm text-muted mb-2">
                Reminder Time
              </label>
              <input
                type="time"
                value={editForm.time}
                onChange={(e) =>
                  setEditForm({ ...editForm, time: e.target.value })
                }
                className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-accent"
              />
            </div>

            {/* Supplements list */}
            <div className="mb-4">
              <label className="block text-sm text-muted mb-2">
                Supplements
              </label>
              <div className="space-y-2">
                {editForm.supplements.map((supp, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={supp.name}
                      onChange={(e) =>
                        handleSupplementChange(index, "name", e.target.value)
                      }
                      placeholder="Name (e.g., Creatine)"
                      className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                    />
                    <input
                      type="text"
                      value={supp.dosage}
                      onChange={(e) =>
                        handleSupplementChange(index, "dosage", e.target.value)
                      }
                      placeholder="Dosage"
                      className="w-24 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                    />
                    <button
                      onClick={() => handleRemoveSupplement(index)}
                      className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg"
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={handleAddSupplement}
                className="mt-2 text-accent text-sm hover:underline flex items-center gap-1"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add supplement
              </button>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingDay(null)}
                  className="flex-1 py-3 bg-background border border-border rounded-xl font-medium hover:bg-card-hover transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDay}
                  disabled={isSaving}
                  className="flex-1 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>

              {editForm.supplements.length > 0 && (
                <button
                  onClick={handleCopyToAll}
                  disabled={isSaving}
                  className="w-full py-2 text-accent text-sm hover:underline"
                >
                  Copy to all days
                </button>
              )}

              {schedules.find((s) => s.day_of_week === editingDay) && (
                <button
                  onClick={() => {
                    handleClearDay(editingDay);
                    setEditingDay(null);
                  }}
                  className="w-full py-2 text-red-400 text-sm hover:underline"
                >
                  Clear this day
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
