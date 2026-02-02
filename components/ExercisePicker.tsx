"use client";

import { useState } from "react";
import {
  exerciseLibrary,
  exerciseCategories,
  LibraryExercise,
} from "@/lib/exerciseLibrary";

interface ExercisePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (exercise: LibraryExercise) => void;
  currentExerciseId?: string;
}

export function ExercisePicker({
  isOpen,
  onClose,
  onSelect,
  currentExerciseId,
}: ExercisePickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const filteredExercises = searchQuery
    ? exerciseLibrary.filter((e) =>
        e.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : selectedCategory
    ? exerciseLibrary.filter((e) => e.category === selectedCategory)
    : [];

  const handleSelect = (exercise: LibraryExercise) => {
    onSelect(exercise);
    onClose();
    setSelectedCategory(null);
    setSearchQuery("");
  };

  const handleClose = () => {
    onClose();
    setSelectedCategory(null);
    setSearchQuery("");
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">
              {selectedCategory ? selectedCategory : "Swap Exercise"}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 text-muted hover:text-foreground transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Search */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value) setSelectedCategory(null);
            }}
            placeholder="Search exercises..."
            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {!selectedCategory && !searchQuery ? (
            // Category selection
            <div className="space-y-2">
              <p className="text-sm text-muted mb-3">Select a category:</p>
              {exerciseCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className="w-full p-3 bg-background border border-border rounded-xl text-left hover:bg-card-hover hover:border-accent/30 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium">{category}</span>
                  <svg
                    className="w-4 h-4 text-muted"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              ))}
            </div>
          ) : (
            // Exercise list
            <div className="space-y-2">
              {selectedCategory && !searchQuery && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="flex items-center gap-2 text-sm text-accent mb-3 hover:underline"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  All categories
                </button>
              )}

              {filteredExercises.length === 0 ? (
                <p className="text-sm text-muted text-center py-8">
                  No exercises found
                </p>
              ) : (
                filteredExercises.map((exercise) => (
                  <button
                    key={exercise.id}
                    onClick={() => handleSelect(exercise)}
                    className={`w-full p-3 border rounded-xl text-left transition-colors flex items-center justify-between ${
                      exercise.id === currentExerciseId
                        ? "bg-accent/10 border-accent"
                        : "bg-background border-border hover:bg-card-hover hover:border-accent/30"
                    }`}
                  >
                    <div>
                      <span className="font-medium">{exercise.name}</span>
                      {searchQuery && (
                        <p className="text-xs text-muted mt-0.5">
                          {exercise.category}
                        </p>
                      )}
                    </div>
                    {exercise.id === currentExerciseId && (
                      <span className="text-xs text-accent font-medium">
                        Current
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
