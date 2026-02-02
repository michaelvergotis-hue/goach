"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
