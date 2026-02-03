import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthInfo } from "@/lib/server/auth";

export const runtime = "nodejs";

// DELETE - Clear workout data for a user
export async function DELETE(request: NextRequest) {
  const auth = await getAuthInfo();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!auth.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get("userId");
    const clearType = searchParams.get("type") || "all"; // "all", "logs", "status"

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const results: string[] = [];

    // Clear workout logs
    if (clearType === "all" || clearType === "logs") {
      await sql`
        DELETE FROM workout_logs
        WHERE user_id = ${userId}
      `;
      results.push("workout_logs cleared");
    }

    // Clear workout session status
    if (clearType === "all" || clearType === "status") {
      await sql`
        DELETE FROM workout_session_status
        WHERE user_id = ${userId}
      `;
      results.push("workout_session_status cleared");
    }

    return NextResponse.json({
      success: true,
      message: results.join(", "),
      userId
    });
  } catch (error) {
    console.error("Error clearing data:", error);
    return NextResponse.json(
      { error: "Failed to clear data" },
      { status: 500 }
    );
  }
}
