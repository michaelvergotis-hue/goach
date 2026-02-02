import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "edge";

// GET - Fetch workout logs
export async function GET(request: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get("userId");
    const day = searchParams.get("day");
    const date = searchParams.get("date");
    const exerciseId = searchParams.get("exerciseId");
    const lastOnly = searchParams.get("lastOnly") === "true";
    const history = searchParams.get("history") === "true";

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Get workout history for a user (only completed workouts)
    if (history) {
      const result = await sql`
        SELECT wl.day, wl.date,
          COUNT(DISTINCT wl.exercise_id) as exercises_logged
        FROM workout_logs wl
        INNER JOIN workout_session_status wss
          ON wl.user_id = wss.user_id
          AND wl.day = wss.day
          AND wss.status = 'completed'
        WHERE wl.user_id = ${userId}
        GROUP BY wl.day, wl.date
        ORDER BY wl.date DESC
        LIMIT 50
      `;
      return NextResponse.json(result);
    }

    // Get last log for a specific exercise (for "last time" display)
    if (exerciseId && lastOnly) {
      const result = await sql`
        SELECT * FROM workout_logs
        WHERE user_id = ${userId} AND exercise_id = ${exerciseId}
        ORDER BY completed_at DESC
        LIMIT 1
      `;
      return NextResponse.json(result[0] || null);
    }

    // Get all logs for a specific exercise (for PR calculation)
    const allLogs = searchParams.get("allLogs") === "true";
    if (exerciseId && allLogs) {
      const result = await sql`
        SELECT sets, date FROM workout_logs
        WHERE user_id = ${userId} AND exercise_id = ${exerciseId}
        ORDER BY completed_at DESC
      `;
      return NextResponse.json(result);
    }

    // Get logs for a specific day and date
    if (day && date) {
      const result = await sql`
        SELECT * FROM workout_logs
        WHERE user_id = ${userId} AND day = ${day} AND date = ${date}
        ORDER BY id
      `;
      return NextResponse.json(result);
    }

    // Get all logs summary (for stats)
    const result = await sql`
      SELECT DISTINCT day, date FROM workout_logs
      WHERE user_id = ${userId}
      ORDER BY date DESC
      LIMIT 100
    `;
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 }
    );
  }
}

// POST - Save workout log
export async function POST(request: NextRequest) {
  try {
    const sql = getDb();
    const body = await request.json();

    const { userId, day, date, exercises } = body;

    if (!userId || !day || !date || !exercises) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Upsert each exercise log
    for (const exercise of exercises) {
      await sql`
        INSERT INTO workout_logs (user_id, day, date, exercise_id, sets, notes, completed_at)
        VALUES (${userId}, ${day}, ${date}, ${exercise.exerciseId}, ${JSON.stringify(exercise.sets)}, ${exercise.notes || ""}, NOW())
        ON CONFLICT (user_id, day, date, exercise_id)
        DO UPDATE SET
          sets = ${JSON.stringify(exercise.sets)},
          notes = ${exercise.notes || ""},
          completed_at = NOW()
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving log:", error);
    return NextResponse.json({ error: "Failed to save log" }, { status: 500 });
  }
}
