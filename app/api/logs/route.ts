import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "edge";

// GET - Fetch workout logs
export async function GET(request: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);

    const day = searchParams.get("day");
    const date = searchParams.get("date");
    const exerciseId = searchParams.get("exerciseId");
    const lastOnly = searchParams.get("lastOnly") === "true";

    // Get last log for a specific exercise (for "last time" display)
    if (exerciseId && lastOnly) {
      const result = await sql`
        SELECT * FROM workout_logs
        WHERE exercise_id = ${exerciseId}
        ORDER BY completed_at DESC
        LIMIT 1
      `;
      return NextResponse.json(result[0] || null);
    }

    // Get logs for a specific day and date
    if (day && date) {
      const result = await sql`
        SELECT * FROM workout_logs
        WHERE day = ${day} AND date = ${date}
        ORDER BY id
      `;
      return NextResponse.json(result);
    }

    // Get all logs (for stats)
    const result = await sql`
      SELECT DISTINCT day, date FROM workout_logs
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

    const { day, date, exercises } = body;

    if (!day || !date || !exercises) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Upsert each exercise log
    for (const exercise of exercises) {
      await sql`
        INSERT INTO workout_logs (day, date, exercise_id, sets, notes, completed_at)
        VALUES (${day}, ${date}, ${exercise.exerciseId}, ${JSON.stringify(exercise.sets)}, ${exercise.notes || ""}, NOW())
        ON CONFLICT (day, date, exercise_id)
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
