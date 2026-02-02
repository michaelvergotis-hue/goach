"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isAuthenticated, setSelectedUser } from "@/lib/storage";
import { friends } from "@/lib/friends";

export default function SelectFriendPage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/");
      return;
    }
    setIsLoading(false);
  }, [router]);

  const handleSelectFriend = (friendId: string) => {
    setSelectedUser(friendId);
    router.push("/dashboard");
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
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Who&apos;s Training?</h1>
          <p className="text-muted mt-2">Select your profile</p>
        </div>

        <div className="space-y-3">
          {/* Admin link for coach */}
          <Link
            href="/admin"
            className="w-full flex items-center gap-4 bg-accent/10 hover:bg-accent/20 border border-accent/30 rounded-xl p-4 transition-colors"
          >
            <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center text-accent">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-accent">Send Reminder</span>
            <svg
              className="w-5 h-5 text-accent ml-auto"
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
          </Link>

          {friends.map((friend) => (
            <button
              key={friend.id}
              onClick={() => handleSelectFriend(friend.id)}
              className="w-full flex items-center gap-4 bg-card hover:bg-card-hover border border-border rounded-xl p-4 transition-colors"
            >
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center text-accent font-bold text-lg">
                {friend.initials}
              </div>
              <span className="text-lg font-semibold">{friend.name}</span>
              <svg
                className="w-5 h-5 text-muted ml-auto"
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
      </div>
    </div>
  );
}
