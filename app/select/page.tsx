"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, setSelectedUser } from "@/lib/storage";
import { friends, Friend } from "@/lib/friends";

export default function SelectFriendPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/");
      return;
    }
    setIsLoading(false);
  }, [router]);

  const handleSelectFriend = (friend: Friend) => {
    if (friend.password) {
      // This profile requires a password
      setSelectedFriend(friend);
      setShowPasswordModal(true);
      setPassword("");
      setError("");
    } else {
      // No password required
      setSelectedUser(friend.id);
      router.push("/dashboard");
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFriend && password === selectedFriend.password) {
      setSelectedUser(selectedFriend.id);
      router.push("/dashboard");
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
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm md:max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Who&apos;s Training?</h1>
          <p className="text-muted mt-2">Select your profile</p>
        </div>

        {/* Friends grid - responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {friends.map((friend) => (
            <button
              key={friend.id}
              onClick={() => handleSelectFriend(friend)}
              className="w-full flex items-center gap-4 bg-card hover:bg-card-hover border border-border rounded-xl p-4 transition-colors"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                friend.isAdmin
                  ? "bg-accent/30 text-accent"
                  : "bg-accent/20 text-accent"
              }`}>
                {friend.initials}
              </div>
              <span className="text-lg font-semibold">{friend.name}</span>
              {friend.isAdmin && (
                <span className="ml-auto px-2 py-0.5 bg-accent/20 text-accent text-xs font-medium rounded-full">
                  Admin
                </span>
              )}
              {friend.password && !friend.isAdmin && (
                <svg className="w-4 h-4 text-muted ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
              {!friend.password && !friend.isAdmin && (
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
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && selectedFriend && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center text-accent font-bold text-xl mx-auto mb-3">
                {selectedFriend.initials}
              </div>
              <h2 className="text-xl font-bold">{selectedFriend.name}</h2>
              <p className="text-muted text-sm mt-1">Enter password to continue</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoFocus
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-center focus:outline-none focus:border-accent"
              />

              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-3 bg-background border border-border rounded-xl font-medium hover:bg-card-hover transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent-hover transition-colors"
                >
                  Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
