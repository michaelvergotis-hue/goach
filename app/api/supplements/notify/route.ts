import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import webpush from "web-push";

export const runtime = "nodejs";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:goach@example.com",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

// POST - Send supplement notification to group members
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userName, groupId, message } = body;

    if (!userId || !groupId) {
      return NextResponse.json(
        { error: "userId and groupId are required" },
        { status: 400 }
      );
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Get group members (excluding the sender)
    const groupMembers = await sql`
      SELECT user_id FROM group_members
      WHERE group_id = ${groupId} AND user_id != ${userId}
    `;

    if (groupMembers.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No other members in group",
        sent: 0
      });
    }

    // Get push subscriptions for group members
    const memberIds = groupMembers.map(m => m.user_id);
    const subscriptions = await sql`
      SELECT user_id, endpoint, keys FROM push_subscriptions
      WHERE user_id = ANY(${memberIds})
    `;

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No subscriptions found for group members",
        sent: 0
      });
    }

    // Build notification payload
    const notificationTitle = "Supplements Taken 💊";
    const notificationBody = message
      ? `${userName} has taken their supplements: "${message}"`
      : `${userName} has taken their supplements!`;

    const payload = JSON.stringify({
      title: notificationTitle,
      body: notificationBody,
      url: "/dashboard",
    });

    let sent = 0;
    let failed = 0;

    // Send to all subscriptions
    for (const sub of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: typeof sub.keys === "string" ? JSON.parse(sub.keys) : sub.keys,
        };

        await webpush.sendNotification(pushSubscription, payload);
        sent++;
      } catch (error: unknown) {
        console.error("Failed to send to subscription:", error);
        failed++;

        const statusCode = (error as { statusCode?: number })?.statusCode;
        if (statusCode === 410 || statusCode === 404) {
          await sql`
            DELETE FROM push_subscriptions WHERE endpoint = ${sub.endpoint}
          `;
        }
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      failed,
    });
  } catch (error) {
    console.error("Error sending supplement notification:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
