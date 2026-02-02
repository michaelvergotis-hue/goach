"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, setAuthenticated } from "@/lib/storage";

// Change this password or use environment variable in production
const APP_PASSWORD = "goach123";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if already authenticated
    if (isAuthenticated()) {
      router.replace("/dashboard");
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password === APP_PASSWORD) {
      setAuthenticated(true);
      router.replace("/dashboard");
    } else {
      setError("Wrong password");
      setPassword("");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo/Title */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-12 h-12 text-accent"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              {/* Goat head icon */}
              <path d="M18.5 2c-1.5 0-2.5 1-3 2-.5-1-1.5-2-3-2-2 0-3.5 2-3.5 4 0 1 .5 2 1 2.5-.5.5-1 1.5-1 2.5 0 2 1.5 3.5 3.5 3.5h.5v1.5c0 1.5-1 2.5-2 3-.5.5-1 1-1 2 0 1 1 2 2 2h8c1 0 2-1 2-2 0-1-.5-1.5-1-2-1-.5-2-1.5-2-3v-1.5h.5c2 0 3.5-1.5 3.5-3.5 0-1-.5-2-1-2.5.5-.5 1-1.5 1-2.5 0-2-1.5-4-3.5-4zM8 7c-.5 0-1-.5-1-1s.5-1 1-1 1 .5 1 1-.5 1-1 1zm8 0c-.5 0-1-.5-1-1s.5-1 1-1 1 .5 1 1-.5 1-1 1z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-wide">G.O.A.C.H</h1>
          <p className="text-muted mt-2">Where G.O.A.Ts are made</p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoFocus
              className="w-full bg-card border border-border rounded-xl px-4 py-4 text-center text-lg focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-4 rounded-xl transition-colors"
          >
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
}
