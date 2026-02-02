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

  await sql`
    CREATE TABLE IF NOT EXISTS workout_logs (
      id SERIAL PRIMARY KEY,
      day VARCHAR(10) NOT NULL,
      date DATE NOT NULL,
      exercise_id VARCHAR(100) NOT NULL,
      sets JSONB NOT NULL,
      notes TEXT DEFAULT '',
      completed_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(day, date, exercise_id)
    )
  `;

  // Create index for faster queries
  await sql`
    CREATE INDEX IF NOT EXISTS idx_workout_logs_exercise
    ON workout_logs(exercise_id, completed_at DESC)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_workout_logs_day_date
    ON workout_logs(day, date)
  `;
}
