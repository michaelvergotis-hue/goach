// Shared types for dashboard components

export interface FeedPost {
  id: number;
  user_id: string;
  post_type: "workout" | "pr" | "chat";
  content: {
    message?: string;
    workoutName?: string;
    exerciseCount?: number;
    exerciseName?: string;
    weight?: number;
    reps?: number;
    day?: string;
  };
  created_at: string;
}

export interface Group {
  id: number;
  name: string;
  members?: string[];
}

export interface WorkoutInfo {
  day: string;
  workout: {
    name: string;
    focus: string;
    exercises: { id: string }[];
  };
}

export function parseDayKey(dayKey: string): { phase: string; week: string; day: string } | null {
  const match = dayKey.match(/^p(\d+)-w(\d+)-d(\d+)$/);
  if (!match) {
    return { phase: "1", week: "1", day: dayKey };
  }
  return { phase: match[1], week: match[2], day: match[3] };
}

export function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateStr === today.toISOString().split("T")[0]) return "Today";
  if (dateStr === yesterday.toISOString().split("T")[0]) return "Yesterday";

  return date.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
