"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getFriendById } from "@/lib/friends";

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

interface Group {
  id: number;
  name: string;
}

export function SupplementCard({ userId }: { userId: string }) {
  const [data, setData] = useState<TodayData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Notify state
  const [groups, setGroups] = useState<Group[]>([]);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [notifyMessage, setNotifyMessage] = useState("");
  const [isSendingNotify, setIsSendingNotify] = useState(false);
  const [notifySent, setNotifySent] = useState(false);

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

  const fetchGroups = useCallback(async () => {
    try {
      const response = await fetch(`/api/groups?userId=${encodeURIComponent(userId)}`);
      if (response.ok) {
        const groupsData = await response.json();
        setGroups(groupsData);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  }, [userId]);

  useEffect(() => {
    fetchToday();
    fetchGroups();
  }, [fetchToday, fetchGroups]);

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
        setNotifySent(false); // Reset notify status when marking taken
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
        setNotifySent(false);
      }
    } catch (error) {
      console.error("Error unmarking:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenNotify = () => {
    setSelectedGroups([]);
    setNotifyMessage("");
    setShowNotifyModal(true);
  };

  const toggleGroup = (groupId: number) => {
    setSelectedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleSendNotify = async () => {
    if (selectedGroups.length === 0) return;

    setIsSendingNotify(true);
    const friend = getFriendById(userId);
    const userName = friend?.name || "Someone";

    try {
      // Send notification to each selected group
      for (const groupId of selectedGroups) {
        await fetch("/api/supplements/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            userName,
            groupId,
            message: notifyMessage.trim(),
          }),
        });
      }
      setShowNotifyModal(false);
      setNotifySent(true);
    } catch (error) {
      console.error("Error sending notification:", error);
    } finally {
      setIsSendingNotify(false);
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
    <>
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

            {/* Action buttons */}
            {hasTaken ? (
              <div className="space-y-2">
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

                {/* Notify button - only show if groups exist */}
                {groups.length > 0 && (
                  <button
                    onClick={handleOpenNotify}
                    disabled={notifySent}
                    className={`w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                      notifySent
                        ? "bg-accent/20 text-accent"
                        : "bg-background border border-border text-foreground hover:bg-card-hover"
                    }`}
                  >
                    {notifySent ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Notified
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        Notify Group
                      </>
                    )}
                  </button>
                )}
              </div>
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

      {/* Notify Modal */}
      {showNotifyModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowNotifyModal(false)}
        >
          <div
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-2">Notify Group</h2>
            <p className="text-muted text-sm mb-4">
              Let your group know you&apos;ve taken your supplements
            </p>

            {/* Message input */}
            <div className="mb-4">
              <label className="text-sm text-muted block mb-2">
                Add a message (optional)
              </label>
              <input
                type="text"
                value={notifyMessage}
                onChange={(e) => setNotifyMessage(e.target.value)}
                placeholder="e.g., Time to take yours too!"
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
              />
            </div>

            {/* Group selection */}
            <p className="text-sm text-muted mb-2">Send to:</p>
            <div className="space-y-2 mb-4">
              {groups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => toggleGroup(group.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                    selectedGroups.includes(group.id)
                      ? "bg-accent/10 border-accent"
                      : "bg-background border-border hover:bg-card-hover"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      selectedGroups.includes(group.id)
                        ? "bg-accent text-white"
                        : "bg-accent/20 text-accent"
                    }`}
                  >
                    {group.name.charAt(0)}
                  </div>
                  <span className="flex-1 text-left">{group.name}</span>
                  {selectedGroups.includes(group.id) && (
                    <svg
                      className="w-5 h-5 text-accent"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowNotifyModal(false)}
                className="flex-1 py-3 bg-background border border-border rounded-xl font-medium hover:bg-card-hover transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendNotify}
                disabled={isSendingNotify || selectedGroups.length === 0}
                className="flex-1 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {isSendingNotify ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
