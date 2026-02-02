export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  isCompound: boolean;
  youtubeId?: string;
  notes?: string;
}

export interface WorkoutDay {
  name: string;
  focus: string;
  exercises: Exercise[];
}

export interface Phase {
  name: string;
  description: string;
  weeks: number;
  workouts: Record<string, WorkoutDay>;
}

export type Program = Record<string, Phase>;

// 12-week program across 3 phases
// Monday - Squats, Tuesday - Back, Wednesday - Chest, Thursday - Deadlifts, Friday - Shoulders/Arms
export const program: Program = {
  "1": {
    name: "Phase 1",
    description: "Hypertrophy",
    weeks: 4,
    workouts: {
      "1": {
        name: "Monday",
        focus: "Squats",
        exercises: [
          {
            id: "squat",
            name: "Barbell Squat",
            sets: 4,
            reps: "8-10",
            isCompound: true,
            youtubeId: "ultWZbUMPL8",
          },
          {
            id: "leg-press",
            name: "Leg Press",
            sets: 4,
            reps: "10-12",
            isCompound: false,
            youtubeId: "IZxyjW7MPJQ",
          },
          {
            id: "walking-lunges",
            name: "Walking Lunges",
            sets: 3,
            reps: "12 each",
            isCompound: false,
            youtubeId: "L8fvypPrzzs",
          },
          {
            id: "leg-extensions",
            name: "Leg Extensions",
            sets: 3,
            reps: "12-15",
            isCompound: false,
            youtubeId: "YyvSfVjQeL0",
          },
          {
            id: "calf-raises",
            name: "Standing Calf Raises",
            sets: 4,
            reps: "15-20",
            isCompound: false,
            youtubeId: "gwLzBJYoWlI",
          },
        ],
      },
      "2": {
        name: "Tuesday",
        focus: "Back",
        exercises: [
          {
            id: "barbell-rows",
            name: "Barbell Rows",
            sets: 4,
            reps: "8-10",
            isCompound: true,
            youtubeId: "FWJR5Ve8bnQ",
          },
          {
            id: "lat-pulldown",
            name: "Lat Pulldown",
            sets: 4,
            reps: "10-12",
            isCompound: false,
            youtubeId: "CAwf7n6Luuc",
          },
          {
            id: "cable-rows",
            name: "Seated Cable Rows",
            sets: 3,
            reps: "10-12",
            isCompound: false,
            youtubeId: "GZbfZ033f74",
          },
          {
            id: "face-pulls",
            name: "Face Pulls",
            sets: 3,
            reps: "15-20",
            isCompound: false,
            youtubeId: "rep-qVOkqgk",
          },
          {
            id: "back-hyperextensions",
            name: "Hyperextensions",
            sets: 3,
            reps: "12-15",
            isCompound: false,
            youtubeId: "ph3pddpKzzw",
          },
        ],
      },
      "3": {
        name: "Wednesday",
        focus: "Chest",
        exercises: [
          {
            id: "bench-press",
            name: "Barbell Bench Press",
            sets: 4,
            reps: "8-10",
            isCompound: true,
            youtubeId: "rT7DgCr-3pg",
          },
          {
            id: "incline-db-press",
            name: "Incline Dumbbell Press",
            sets: 4,
            reps: "10-12",
            isCompound: false,
            youtubeId: "8iPEnn-ltC8",
          },
          {
            id: "chest-flyes",
            name: "Cable Chest Flyes",
            sets: 3,
            reps: "12-15",
            isCompound: false,
            youtubeId: "Iwe6AmxVf7o",
          },
          {
            id: "dips",
            name: "Dips",
            sets: 3,
            reps: "10-12",
            isCompound: true,
            youtubeId: "2z8JmcrW-As",
          },
          {
            id: "pushups",
            name: "Push-ups",
            sets: 3,
            reps: "15-20",
            isCompound: false,
            youtubeId: "IODxDxX7oi4",
          },
        ],
      },
      "4": {
        name: "Thursday",
        focus: "Deadlifts",
        exercises: [
          {
            id: "deadlift",
            name: "Conventional Deadlift",
            sets: 4,
            reps: "6-8",
            isCompound: true,
            youtubeId: "op9kVnSso6Q",
          },
          {
            id: "rdl",
            name: "Romanian Deadlift",
            sets: 4,
            reps: "10-12",
            isCompound: true,
            youtubeId: "7j-2w4-P14I",
          },
          {
            id: "leg-curls",
            name: "Lying Leg Curls",
            sets: 3,
            reps: "12-15",
            isCompound: false,
            youtubeId: "1Tq3QdYUuHs",
          },
          {
            id: "hip-thrust",
            name: "Barbell Hip Thrust",
            sets: 3,
            reps: "10-12",
            isCompound: true,
            youtubeId: "SEdqd1n0cvg",
          },
          {
            id: "seated-calf-raises",
            name: "Seated Calf Raises",
            sets: 4,
            reps: "15-20",
            isCompound: false,
            youtubeId: "JbyjNymZOt0",
          },
        ],
      },
      "5": {
        name: "Friday",
        focus: "Shoulders & Arms",
        exercises: [
          {
            id: "ohp",
            name: "Overhead Press",
            sets: 4,
            reps: "8-10",
            isCompound: true,
            youtubeId: "2yjwXTZQDDI",
          },
          {
            id: "lateral-raises",
            name: "Lateral Raises",
            sets: 4,
            reps: "12-15",
            isCompound: false,
            youtubeId: "3VcKaXpzqRo",
          },
          {
            id: "rear-delt-flyes",
            name: "Rear Delt Flyes",
            sets: 3,
            reps: "15-20",
            isCompound: false,
            youtubeId: "EA7u4Q_8HQ0",
          },
          {
            id: "barbell-curls",
            name: "Barbell Curls",
            sets: 3,
            reps: "10-12",
            isCompound: false,
            youtubeId: "kwG2ipFRgfo",
          },
          {
            id: "tricep-pushdowns",
            name: "Tricep Pushdowns",
            sets: 3,
            reps: "12-15",
            isCompound: false,
            youtubeId: "2-LAMcpzODU",
          },
          {
            id: "hammer-curls",
            name: "Hammer Curls",
            sets: 3,
            reps: "10-12",
            isCompound: false,
            youtubeId: "zC3nLlEvin4",
          },
        ],
      },
    },
  },
  "2": {
    name: "Phase 2",
    description: "Strength",
    weeks: 4,
    workouts: {
      "1": {
        name: "Monday",
        focus: "Squats",
        exercises: [
          {
            id: "squat",
            name: "Barbell Squat",
            sets: 5,
            reps: "5",
            isCompound: true,
            youtubeId: "ultWZbUMPL8",
          },
          {
            id: "front-squat",
            name: "Front Squat",
            sets: 4,
            reps: "6",
            isCompound: true,
            youtubeId: "m4ytaCJZpl0",
          },
          {
            id: "leg-press",
            name: "Leg Press",
            sets: 3,
            reps: "8-10",
            isCompound: false,
            youtubeId: "IZxyjW7MPJQ",
          },
          {
            id: "leg-extensions",
            name: "Leg Extensions",
            sets: 3,
            reps: "10-12",
            isCompound: false,
            youtubeId: "YyvSfVjQeL0",
          },
          {
            id: "calf-raises",
            name: "Standing Calf Raises",
            sets: 4,
            reps: "12-15",
            isCompound: false,
            youtubeId: "gwLzBJYoWlI",
          },
        ],
      },
      "2": {
        name: "Tuesday",
        focus: "Back",
        exercises: [
          {
            id: "barbell-rows",
            name: "Barbell Rows",
            sets: 5,
            reps: "5",
            isCompound: true,
            youtubeId: "FWJR5Ve8bnQ",
          },
          {
            id: "weighted-pullups",
            name: "Weighted Pull-ups",
            sets: 4,
            reps: "6",
            isCompound: true,
            youtubeId: "eGo4IYlbE5g",
          },
          {
            id: "lat-pulldown",
            name: "Lat Pulldown",
            sets: 3,
            reps: "8-10",
            isCompound: false,
            youtubeId: "CAwf7n6Luuc",
          },
          {
            id: "face-pulls",
            name: "Face Pulls",
            sets: 3,
            reps: "12-15",
            isCompound: false,
            youtubeId: "rep-qVOkqgk",
          },
          {
            id: "shrugs",
            name: "Barbell Shrugs",
            sets: 3,
            reps: "10-12",
            isCompound: false,
            youtubeId: "cJRVVxmytaM",
          },
        ],
      },
      "3": {
        name: "Wednesday",
        focus: "Chest",
        exercises: [
          {
            id: "bench-press",
            name: "Barbell Bench Press",
            sets: 5,
            reps: "5",
            isCompound: true,
            youtubeId: "rT7DgCr-3pg",
          },
          {
            id: "incline-bench",
            name: "Incline Barbell Bench",
            sets: 4,
            reps: "6",
            isCompound: true,
            youtubeId: "SrqOu55lrYU",
          },
          {
            id: "close-grip-bench",
            name: "Close Grip Bench Press",
            sets: 3,
            reps: "8",
            isCompound: true,
            youtubeId: "nEF0bv2FW94",
          },
          {
            id: "chest-flyes",
            name: "Cable Chest Flyes",
            sets: 3,
            reps: "10-12",
            isCompound: false,
            youtubeId: "Iwe6AmxVf7o",
          },
          {
            id: "dips",
            name: "Weighted Dips",
            sets: 3,
            reps: "8-10",
            isCompound: true,
            youtubeId: "2z8JmcrW-As",
          },
        ],
      },
      "4": {
        name: "Thursday",
        focus: "Deadlifts",
        exercises: [
          {
            id: "deadlift",
            name: "Conventional Deadlift",
            sets: 5,
            reps: "5",
            isCompound: true,
            youtubeId: "op9kVnSso6Q",
          },
          {
            id: "deficit-deadlift",
            name: "Deficit Deadlift",
            sets: 3,
            reps: "6",
            isCompound: true,
            youtubeId: "6TQTQ-sTqPg",
          },
          {
            id: "rdl",
            name: "Romanian Deadlift",
            sets: 3,
            reps: "8",
            isCompound: true,
            youtubeId: "7j-2w4-P14I",
          },
          {
            id: "leg-curls",
            name: "Lying Leg Curls",
            sets: 3,
            reps: "10-12",
            isCompound: false,
            youtubeId: "1Tq3QdYUuHs",
          },
          {
            id: "hip-thrust",
            name: "Barbell Hip Thrust",
            sets: 3,
            reps: "8-10",
            isCompound: true,
            youtubeId: "SEdqd1n0cvg",
          },
        ],
      },
      "5": {
        name: "Friday",
        focus: "Shoulders & Arms",
        exercises: [
          {
            id: "ohp",
            name: "Overhead Press",
            sets: 5,
            reps: "5",
            isCompound: true,
            youtubeId: "2yjwXTZQDDI",
          },
          {
            id: "push-press",
            name: "Push Press",
            sets: 3,
            reps: "6",
            isCompound: true,
            youtubeId: "iaBVSJm78ko",
          },
          {
            id: "lateral-raises",
            name: "Lateral Raises",
            sets: 3,
            reps: "12-15",
            isCompound: false,
            youtubeId: "3VcKaXpzqRo",
          },
          {
            id: "barbell-curls",
            name: "Barbell Curls",
            sets: 3,
            reps: "8-10",
            isCompound: false,
            youtubeId: "kwG2ipFRgfo",
          },
          {
            id: "skull-crushers",
            name: "Skull Crushers",
            sets: 3,
            reps: "10-12",
            isCompound: false,
            youtubeId: "d_KZxkY_0cM",
          },
        ],
      },
    },
  },
  "3": {
    name: "Phase 3",
    description: "Peak",
    weeks: 4,
    workouts: {
      "1": {
        name: "Monday",
        focus: "Squats",
        exercises: [
          {
            id: "squat",
            name: "Barbell Squat",
            sets: 5,
            reps: "3",
            isCompound: true,
            youtubeId: "ultWZbUMPL8",
          },
          {
            id: "paused-squat",
            name: "Paused Squat",
            sets: 3,
            reps: "5",
            isCompound: true,
            youtubeId: "lFB3z0gsFhM",
          },
          {
            id: "leg-press",
            name: "Leg Press",
            sets: 3,
            reps: "8",
            isCompound: false,
            youtubeId: "IZxyjW7MPJQ",
          },
          {
            id: "leg-extensions",
            name: "Leg Extensions",
            sets: 3,
            reps: "10-12",
            isCompound: false,
            youtubeId: "YyvSfVjQeL0",
          },
          {
            id: "calf-raises",
            name: "Standing Calf Raises",
            sets: 4,
            reps: "10-12",
            isCompound: false,
            youtubeId: "gwLzBJYoWlI",
          },
        ],
      },
      "2": {
        name: "Tuesday",
        focus: "Back",
        exercises: [
          {
            id: "barbell-rows",
            name: "Barbell Rows",
            sets: 5,
            reps: "3",
            isCompound: true,
            youtubeId: "FWJR5Ve8bnQ",
          },
          {
            id: "weighted-pullups",
            name: "Weighted Pull-ups",
            sets: 4,
            reps: "5",
            isCompound: true,
            youtubeId: "eGo4IYlbE5g",
          },
          {
            id: "tbar-rows",
            name: "T-Bar Rows",
            sets: 3,
            reps: "6",
            isCompound: true,
            youtubeId: "j3Igk5nyZE4",
          },
          {
            id: "face-pulls",
            name: "Face Pulls",
            sets: 3,
            reps: "12-15",
            isCompound: false,
            youtubeId: "rep-qVOkqgk",
          },
          {
            id: "shrugs",
            name: "Barbell Shrugs",
            sets: 3,
            reps: "8-10",
            isCompound: false,
            youtubeId: "cJRVVxmytaM",
          },
        ],
      },
      "3": {
        name: "Wednesday",
        focus: "Chest",
        exercises: [
          {
            id: "bench-press",
            name: "Barbell Bench Press",
            sets: 5,
            reps: "3",
            isCompound: true,
            youtubeId: "rT7DgCr-3pg",
          },
          {
            id: "paused-bench",
            name: "Paused Bench Press",
            sets: 3,
            reps: "5",
            isCompound: true,
            youtubeId: "XjuhFxHOvNw",
          },
          {
            id: "incline-bench",
            name: "Incline Barbell Bench",
            sets: 3,
            reps: "6",
            isCompound: true,
            youtubeId: "SrqOu55lrYU",
          },
          {
            id: "chest-flyes",
            name: "Cable Chest Flyes",
            sets: 3,
            reps: "10-12",
            isCompound: false,
            youtubeId: "Iwe6AmxVf7o",
          },
          {
            id: "dips",
            name: "Weighted Dips",
            sets: 3,
            reps: "6-8",
            isCompound: true,
            youtubeId: "2z8JmcrW-As",
          },
        ],
      },
      "4": {
        name: "Thursday",
        focus: "Deadlifts",
        exercises: [
          {
            id: "deadlift",
            name: "Conventional Deadlift",
            sets: 5,
            reps: "3",
            isCompound: true,
            youtubeId: "op9kVnSso6Q",
          },
          {
            id: "paused-deadlift",
            name: "Paused Deadlift",
            sets: 3,
            reps: "5",
            isCompound: true,
            youtubeId: "3E53PyY9X1s",
          },
          {
            id: "rdl",
            name: "Romanian Deadlift",
            sets: 3,
            reps: "6-8",
            isCompound: true,
            youtubeId: "7j-2w4-P14I",
          },
          {
            id: "leg-curls",
            name: "Lying Leg Curls",
            sets: 3,
            reps: "10-12",
            isCompound: false,
            youtubeId: "1Tq3QdYUuHs",
          },
          {
            id: "hip-thrust",
            name: "Barbell Hip Thrust",
            sets: 3,
            reps: "8",
            isCompound: true,
            youtubeId: "SEdqd1n0cvg",
          },
        ],
      },
      "5": {
        name: "Friday",
        focus: "Shoulders & Arms",
        exercises: [
          {
            id: "ohp",
            name: "Overhead Press",
            sets: 5,
            reps: "3",
            isCompound: true,
            youtubeId: "2yjwXTZQDDI",
          },
          {
            id: "push-press",
            name: "Push Press",
            sets: 3,
            reps: "5",
            isCompound: true,
            youtubeId: "iaBVSJm78ko",
          },
          {
            id: "lateral-raises",
            name: "Lateral Raises",
            sets: 3,
            reps: "12-15",
            isCompound: false,
            youtubeId: "3VcKaXpzqRo",
          },
          {
            id: "barbell-curls",
            name: "Barbell Curls",
            sets: 3,
            reps: "8-10",
            isCompound: false,
            youtubeId: "kwG2ipFRgfo",
          },
          {
            id: "close-grip-bench",
            name: "Close Grip Bench Press",
            sets: 3,
            reps: "6-8",
            isCompound: true,
            youtubeId: "nEF0bv2FW94",
          },
        ],
      },
    },
  },
};

export function getPhase(phaseId: string): Phase | undefined {
  return program[phaseId];
}

export function getWorkoutDay(phaseId: string, day: string): WorkoutDay | undefined {
  return program[phaseId]?.workouts[day];
}

export function getAllPhases(): { id: string; phase: Phase }[] {
  return Object.entries(program).map(([id, phase]) => ({ id, phase }));
}

export function getPhaseWorkouts(phaseId: string): { day: string; workout: WorkoutDay }[] {
  const phase = program[phaseId];
  if (!phase) return [];
  return Object.entries(phase.workouts).map(([day, workout]) => ({ day, workout }));
}

// Legacy function for compatibility
export function getAllDays(): { day: string; workout: WorkoutDay }[] {
  return getPhaseWorkouts("1");
}

// Get exercise by ID across all phases
export function getExerciseById(exerciseId: string): Exercise | undefined {
  for (const phase of Object.values(program)) {
    for (const workout of Object.values(phase.workouts)) {
      const exercise = workout.exercises.find((e) => e.id === exerciseId);
      if (exercise) return exercise;
    }
  }
  return undefined;
}

// Get exercise name by ID (returns ID as fallback)
export function getExerciseName(exerciseId: string): string {
  const exercise = getExerciseById(exerciseId);
  return exercise?.name || exerciseId.replace(/-/g, " ").replace(/^p\d+\s*/, "");
}
