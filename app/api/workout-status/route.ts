import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthInfo } from "@/lib/server/auth";

export const runtime = "nodejs";

// GET - Fetch workout session statuses
export async function GET(request: NextRequest) {
  const auth = await getAuthInfo();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get("userId");

    if (userId && userId !== auth.userId && !auth.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const effectiveUserId = userId || auth.userId;

    // Get all session statuses for this user
    const result = await sql`
      SELECT day, date, status
      FROM workout_session_status
      WHERE user_id = ${effectiveUserId}
      ORDER BY date DESC
    `;

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching workout status:", error);
    return NextResponse.json(
      { error: "Failed to fetch workout status" },
      { status: 500 }
    );
  }
}

// POST - Set workout session status (complete or missed)
export async function POST(request: NextRequest) {
  const auth = await getAuthInfo();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = getDb();
    const body = await request.json();

    const { userId, day, status } = body;

    if (!userId || !day || !status) {
      return NextResponse.json(
        { error: "Missing required fields: userId, day, status" },
        { status: 400 }
      );
    }

    if (!["completed", "missed"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be 'completed' or 'missed'" },
        { status: 400 }
      );
    }

    if (userId !== auth.userId && !auth.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const date = new Date().toISOString().split("T")[0];

    // Upsert the session status
    await sql`
      INSERT INTO workout_session_status (user_id, day, date, status)
      VALUES (${userId}, ${day}, ${date}, ${status})
      ON CONFLICT (user_id, day)
      DO UPDATE SET
        date = ${date},
        status = ${status}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving workout status:", error);
    return NextResponse.json(
      { error: "Failed to save workout status" },
      { status: 500 }
    );
  }
}

// DELETE - Remove workout session status (undo complete/missed)
export async function DELETE(request: NextRequest) {
  const auth = await getAuthInfo();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get("userId");
    const day = searchParams.get("day");

    if (!userId || !day) {
      return NextResponse.json(
        { error: "Missing required params: userId, day" },
        { status: 400 }
      );
    }

    if (userId !== auth.userId && !auth.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await sql`
      DELETE FROM workout_session_status
      WHERE user_id = ${userId} AND day = ${day}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting workout status:", error);
    return NextResponse.json(
      { error: "Failed to delete workout status" },
      { status: 500 }
    );
  }
}
