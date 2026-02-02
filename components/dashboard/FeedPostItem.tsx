"use client";

import { FeedPost, formatTime } from "./types";
import { getExerciseName } from "@/lib/program";
import { friends } from "@/lib/friends";
import { ExerciseLog } from "@/lib/storage";

interface FeedPostItemProps {
  post: FeedPost;
  currentUserId: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  exerciseDetails: ExerciseLog[] | null;
  isLoadingDetails: boolean;
}

export function FeedPostItem({
  post,
  currentUserId,
  isExpanded,
  onToggleExpand,
  exerciseDetails,
  isLoadingDetails,
}: FeedPostItemProps) {
  const isOwnPost = post.user_id === currentUserId;
  const userName = friends.find((f) => f.id === post.user_id)?.name || post.user_id;
  const initials = friends.find((f) => f.id === post.user_id)?.initials || "?";

  if (post.post_type === "chat") {
    return (
      <div className={`flex gap-2 ${isOwnPost ? "flex-row-reverse" : ""}`}>
        <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center text-accent text-xs font-bold flex-shrink-0">
          {initials}
        </div>
        <div className={`max-w-[75%] ${isOwnPost ? "items-end" : ""}`}>
          {!isOwnPost && <p className="text-xs text-muted mb-1">{userName}</p>}
          <div
            className={`px-3 py-2 rounded-2xl ${
              isOwnPost
                ? "bg-accent text-white rounded-br-sm"
                : "bg-card border border-border rounded-bl-sm"
            }`}
          >
            <p className="text-sm">{post.content.message}</p>
          </div>
          <p
            className={`text-xs text-muted mt-1 ${isOwnPost ? "text-right" : ""}`}
          >
            {formatTime(post.created_at)}
          </p>
        </div>
      </div>
    );
  }

  if (post.post_type === "workout") {
    return (
      <div className="flex gap-2">
        <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center text-success text-xs flex-shrink-0">
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
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div className="flex-1">
          <button
            onClick={onToggleExpand}
            className="w-full text-left bg-success/10 border border-success/20 rounded-xl p-3 hover:bg-success/20 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">
                  <span className="font-semibold">{userName}</span> completed{" "}
                  <span className="font-semibold">{post.content.workoutName}</span>
                </p>
                <p className="text-xs text-muted mt-1">
                  {post.content.exerciseCount} exercises
                </p>
              </div>
              <svg
                className={`w-4 h-4 text-muted transition-transform ${
                  isExpanded ? "rotate-180" : ""
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
          </button>

          {/* Expanded workout details */}
          {isExpanded && (
            <div className="mt-2 bg-card border border-border rounded-xl p-3">
              {isLoadingDetails ? (
                <div className="flex justify-center py-3">
                  <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              ) : exerciseDetails && exerciseDetails.length > 0 ? (
                <div className="space-y-2">
                  {exerciseDetails.map((exercise, i) => (
                    <div key={i} className="bg-background rounded-lg p-2">
                      <p className="font-medium text-sm">
                        {getExerciseName(exercise.exerciseId)}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {exercise.sets
                          .filter((s) => s.weight > 0 && s.reps > 0)
                          .map((set, j) => (
                            <span
                              key={j}
                              className="text-xs bg-card px-2 py-0.5 rounded"
                            >
                              {set.weight}kg × {set.reps}
                            </span>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted text-center py-2">
                  No details available
                </p>
              )}
            </div>
          )}

          <p className="text-xs text-muted mt-1">{formatTime(post.created_at)}</p>
        </div>
      </div>
    );
  }

  if (post.post_type === "pr") {
    return (
      <div className="flex gap-2">
        <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center text-accent text-xs flex-shrink-0">
          🏆
        </div>
        <div className="flex-1">
          <div className="bg-accent/10 border border-accent/20 rounded-xl p-3">
            <p className="text-sm">
              <span className="font-semibold">{userName}</span> hit a PR!
            </p>
            <p className="text-sm font-semibold text-accent mt-1">
              {post.content.exerciseName}: {post.content.weight}kg ×{" "}
              {post.content.reps}
            </p>
          </div>
          <p className="text-xs text-muted mt-1">{formatTime(post.created_at)}</p>
        </div>
      </div>
    );
  }

  return null;
}
