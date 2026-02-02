import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import webpush from "web-push";

// Use nodejs runtime for web-push (requires crypto)
export const runtime = "nodejs";

// Configure web-push with VAPID keys
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:goach@example.com",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

// POST - Send push notification
export async function POST(request: NextRequest) {
  try {
    // Simple auth check - require a secret key
    const authHeader = request.headers.get("authorization");
    const expectedKey = process.env.PUSH_SECRET_KEY;

    if (expectedKey && authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId, title, message, url } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Get subscriptions - either for specific user or all users
    let subscriptions;
    if (userId) {
      subscriptions = await sql`
        SELECT endpoint, keys FROM push_subscriptions WHERE user_id = ${userId}
      `;
    } else {
      subscriptions = await sql`
        SELECT endpoint, keys FROM push_subscriptions
      `;
    }

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No subscriptions found",
        sent: 0
      });
    }

    const payload = JSON.stringify({
      title: title || "G.O.A.C.H",
      body: message,
      url: url || "/dashboard",
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

        // Remove invalid subscriptions (410 Gone or 404 Not Found)
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
    console.error("Error sending push notification:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
