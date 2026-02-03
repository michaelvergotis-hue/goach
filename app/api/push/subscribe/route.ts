import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthInfo } from "@/lib/server/auth";

export const runtime = "nodejs";

// POST - Subscribe to push notifications
export async function POST(request: NextRequest) {
  const auth = await getAuthInfo();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = getDb();
    const body = await request.json();

    const { userId, subscription } = body;

    if (!userId || !subscription) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (userId !== auth.userId && !auth.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Upsert subscription
    await sql`
      INSERT INTO push_subscriptions (user_id, endpoint, keys)
      VALUES (${userId}, ${subscription.endpoint}, ${JSON.stringify(subscription.keys)})
      ON CONFLICT (endpoint)
      DO UPDATE SET
        user_id = ${userId},
        keys = ${JSON.stringify(subscription.keys)}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving subscription:", error);
    return NextResponse.json(
      { error: "Failed to save subscription" },
      { status: 500 }
    );
  }
}

// DELETE - Unsubscribe from push notifications
export async function DELETE(request: NextRequest) {
  const auth = await getAuthInfo();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = getDb();
    const body = await request.json();

    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { error: "Missing endpoint" },
        { status: 400 }
      );
    }

    await sql`
      DELETE FROM push_subscriptions
      WHERE endpoint = ${endpoint}
        AND (${auth.isAdmin} OR user_id = ${auth.userId})
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing subscription:", error);
    return NextResponse.json(
      { error: "Failed to remove subscription" },
      { status: 500 }
    );
  }
}
