"use client";

import { useState, useEffect } from "react";
import { subscribeToPush, unsubscribeFromPush, isPushSubscribed, isPushSupported, registerServiceWorker } from "@/lib/push";

interface NotificationToggleProps {
  userId: string;
}

export function NotificationToggle({ userId }: NotificationToggleProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkStatus() {
      try {
        // First check if supported
        const supported = isPushSupported();
        setIsSupported(supported);

        if (!supported) {
          setIsLoading(false);
          return;
        }

        // Register service worker first
        await registerServiceWorker();

        // Check subscription status
        const subscribed = await isPushSubscribed();
        setIsSubscribed(subscribed);
      } catch (err) {
        console.error("Error checking notification status:", err);
        setError("Could not check status");
      }
      setIsLoading(false);
    }

    // Small delay to let the page load
    const timeout = setTimeout(checkStatus, 500);
    return () => clearTimeout(timeout);
  }, []);

  const handleToggle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (isSubscribed) {
        await unsubscribeFromPush();
        setIsSubscribed(false);
      } else {
        const success = await subscribeToPush(userId);
        if (success) {
          setIsSubscribed(true);
        } else {
          setError("Permission denied or failed");
        }
      }
    } catch (err) {
      console.error("Error toggling notifications:", err);
      setError("Something went wrong");
    }
    setIsLoading(false);
  };

  // Not supported - show message
  if (!isLoading && !isSupported) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-card text-muted">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
        Add to Home Screen for notifications
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
          isSubscribed
            ? "bg-success/20 text-success"
            : "bg-card text-muted hover:bg-card-hover"
        }`}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg
            className="w-4 h-4"
            fill={isSubscribed ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        )}
        {isLoading ? "Checking..." : isSubscribed ? "Notifications on" : "Enable notifications"}
      </button>
      {error && <p className="text-xs text-red-400 px-1">{error}</p>}
    </div>
  );
}
