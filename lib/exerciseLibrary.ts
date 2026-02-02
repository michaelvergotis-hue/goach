// Exercise library for swapping exercises
// Organized by muscle group/category

export interface LibraryExercise {
  id: string;
  name: string;
  category: string;
  isCompound: boolean;
}

export const exerciseCategories = [
  "Chest",
  "Back",
  "Shoulders",
  "Legs - Quads",
  "Legs - Hamstrings",
  "Legs - Glutes",
  "Legs - Calves",
  "Biceps",
  "Triceps",
  "Core",
  "Full Body",
] as const;

export type ExerciseCategory = typeof exerciseCategories[number];

export const exerciseLibrary: LibraryExercise[] = [
  // Chest
  { id: "barbell-bench-press", name: "Barbell Bench Press", category: "Chest", isCompound: true },
  { id: "dumbbell-bench-press", name: "Dumbbell Bench Press", category: "Chest", isCompound: true },
  { id: "incline-barbell-bench", name: "Incline Barbell Bench", category: "Chest", isCompound: true },
  { id: "incline-dumbbell-bench", name: "Incline Dumbbell Bench", category: "Chest", isCompound: true },
  { id: "decline-bench-press", name: "Decline Bench Press", category: "Chest", isCompound: true },
  { id: "dumbbell-flyes", name: "Dumbbell Flyes", category: "Chest", isCompound: false },
  { id: "cable-flyes", name: "Cable Flyes", category: "Chest", isCompound: false },
  { id: "pec-deck", name: "Pec Deck Machine", category: "Chest", isCompound: false },
  { id: "chest-dips", name: "Chest Dips", category: "Chest", isCompound: true },
  { id: "push-ups", name: "Push-Ups", category: "Chest", isCompound: true },
  { id: "machine-chest-press", name: "Machine Chest Press", category: "Chest", isCompound: true },
  { id: "landmine-press", name: "Landmine Press", category: "Chest", isCompound: true },

  // Back
  { id: "barbell-rows", name: "Barbell Rows", category: "Back", isCompound: true },
  { id: "dumbbell-rows", name: "Dumbbell Rows", category: "Back", isCompound: true },
  { id: "t-bar-rows", name: "T-Bar Rows", category: "Back", isCompound: true },
  { id: "seated-cable-rows", name: "Seated Cable Rows", category: "Back", isCompound: true },
  { id: "lat-pulldowns", name: "Lat Pulldowns", category: "Back", isCompound: true },
  { id: "wide-grip-pulldowns", name: "Wide Grip Pulldowns", category: "Back", isCompound: true },
  { id: "close-grip-pulldowns", name: "Close Grip Pulldowns", category: "Back", isCompound: true },
  { id: "pull-ups", name: "Pull-Ups", category: "Back", isCompound: true },
  { id: "chin-ups", name: "Chin-Ups", category: "Back", isCompound: true },
  { id: "face-pulls", name: "Face Pulls", category: "Back", isCompound: false },
  { id: "straight-arm-pulldowns", name: "Straight Arm Pulldowns", category: "Back", isCompound: false },
  { id: "machine-rows", name: "Machine Rows", category: "Back", isCompound: true },
  { id: "chest-supported-rows", name: "Chest Supported Rows", category: "Back", isCompound: true },
  { id: "hyperextensions", name: "Hyperextensions", category: "Back", isCompound: false },

  // Shoulders
  { id: "overhead-press", name: "Overhead Press (Barbell)", category: "Shoulders", isCompound: true },
  { id: "dumbbell-shoulder-press", name: "Dumbbell Shoulder Press", category: "Shoulders", isCompound: true },
  { id: "seated-dumbbell-press", name: "Seated Dumbbell Press", category: "Shoulders", isCompound: true },
  { id: "arnold-press", name: "Arnold Press", category: "Shoulders", isCompound: true },
  { id: "machine-shoulder-press", name: "Machine Shoulder Press", category: "Shoulders", isCompound: true },
  { id: "lateral-raises", name: "Lateral Raises", category: "Shoulders", isCompound: false },
  { id: "cable-lateral-raises", name: "Cable Lateral Raises", category: "Shoulders", isCompound: false },
  { id: "front-raises", name: "Front Raises", category: "Shoulders", isCompound: false },
  { id: "rear-delt-flyes", name: "Rear Delt Flyes", category: "Shoulders", isCompound: false },
  { id: "reverse-pec-deck", name: "Reverse Pec Deck", category: "Shoulders", isCompound: false },
  { id: "upright-rows", name: "Upright Rows", category: "Shoulders", isCompound: true },
  { id: "shrugs", name: "Shrugs", category: "Shoulders", isCompound: false },

  // Legs - Quads
  { id: "barbell-squat", name: "Barbell Squat", category: "Legs - Quads", isCompound: true },
  { id: "front-squat", name: "Front Squat", category: "Legs - Quads", isCompound: true },
  { id: "goblet-squat", name: "Goblet Squat", category: "Legs - Quads", isCompound: true },
  { id: "leg-press", name: "Leg Press", category: "Legs - Quads", isCompound: true },
  { id: "hack-squat", name: "Hack Squat", category: "Legs - Quads", isCompound: true },
  { id: "smith-machine-squat", name: "Smith Machine Squat", category: "Legs - Quads", isCompound: true },
  { id: "leg-extensions", name: "Leg Extensions", category: "Legs - Quads", isCompound: false },
  { id: "lunges", name: "Lunges", category: "Legs - Quads", isCompound: true },
  { id: "walking-lunges", name: "Walking Lunges", category: "Legs - Quads", isCompound: true },
  { id: "bulgarian-split-squat", name: "Bulgarian Split Squat", category: "Legs - Quads", isCompound: true },
  { id: "step-ups", name: "Step Ups", category: "Legs - Quads", isCompound: true },
  { id: "sissy-squat", name: "Sissy Squat", category: "Legs - Quads", isCompound: false },

  // Legs - Hamstrings
  { id: "romanian-deadlift", name: "Romanian Deadlift", category: "Legs - Hamstrings", isCompound: true },
  { id: "stiff-leg-deadlift", name: "Stiff Leg Deadlift", category: "Legs - Hamstrings", isCompound: true },
  { id: "lying-leg-curls", name: "Lying Leg Curls", category: "Legs - Hamstrings", isCompound: false },
  { id: "seated-leg-curls", name: "Seated Leg Curls", category: "Legs - Hamstrings", isCompound: false },
  { id: "nordic-curls", name: "Nordic Curls", category: "Legs - Hamstrings", isCompound: false },
  { id: "good-mornings", name: "Good Mornings", category: "Legs - Hamstrings", isCompound: true },

  // Legs - Glutes
  { id: "hip-thrust", name: "Hip Thrust", category: "Legs - Glutes", isCompound: true },
  { id: "barbell-hip-thrust", name: "Barbell Hip Thrust", category: "Legs - Glutes", isCompound: true },
  { id: "glute-bridge", name: "Glute Bridge", category: "Legs - Glutes", isCompound: false },
  { id: "cable-kickbacks", name: "Cable Kickbacks", category: "Legs - Glutes", isCompound: false },
  { id: "glute-machine", name: "Glute Machine", category: "Legs - Glutes", isCompound: false },

  // Legs - Calves
  { id: "standing-calf-raises", name: "Standing Calf Raises", category: "Legs - Calves", isCompound: false },
  { id: "seated-calf-raises", name: "Seated Calf Raises", category: "Legs - Calves", isCompound: false },
  { id: "leg-press-calf-raises", name: "Leg Press Calf Raises", category: "Legs - Calves", isCompound: false },
  { id: "donkey-calf-raises", name: "Donkey Calf Raises", category: "Legs - Calves", isCompound: false },

  // Biceps
  { id: "barbell-curls", name: "Barbell Curls", category: "Biceps", isCompound: false },
  { id: "ez-bar-curls", name: "EZ Bar Curls", category: "Biceps", isCompound: false },
  { id: "dumbbell-curls", name: "Dumbbell Curls", category: "Biceps", isCompound: false },
  { id: "hammer-curls", name: "Hammer Curls", category: "Biceps", isCompound: false },
  { id: "incline-dumbbell-curls", name: "Incline Dumbbell Curls", category: "Biceps", isCompound: false },
  { id: "preacher-curls", name: "Preacher Curls", category: "Biceps", isCompound: false },
  { id: "cable-curls", name: "Cable Curls", category: "Biceps", isCompound: false },
  { id: "concentration-curls", name: "Concentration Curls", category: "Biceps", isCompound: false },
  { id: "spider-curls", name: "Spider Curls", category: "Biceps", isCompound: false },

  // Triceps
  { id: "close-grip-bench", name: "Close Grip Bench Press", category: "Triceps", isCompound: true },
  { id: "tricep-dips", name: "Tricep Dips", category: "Triceps", isCompound: true },
  { id: "skull-crushers", name: "Skull Crushers", category: "Triceps", isCompound: false },
  { id: "overhead-tricep-extension", name: "Overhead Tricep Extension", category: "Triceps", isCompound: false },
  { id: "cable-pushdowns", name: "Cable Pushdowns", category: "Triceps", isCompound: false },
  { id: "rope-pushdowns", name: "Rope Pushdowns", category: "Triceps", isCompound: false },
  { id: "tricep-kickbacks", name: "Tricep Kickbacks", category: "Triceps", isCompound: false },
  { id: "diamond-push-ups", name: "Diamond Push-Ups", category: "Triceps", isCompound: true },

  // Core
  { id: "planks", name: "Planks", category: "Core", isCompound: false },
  { id: "crunches", name: "Crunches", category: "Core", isCompound: false },
  { id: "hanging-leg-raises", name: "Hanging Leg Raises", category: "Core", isCompound: false },
  { id: "cable-crunches", name: "Cable Crunches", category: "Core", isCompound: false },
  { id: "russian-twists", name: "Russian Twists", category: "Core", isCompound: false },
  { id: "ab-wheel", name: "Ab Wheel Rollout", category: "Core", isCompound: false },
  { id: "dead-bug", name: "Dead Bug", category: "Core", isCompound: false },

  // Full Body / Other
  { id: "deadlift", name: "Deadlift", category: "Full Body", isCompound: true },
  { id: "sumo-deadlift", name: "Sumo Deadlift", category: "Full Body", isCompound: true },
  { id: "trap-bar-deadlift", name: "Trap Bar Deadlift", category: "Full Body", isCompound: true },
  { id: "clean-and-press", name: "Clean and Press", category: "Full Body", isCompound: true },
  { id: "kettlebell-swings", name: "Kettlebell Swings", category: "Full Body", isCompound: true },
  { id: "farmers-walk", name: "Farmer's Walk", category: "Full Body", isCompound: true },
  { id: "burpees", name: "Burpees", category: "Full Body", isCompound: true },
];

// Get exercises by category
export function getExercisesByCategory(category: string): LibraryExercise[] {
  return exerciseLibrary.filter(e => e.category === category);
}

// Get all categories with their exercises
export function getExercisesGroupedByCategory(): Record<string, LibraryExercise[]> {
  const grouped: Record<string, LibraryExercise[]> = {};
  for (const category of exerciseCategories) {
    grouped[category] = getExercisesByCategory(category);
  }
  return grouped;
}

// Find an exercise by ID
export function getLibraryExerciseById(id: string): LibraryExercise | undefined {
  return exerciseLibrary.find(e => e.id === id);
}
