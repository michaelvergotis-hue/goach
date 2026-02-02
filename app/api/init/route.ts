import { NextResponse } from "next/server";
import { initializeDatabase, migrateDatabase } from "@/lib/db";

export const runtime = "edge";

// GET/POST - Initialize database schema
export async function GET() {
  return initDb();
}

export async function POST() {
  return initDb();
}

async function initDb() {
  try {
    // Run migration first (for existing databases)
    await migrateDatabase();
    // Then initialize (creates table if not exists)
    await initializeDatabase();
    return NextResponse.json({ success: true, message: "Database initialized" });
  } catch (error) {
    console.error("Error initializing database:", error);
    return NextResponse.json(
      { error: "Failed to initialize database" },
      { status: 500 }
    );
  }
}
