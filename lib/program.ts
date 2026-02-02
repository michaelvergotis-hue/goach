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

export type Program = Record<string, WorkoutDay>;

// Update this program to customize the workout plan
// YouTube IDs are the part after "v=" in youtube.com/watch?v=XXXXX
export const program: Program = {
  "1": {
    name: "Day 1",
    focus: "Push (Chest, Shoulders, Triceps)",
    exercises: [
      {
        id: "bench-press",
        name: "Barbell Bench Press",
        sets: 4,
        reps: "6-8",
        isCompound: true,
        youtubeId: "rT7DgCr-3pg",
      },
      {
        id: "ohp",
        name: "Overhead Press",
        sets: 4,
        reps: "6-8",
        isCompound: true,
        youtubeId: "2yjwXTZQDDI",
      },
      {
        id: "incline-db-press",
        name: "Incline Dumbbell Press",
        sets: 3,
        reps: "8-10",
        isCompound: false,
        youtubeId: "8iPEnn-ltC8",
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
        id: "tricep-pushdowns",
        name: "Tricep Pushdowns",
        sets: 3,
        reps: "10-12",
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
        id: "deadlift",
        name: "Deadlift",
        sets: 4,
        reps: "5-6",
        isCompound: true,
        youtubeId: "op9kVnSso6Q",
      },
      {
        id: "barbell-rows",
        name: "Barbell Rows",
        sets: 4,
        reps: "6-8",
        isCompound: true,
        youtubeId: "FWJR5Ve8bnQ",
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
        id: "barbell-curls",
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
        id: "squat",
        name: "Barbell Squat",
        sets: 4,
        reps: "6-8",
        isCompound: true,
        youtubeId: "ultWZbUMPL8",
      },
      {
        id: "rdl",
        name: "Romanian Deadlift",
        sets: 4,
        reps: "8-10",
        isCompound: true,
        youtubeId: "7j-2w4-P14I",
      },
      {
        id: "leg-press",
        name: "Leg Press",
        sets: 3,
        reps: "10-12",
        isCompound: false,
        youtubeId: "IZxyjW7MPJQ",
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
        id: "calf-raises",
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
        id: "incline-bench",
        name: "Incline Barbell Bench",
        sets: 4,
        reps: "6-8",
        isCompound: true,
        youtubeId: "SrqOu55lrYU",
      },
      {
        id: "cable-rows",
        name: "Seated Cable Rows",
        sets: 4,
        reps: "8-10",
        isCompound: false,
        youtubeId: "GZbfZ033f74",
      },
      {
        id: "db-shoulder-press",
        name: "Dumbbell Shoulder Press",
        sets: 3,
        reps: "8-10",
        isCompound: true,
        youtubeId: "qEwKCR5JCog",
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
        id: "rear-delt-flyes",
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
        id: "front-squat",
        name: "Front Squat",
        sets: 4,
        reps: "6-8",
        isCompound: true,
        youtubeId: "m4ytaCJZpl0",
      },
      {
        id: "hip-thrust",
        name: "Barbell Hip Thrust",
        sets: 4,
        reps: "8-10",
        isCompound: true,
        youtubeId: "SEdqd1n0cvg",
      },
      {
        id: "walking-lunges",
        name: "Walking Lunges",
        sets: 3,
        reps: "10 each leg",
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
        id: "seated-calf-raises",
        name: "Seated Calf Raises",
        sets: 4,
        reps: "15-20",
        isCompound: false,
        youtubeId: "JbyjNymZOt0",
      },
    ],
  },
};

export function getWorkoutDay(day: string): WorkoutDay | undefined {
  return program[day];
}

export function getAllDays(): { day: string; workout: WorkoutDay }[] {
  return Object.entries(program).map(([day, workout]) => ({ day, workout }));
}
