"use client";

import { Group, WorkoutInfo } from "./types";

interface ShareWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  workout: WorkoutInfo | null;
  groups: Group[];
  selectedGroups: number[];
  onToggleGroup: (groupId: number) => void;
  onShare: () => void;
  isSharing: boolean;
}

export function ShareWorkoutModal({
  isOpen,
  onClose,
  workout,
  groups,
  selectedGroups,
  onToggleGroup,
  onShare,
  isSharing,
}: ShareWorkoutModalProps) {
  if (!isOpen || !workout) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-2">Share Workout</h2>
        <p className="text-muted text-sm mb-4">
          Share your{" "}
          <span className="font-semibold text-foreground">
            {workout.workout.name}
          </span>{" "}
          completion
        </p>

        <p className="text-sm text-muted mb-2">Share to:</p>
        <div className="space-y-2 mb-4">
          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => onToggleGroup(group.id)}
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
            onClick={onClose}
            className="flex-1 py-3 bg-background border border-border rounded-xl font-medium hover:bg-card-hover transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onShare}
            disabled={isSharing || selectedGroups.length === 0}
            className="flex-1 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {isSharing ? "Sharing..." : "Share"}
          </button>
        </div>
      </div>
    </div>
  );
}
