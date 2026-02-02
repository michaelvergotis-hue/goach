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
// Each phase has 4 weeks with a 5-day split
export const program: Program = {
  "1": {
    name: "Phase 1",
    description: "Hypertrophy",
    weeks: 4,
    workouts: {
      "1": {
        name: "Day 1",
        focus: "Push (Chest, Shoulders, Triceps)",
        exercises: [
          {
            id: "p1-bench-press",
            name: "Barbell Bench Press",
            sets: 4,
            reps: "8-10",
            isCompound: true,
            youtubeId: "rT7DgCr-3pg",
          },
          {
            id: "p1-ohp",
            name: "Overhead Press",
            sets: 4,
            reps: "8-10",
            isCompound: true,
            youtubeId: "2yjwXTZQDDI",
          },
          {
            id: "p1-incline-db-press",
            name: "Incline Dumbbell Press",
            sets: 3,
            reps: "10-12",
            isCompound: false,
            youtubeId: "8iPEnn-ltC8",
          },
          {
            id: "p1-lateral-raises",
            name: "Lateral Raises",
            sets: 3,
            reps: "12-15",
            isCompound: false,
            youtubeId: "3VcKaXpzqRo",
          },
          {
            id: "p1-tricep-pushdowns",
            name: "Tricep Pushdowns",
            sets: 3,
            reps: "12-15",
            isCompound: false,
            youtubeId: "2-LAMcpzODU",
          },
        ],
      },
      "2": {
        name: "Day 2",
        focus: "Pull (Back, Biceps)",
        exercises: [
          {
            id: "p1-deadlift",
            name: "Deadlift",
            sets: 4,
            reps: "6-8",
            isCompound: true,
            youtubeId: "op9kVnSso6Q",
          },
          {
            id: "p1-barbell-rows",
            name: "Barbell Rows",
            sets: 4,
            reps: "8-10",
            isCompound: true,
            youtubeId: "FWJR5Ve8bnQ",
          },
          {
            id: "p1-lat-pulldown",
            name: "Lat Pulldown",
            sets: 3,
            reps: "10-12",
            isCompound: false,
            youtubeId: "CAwf7n6Luuc",
          },
          {
            id: "p1-face-pulls",
            name: "Face Pulls",
            sets: 3,
            reps: "12-15",
            isCompound: false,
            youtubeId: "rep-qVOkqgk",
          },
          {
            id: "p1-barbell-curls",
            name: "Barbell Curls",
            sets: 3,
            reps: "10-12",
            isCompound: false,
            youtubeId: "kwG2ipFRgfo",
          },
        ],
      },
      "3": {
        name: "Day 3",
        focus: "Legs (Quads, Hamstrings, Glutes)",
        exercises: [
          {
            id: "p1-squat",
            name: "Barbell Squat",
            sets: 4,
            reps: "8-10",
            isCompound: true,
            youtubeId: "ultWZbUMPL8",
          },
          {
            id: "p1-rdl",
            name: "Romanian Deadlift",
            sets: 4,
            reps: "10-12",
            isCompound: true,
            youtubeId: "7j-2w4-P14I",
          },
          {
            id: "p1-leg-press",
            name: "Leg Press",
            sets: 3,
            reps: "10-12",
            isCompound: false,
            youtubeId: "IZxyjW7MPJQ",
          },
          {
            id: "p1-leg-curls",
            name: "Lying Leg Curls",
            sets: 3,
            reps: "10-12",
            isCompound: false,
            youtubeId: "1Tq3QdYUuHs",
          },
          {
            id: "p1-calf-raises",
            name: "Standing Calf Raises",
            sets: 4,
            reps: "12-15",
            isCompound: false,
            youtubeId: "gwLzBJYoWlI",
          },
        ],
      },
      "4": {
        name: "Day 4",
        focus: "Upper (Chest, Back, Shoulders)",
        exercises: [
          {
            id: "p1-incline-bench",
            name: "Incline Barbell Bench",
            sets: 4,
            reps: "8-10",
            isCompound: true,
            youtubeId: "SrqOu55lrYU",
          },
          {
            id: "p1-cable-rows",
            name: "Seated Cable Rows",
            sets: 4,
            reps: "10-12",
            isCompound: false,
            youtubeId: "GZbfZ033f74",
          },
          {
            id: "p1-db-shoulder-press",
            name: "Dumbbell Shoulder Press",
            sets: 3,
            reps: "10-12",
            isCompound: true,
            youtubeId: "qEwKCR5JCog",
          },
          {
            id: "p1-chest-flyes",
            name: "Cable Chest Flyes",
            sets: 3,
            reps: "12-15",
            isCompound: false,
            youtubeId: "Iwe6AmxVf7o",
          },
          {
            id: "p1-rear-delt-flyes",
            name: "Rear Delt Flyes",
            sets: 3,
            reps: "15-20",
            isCompound: false,
            youtubeId: "EA7u4Q_8HQ0",
          },
        ],
      },
      "5": {
        name: "Day 5",
        focus: "Lower (Strength + Accessories)",
        exercises: [
          {
            id: "p1-front-squat",
            name: "Front Squat",
            sets: 4,
            reps: "8-10",
            isCompound: true,
            youtubeId: "m4ytaCJZpl0",
          },
          {
            id: "p1-hip-thrust",
            name: "Barbell Hip Thrust",
            sets: 4,
            reps: "10-12",
            isCompound: true,
            youtubeId: "SEdqd1n0cvg",
          },
          {
            id: "p1-walking-lunges",
            name: "Walking Lunges",
            sets: 3,
            reps: "10 each leg",
            isCompound: false,
            youtubeId: "L8fvypPrzzs",
          },
          {
            id: "p1-leg-extensions",
            name: "Leg Extensions",
            sets: 3,
            reps: "12-15",
            isCompound: false,
            youtubeId: "YyvSfVjQeL0",
          },
          {
            id: "p1-seated-calf-raises",
            name: "Seated Calf Raises",
            sets: 4,
            reps: "15-20",
            isCompound: false,
            youtubeId: "JbyjNymZOt0",
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
        name: "Day 1",
        focus: "Push (Chest, Shoulders, Triceps)",
        exercises: [
          {
            id: "p2-bench-press",
            name: "Barbell Bench Press",
            sets: 5,
            reps: "5",
            isCompound: true,
            youtubeId: "rT7DgCr-3pg",
          },
          {
            id: "p2-ohp",
            name: "Overhead Press",
            sets: 4,
            reps: "6",
            isCompound: true,
            youtubeId: "2yjwXTZQDDI",
          },
          {
            id: "p2-close-grip-bench",
            name: "Close Grip Bench Press",
            sets: 3,
            reps: "8",
            isCompound: true,
            youtubeId: "nEF0bv2FW94",
          },
          {
            id: "p2-lateral-raises",
            name: "Lateral Raises",
            sets: 3,
            reps: "12-15",
            isCompound: false,
            youtubeId: "3VcKaXpzqRo",
          },
          {
            id: "p2-tricep-dips",
            name: "Tricep Dips",
            sets: 3,
            reps: "8-10",
            isCompound: false,
            youtubeId: "6kALZikXxLc",
          },
        ],
      },
      "2": {
        name: "Day 2",
        focus: "Pull (Back, Biceps)",
        exercises: [
          {
            id: "p2-deadlift",
            name: "Deadlift",
            sets: 5,
            reps: "5",
            isCompound: true,
            youtubeId: "op9kVnSso6Q",
          },
          {
            id: "p2-weighted-pullups",
            name: "Weighted Pull-ups",
            sets: 4,
            reps: "6",
            isCompound: true,
            youtubeId: "eGo4IYlbE5g",
          },
          {
            id: "p2-barbell-rows",
            name: "Barbell Rows",
            sets: 4,
            reps: "6-8",
            isCompound: true,
            youtubeId: "FWJR5Ve8bnQ",
          },
          {
            id: "p2-face-pulls",
            name: "Face Pulls",
            sets: 3,
            reps: "12-15",
            isCompound: false,
            youtubeId: "rep-qVOkqgk",
          },
          {
            id: "p2-hammer-curls",
            name: "Hammer Curls",
            sets: 3,
            reps: "10-12",
            isCompound: false,
            youtubeId: "zC3nLlEvin4",
          },
        ],
      },
      "3": {
        name: "Day 3",
        focus: "Legs (Quads, Hamstrings, Glutes)",
        exercises: [
          {
            id: "p2-squat",
            name: "Barbell Squat",
            sets: 5,
            reps: "5",
            isCompound: true,
            youtubeId: "ultWZbUMPL8",
          },
          {
            id: "p2-rdl",
            name: "Romanian Deadlift",
            sets: 4,
            reps: "8",
            isCompound: true,
            youtubeId: "7j-2w4-P14I",
          },
          {
            id: "p2-leg-press",
            name: "Leg Press",
            sets: 3,
            reps: "8-10",
            isCompound: false,
            youtubeId: "IZxyjW7MPJQ",
          },
          {
            id: "p2-leg-curls",
            name: "Lying Leg Curls",
            sets: 3,
            reps: "10-12",
            isCompound: false,
            youtubeId: "1Tq3QdYUuHs",
          },
          {
            id: "p2-calf-raises",
            name: "Standing Calf Raises",
            sets: 4,
            reps: "10-12",
            isCompound: false,
            youtubeId: "gwLzBJYoWlI",
          },
        ],
      },
      "4": {
        name: "Day 4",
        focus: "Upper (Chest, Back, Shoulders)",
        exercises: [
          {
            id: "p2-incline-bench",
            name: "Incline Barbell Bench",
            sets: 4,
            reps: "6",
            isCompound: true,
            youtubeId: "SrqOu55lrYU",
          },
          {
            id: "p2-pendlay-rows",
            name: "Pendlay Rows",
            sets: 4,
            reps: "6",
            isCompound: true,
            youtubeId: "ZlRrIsoDpKg",
          },
          {
            id: "p2-db-shoulder-press",
            name: "Dumbbell Shoulder Press",
            sets: 3,
            reps: "8",
            isCompound: true,
            youtubeId: "qEwKCR5JCog",
          },
          {
            id: "p2-chest-flyes",
            name: "Cable Chest Flyes",
            sets: 3,
            reps: "10-12",
            isCompound: false,
            youtubeId: "Iwe6AmxVf7o",
          },
          {
            id: "p2-rear-delt-flyes",
            name: "Rear Delt Flyes",
            sets: 3,
            reps: "12-15",
            isCompound: false,
            youtubeId: "EA7u4Q_8HQ0",
          },
        ],
      },
      "5": {
        name: "Day 5",
        focus: "Lower (Strength + Accessories)",
        exercises: [
          {
            id: "p2-front-squat",
            name: "Front Squat",
            sets: 4,
            reps: "6",
            isCompound: true,
            youtubeId: "m4ytaCJZpl0",
          },
          {
            id: "p2-hip-thrust",
            name: "Barbell Hip Thrust",
            sets: 4,
            reps: "8",
            isCompound: true,
            youtubeId: "SEdqd1n0cvg",
          },
          {
            id: "p2-bulgarian-split-squat",
            name: "Bulgarian Split Squat",
            sets: 3,
            reps: "8 each leg",
            isCompound: false,
            youtubeId: "2C-uNgKwPLE",
          },
          {
            id: "p2-leg-extensions",
            name: "Leg Extensions",
            sets: 3,
            reps: "10-12",
            isCompound: false,
            youtubeId: "YyvSfVjQeL0",
          },
          {
            id: "p2-seated-calf-raises",
            name: "Seated Calf Raises",
            sets: 4,
            reps: "12-15",
            isCompound: false,
            youtubeId: "JbyjNymZOt0",
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
        name: "Day 1",
        focus: "Push (Chest, Shoulders, Triceps)",
        exercises: [
          {
            id: "p3-bench-press",
            name: "Barbell Bench Press",
            sets: 5,
            reps: "3",
            isCompound: true,
            youtubeId: "rT7DgCr-3pg",
          },
          {
            id: "p3-ohp",
            name: "Overhead Press",
            sets: 4,
            reps: "5",
            isCompound: true,
            youtubeId: "2yjwXTZQDDI",
          },
          {
            id: "p3-paused-bench",
            name: "Paused Bench Press",
            sets: 3,
            reps: "5",
            isCompound: true,
            youtubeId: "XjuhFxHOvNw",
          },
          {
            id: "p3-lateral-raises",
            name: "Lateral Raises",
            sets: 3,
            reps: "12-15",
            isCompound: false,
            youtubeId: "3VcKaXpzqRo",
          },
          {
            id: "p3-skull-crushers",
            name: "Skull Crushers",
            sets: 3,
            reps: "10-12",
            isCompound: false,
            youtubeId: "d_KZxkY_0cM",
          },
        ],
      },
      "2": {
        name: "Day 2",
        focus: "Pull (Back, Biceps)",
        exercises: [
          {
            id: "p3-deadlift",
            name: "Deadlift",
            sets: 5,
            reps: "3",
            isCompound: true,
            youtubeId: "op9kVnSso6Q",
          },
          {
            id: "p3-weighted-pullups",
            name: "Weighted Pull-ups",
            sets: 4,
            reps: "5",
            isCompound: true,
            youtubeId: "eGo4IYlbE5g",
          },
          {
            id: "p3-barbell-rows",
            name: "Barbell Rows",
            sets: 4,
            reps: "5",
            isCompound: true,
            youtubeId: "FWJR5Ve8bnQ",
          },
          {
            id: "p3-face-pulls",
            name: "Face Pulls",
            sets: 3,
            reps: "12-15",
            isCompound: false,
            youtubeId: "rep-qVOkqgk",
          },
          {
            id: "p3-barbell-curls",
            name: "Barbell Curls",
            sets: 3,
            reps: "10-12",
            isCompound: false,
            youtubeId: "kwG2ipFRgfo",
          },
        ],
      },
      "3": {
        name: "Day 3",
        focus: "Legs (Quads, Hamstrings, Glutes)",
        exercises: [
          {
            id: "p3-squat",
            name: "Barbell Squat",
            sets: 5,
            reps: "3",
            isCompound: true,
            youtubeId: "ultWZbUMPL8",
          },
          {
            id: "p3-paused-squat",
            name: "Paused Squat",
            sets: 3,
            reps: "5",
            isCompound: true,
            youtubeId: "lFB3z0gsFhM",
          },
          {
            id: "p3-leg-press",
            name: "Leg Press",
            sets: 3,
            reps: "8",
            isCompound: false,
            youtubeId: "IZxyjW7MPJQ",
          },
          {
            id: "p3-leg-curls",
            name: "Lying Leg Curls",
            sets: 3,
            reps: "10-12",
            isCompound: false,
            youtubeId: "1Tq3QdYUuHs",
          },
          {
            id: "p3-calf-raises",
            name: "Standing Calf Raises",
            sets: 4,
            reps: "10-12",
            isCompound: false,
            youtubeId: "gwLzBJYoWlI",
          },
        ],
      },
      "4": {
        name: "Day 4",
        focus: "Upper (Chest, Back, Shoulders)",
        exercises: [
          {
            id: "p3-incline-bench",
            name: "Incline Barbell Bench",
            sets: 4,
            reps: "5",
            isCompound: true,
            youtubeId: "SrqOu55lrYU",
          },
          {
            id: "p3-tbar-rows",
            name: "T-Bar Rows",
            sets: 4,
            reps: "6",
            isCompound: true,
            youtubeId: "j3Igk5nyZE4",
          },
          {
            id: "p3-push-press",
            name: "Push Press",
            sets: 3,
            reps: "5",
            isCompound: true,
            youtubeId: "iaBVSJm78ko",
          },
          {
            id: "p3-chest-flyes",
            name: "Cable Chest Flyes",
            sets: 3,
            reps: "10-12",
            isCompound: false,
            youtubeId: "Iwe6AmxVf7o",
          },
          {
            id: "p3-rear-delt-flyes",
            name: "Rear Delt Flyes",
            sets: 3,
            reps: "12-15",
            isCompound: false,
            youtubeId: "EA7u4Q_8HQ0",
          },
        ],
      },
      "5": {
        name: "Day 5",
        focus: "Lower (Strength + Accessories)",
        exercises: [
          {
            id: "p3-front-squat",
            name: "Front Squat",
            sets: 4,
            reps: "5",
            isCompound: true,
            youtubeId: "m4ytaCJZpl0",
          },
          {
            id: "p3-hip-thrust",
            name: "Barbell Hip Thrust",
            sets: 4,
            reps: "6",
            isCompound: true,
            youtubeId: "SEdqd1n0cvg",
          },
          {
            id: "p3-walking-lunges",
            name: "Walking Lunges",
            sets: 3,
            reps: "8 each leg",
            isCompound: false,
            youtubeId: "L8fvypPrzzs",
          },
          {
            id: "p3-leg-extensions",
            name: "Leg Extensions",
            sets: 3,
            reps: "10-12",
            isCompound: false,
            youtubeId: "YyvSfVjQeL0",
          },
          {
            id: "p3-seated-calf-raises",
            name: "Seated Calf Raises",
            sets: 4,
            reps: "12-15",
            isCompound: false,
            youtubeId: "JbyjNymZOt0",
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
