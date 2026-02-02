import { neon } from "@neondatabase/serverless";

// Get the database connection
export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  return neon(databaseUrl);
}

// Initialize the database schema
export async function initializeDatabase() {
  const sql = getDb();

  // Drop old table and create new one with user_id
  await sql`
    CREATE TABLE IF NOT EXISTS workout_logs (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(50) NOT NULL,
      day VARCHAR(10) NOT NULL,
      date DATE NOT NULL,
      exercise_id VARCHAR(100) NOT NULL,
      sets JSONB NOT NULL,
      notes TEXT DEFAULT '',
      completed_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, day, date, exercise_id)
    )
  `;

  // Create indexes for faster queries
  await sql`
    CREATE INDEX IF NOT EXISTS idx_workout_logs_user_exercise
    ON workout_logs(user_id, exercise_id, completed_at DESC)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_workout_logs_user_day_date
    ON workout_logs(user_id, day, date)
  `;

  // Push notification subscriptions table
  await sql`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(50) NOT NULL,
      endpoint TEXT NOT NULL UNIQUE,
      keys JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user
    ON push_subscriptions(user_id)
  `;
}

// Migration: Add user_id column if it doesn't exist
export async function migrateDatabase() {
  const sql = getDb();

  try {
    // Check if user_id column exists
    const result = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'workout_logs' AND column_name = 'user_id'
    `;

    if (result.length === 0) {
      // Add user_id column
      await sql`ALTER TABLE workout_logs ADD COLUMN user_id VARCHAR(50) DEFAULT 'legacy'`;

      // Update unique constraint
      await sql`ALTER TABLE workout_logs DROP CONSTRAINT IF EXISTS workout_logs_day_date_exercise_id_key`;
      await sql`ALTER TABLE workout_logs ADD CONSTRAINT workout_logs_user_day_date_exercise_id_key UNIQUE(user_id, day, date, exercise_id)`;
    }
  } catch (error) {
    console.error("Migration error:", error);
  }
}
