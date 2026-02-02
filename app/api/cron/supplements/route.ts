import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import webpush from "web-push";

// Must use nodejs runtime for web-push
export const runtime = "nodejs";

// Configure web-push lazily to avoid build-time errors
function getWebPush() {
  if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
      "mailto:noreply@goach.app",
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
  }
  return webpush;
}

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = getDb();
  const now = new Date();
  const dayOfWeek = now.getDay();
  const todayDate = now.toISOString().split("T")[0];

  // Get current time in HH:MM format
  const currentHour = now.getHours().toString().padStart(2, "0");
  const currentMinute = now.getMinutes().toString().padStart(2, "0");
  const currentTime = `${currentHour}:${currentMinute}`;

  try {
    // Find schedules that should trigger now (within 5 minute window)
    // and haven't been taken or skipped today
    const schedules = await sql`
      SELECT ss.user_id, ss.reminder_time, ss.supplements
      FROM supplement_schedules ss
      WHERE ss.day_of_week = ${dayOfWeek}
        AND ss.enabled = true
        AND ss.reminder_time <= ${currentTime}::time
        AND ss.reminder_time > (${currentTime}::time - interval '5 minutes')
        AND NOT EXISTS (
          SELECT 1 FROM supplement_logs sl
          WHERE sl.user_id = ss.user_id
            AND sl.date = ${todayDate}
            AND (sl.taken_at IS NOT NULL OR sl.skipped = true)
        )
    `;

    let sent = 0;
    let failed = 0;

    for (const schedule of schedules) {
      // Get push subscriptions for this user
      const subscriptions = await sql`
        SELECT endpoint, keys
        FROM push_subscriptions
        WHERE user_id = ${schedule.user_id}
      `;

      const supplements = schedule.supplements as { name: string; dosage: string }[];
      const suppList = supplements.map((s) => s.name).join(", ");

      const payload = JSON.stringify({
        title: "Supplement Reminder",
        body: `Time to take: ${suppList}`,
        url: "/dashboard",
      });

      const push = getWebPush();
      for (const sub of subscriptions) {
        try {
          await push.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: sub.keys as { p256dh: string; auth: string },
            },
            payload
          );
          sent++;
        } catch (error: unknown) {
          console.error("Push failed:", error);
          failed++;

          // Remove invalid subscriptions
          if (error && typeof error === "object" && "statusCode" in error) {
            const statusCode = (error as { statusCode: number }).statusCode;
            if (statusCode === 410 || statusCode === 404) {
              await sql`
                DELETE FROM push_subscriptions WHERE endpoint = ${sub.endpoint}
              `;
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      checked: schedules.length,
      sent,
      failed,
      time: currentTime,
    });
  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json(
      { error: "Cron job failed" },
      { status: 500 }
    );
  }
}
