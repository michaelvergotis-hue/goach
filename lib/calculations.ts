// 1RM Calculator using the Epley formula
// 1RM = weight × (1 + reps/30)

export function calculate1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  if (reps <= 0 || weight <= 0) return 0;

  // Epley formula
  const oneRepMax = weight * (1 + reps / 30);
  return Math.round(oneRepMax * 10) / 10; // Round to 1 decimal
}

// Calculate suggested weight increase based on performance
export function getSuggestedWeight(
  targetReps: string,
  actualReps: number,
  currentWeight: number
): { suggestion: string; newWeight: number } | null {
  // Parse target reps (e.g., "6-8" -> min: 6, max: 8)
  const [minReps, maxReps] = targetReps.split("-").map(Number);

  if (isNaN(minReps)) return null;

  const targetMax = maxReps || minReps;

  // If hit or exceeded top of rep range, suggest increase
  if (actualReps >= targetMax) {
    const increase = currentWeight >= 40 ? 2.5 : 1.25; // Smaller increases for lighter weights
    return {
      suggestion: `Great work! Try ${currentWeight + increase}kg next time`,
      newWeight: currentWeight + increase,
    };
  }

  // If below minimum reps, suggest staying or decreasing
  if (actualReps < minReps) {
    return {
      suggestion: `Keep at ${currentWeight}kg until you hit ${minReps} reps`,
      newWeight: currentWeight,
    };
  }

  // In range, keep current weight
  return null;
}

// Format weight for display (handles decimals nicely)
export function formatWeight(weight: number): string {
  if (weight % 1 === 0) return weight.toString();
  return weight.toFixed(1);
}
