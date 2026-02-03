import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthInfo } from "@/lib/server/auth";

export const runtime = "nodejs";

interface SetData {
  weight: number;
  reps: number;
}

interface PRRecord {
  exerciseId: string;
  weight: number;
  reps: number;
  date: string;
  estimated1RM: number;
}

// GET - Fetch personal records for a user
export async function GET(request: NextRequest) {
  const auth = await getAuthInfo();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get("userId");
    const limitRaw = searchParams.get("limit") || "5";
    const limitParsed = parseInt(limitRaw, 10);
    const limit = Number.isFinite(limitParsed)
      ? Math.min(Math.max(limitParsed, 1), 50)
      : 5;

    if (userId && userId !== auth.userId && !auth.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const effectiveUserId = userId || auth.userId;

    // Get all workout logs for this user
    const logs = await sql`
      SELECT exercise_id, sets, date
      FROM workout_logs
      WHERE user_id = ${effectiveUserId}
      ORDER BY date DESC
    `;

    // Calculate PRs for each exercise
    const prsByExercise: Record<string, PRRecord> = {};

    for (const log of logs) {
      const exerciseId = log.exercise_id as string;
      const sets = typeof log.sets === "string" ? JSON.parse(log.sets) : log.sets;
      const date = log.date as string;

      for (const set of sets as SetData[]) {
        if (set.weight > 0 && set.reps > 0) {
          // Calculate estimated 1RM using Epley formula
          const estimated1RM = set.weight * (1 + set.reps / 30);

          // Check if this is a PR (highest estimated 1RM for this exercise)
          if (
            !prsByExercise[exerciseId] ||
            estimated1RM > prsByExercise[exerciseId].estimated1RM
          ) {
            prsByExercise[exerciseId] = {
              exerciseId,
              weight: set.weight,
              reps: set.reps,
              date,
              estimated1RM: Math.round(estimated1RM * 10) / 10,
            };
          }
        }
      }
    }

    // Sort PRs by estimated 1RM (highest first) and take top N
    const topPRs = Object.values(prsByExercise)
      .sort((a, b) => b.estimated1RM - a.estimated1RM)
      .slice(0, limit);

    return NextResponse.json(topPRs);
  } catch (error) {
    console.error("Error fetching PRs:", error);
    return NextResponse.json(
      { error: "Failed to fetch PRs" },
      { status: 500 }
    );
  }
}
