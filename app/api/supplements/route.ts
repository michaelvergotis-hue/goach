import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthInfo } from "@/lib/server/auth";

export const runtime = "nodejs";

// GET - fetch supplement schedule and today's log
export async function GET(request: NextRequest) {
  const auth = await getAuthInfo();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const type = searchParams.get("type"); // 'schedule' | 'today' | 'log'

  if (userId && userId !== auth.userId && !auth.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const effectiveUserId = userId || auth.userId;

  const sql = getDb();

  try {
    if (type === "schedule") {
      // Get full weekly schedule
      const schedules = await sql`
        SELECT day_of_week, reminder_time, supplements, enabled
        FROM supplement_schedules
        WHERE user_id = ${effectiveUserId}
        ORDER BY day_of_week
      `;
      return NextResponse.json(schedules);
    }

    if (type === "today") {
      // Get today's schedule and log status
      const today = new Date();
      const dayOfWeek = today.getDay();
      const todayDate = today.toISOString().split("T")[0];

      const [schedule] = await sql`
        SELECT day_of_week, reminder_time, supplements, enabled
        FROM supplement_schedules
        WHERE user_id = ${effectiveUserId} AND day_of_week = ${dayOfWeek}
      `;

      const [log] = await sql`
        SELECT taken_at, skipped
        FROM supplement_logs
        WHERE user_id = ${effectiveUserId} AND date = ${todayDate}
      `;

      return NextResponse.json({
        schedule: schedule || null,
        log: log || null,
        date: todayDate,
      });
    }

    // Default: return all schedules
    const schedules = await sql`
      SELECT day_of_week, reminder_time, supplements, enabled
      FROM supplement_schedules
      WHERE user_id = ${effectiveUserId}
      ORDER BY day_of_week
    `;
    return NextResponse.json(schedules);
  } catch (error) {
    console.error("Error fetching supplements:", error);
    return NextResponse.json(
      { error: "Failed to fetch supplements" },
      { status: 500 }
    );
  }
}

// POST - save/update supplement schedule
export async function POST(request: NextRequest) {
  const auth = await getAuthInfo();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId, dayOfWeek, reminderTime, supplements, enabled } = body;

    if (!userId || dayOfWeek === undefined) {
      return NextResponse.json(
        { error: "userId and dayOfWeek required" },
        { status: 400 }
      );
    }

    if (userId !== auth.userId && !auth.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const sql = getDb();

    // Upsert the schedule
    await sql`
      INSERT INTO supplement_schedules (user_id, day_of_week, reminder_time, supplements, enabled, updated_at)
      VALUES (${userId}, ${dayOfWeek}, ${reminderTime || "08:00"}, ${JSON.stringify(supplements || [])}, ${enabled !== false}, NOW())
      ON CONFLICT (user_id, day_of_week)
      DO UPDATE SET
        reminder_time = EXCLUDED.reminder_time,
        supplements = EXCLUDED.supplements,
        enabled = EXCLUDED.enabled,
        updated_at = NOW()
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving supplement schedule:", error);
    return NextResponse.json(
      { error: "Failed to save schedule" },
      { status: 500 }
    );
  }
}

// PUT - mark supplements as taken/skipped for today
export async function PUT(request: NextRequest) {
  const auth = await getAuthInfo();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId, taken, skipped } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    if (userId !== auth.userId && !auth.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const sql = getDb();
    const today = new Date().toISOString().split("T")[0];

    if (taken) {
      // Mark as taken
      await sql`
        INSERT INTO supplement_logs (user_id, date, taken_at, skipped)
        VALUES (${userId}, ${today}, NOW(), false)
        ON CONFLICT (user_id, date)
        DO UPDATE SET taken_at = NOW(), skipped = false
      `;
    } else if (skipped) {
      // Mark as skipped (won't send reminder)
      await sql`
        INSERT INTO supplement_logs (user_id, date, taken_at, skipped)
        VALUES (${userId}, ${today}, NULL, true)
        ON CONFLICT (user_id, date)
        DO UPDATE SET skipped = true
      `;
    } else {
      // Reset/unmark
      await sql`
        DELETE FROM supplement_logs
        WHERE user_id = ${userId} AND date = ${today}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating supplement log:", error);
    return NextResponse.json(
      { error: "Failed to update log" },
      { status: 500 }
    );
  }
}

// DELETE - remove a day from schedule
export async function DELETE(request: NextRequest) {
  const auth = await getAuthInfo();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const dayOfWeek = searchParams.get("dayOfWeek");

  if (!userId || dayOfWeek === null) {
    return NextResponse.json(
      { error: "userId and dayOfWeek required" },
      { status: 400 }
    );
  }

  if (userId !== auth.userId && !auth.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sql = getDb();

  try {
    await sql`
      DELETE FROM supplement_schedules
      WHERE user_id = ${userId} AND day_of_week = ${parseInt(dayOfWeek)}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json(
      { error: "Failed to delete schedule" },
      { status: 500 }
    );
  }
}
