"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { getFriendById, friends, Friend } from "@/lib/friends";
import { Suspense } from "react";

interface FeedPost {
  id: number;
  user_id: string;
  post_type: "workout" | "pr" | "chat";
  content: {
    message?: string;
    workoutName?: string;
    exerciseCount?: number;
    exerciseName?: string;
    weight?: number;
    reps?: number;
    day?: string;
  };
  created_at: string;
}

interface Group {
  id: number;
  name: string;
}

function FeedContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const groupIdParam = searchParams.get("group");

  const [isLoading, setIsLoading] = useState(true);
  const [friend, setFriend] = useState<Friend | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }

    const userId = session?.user?.friendId;
    if (!userId) {
      signOut({ callbackUrl: "/" });
      return;
    }

    const friendData = getFriendById(userId);
    if (!friendData) {
      signOut({ callbackUrl: "/" });
      return;
    }

    setFriend(friendData);
    fetchGroups(userId);
  }, [status, session, router]);

  useEffect(() => {
    if (groupIdParam && groups.length > 0) {
      const groupId = parseInt(groupIdParam);
      if (groups.find(g => g.id === groupId)) {
        setSelectedGroup(groupId);
      }
    } else if (groups.length > 0 && !selectedGroup) {
      setSelectedGroup(groups[0].id);
    }
  }, [groupIdParam, groups, selectedGroup]);

  useEffect(() => {
    if (selectedGroup) {
      fetchPosts(selectedGroup);
      // Poll for new messages every 10 seconds
      const interval = setInterval(() => fetchPosts(selectedGroup), 10000);
      return () => clearInterval(interval);
    }
  }, [selectedGroup]);

  useEffect(() => {
    // Scroll to bottom when posts change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [posts]);

  const fetchGroups = async (userId: string) => {
    try {
      const response = await fetch(`/api/groups?userId=${encodeURIComponent(userId)}`);
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPosts = async (groupId: number) => {
    try {
      const response = await fetch(`/api/feed?groupId=${groupId}`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.reverse()); // Show oldest first
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedGroup || !friend) return;

    setIsSending(true);
    try {
      const response = await fetch("/api/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: selectedGroup,
          userId: friend.id,
          postType: "chat",
          content: { message: message.trim() },
        }),
      });

      if (response.ok) {
        setMessage("");
        fetchPosts(selectedGroup);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
  };

  const getUserName = (userId: string) => {
    const user = friends.find(f => f.id === userId);
    return user?.name || userId;
  };

  const getUserInitials = (userId: string) => {
    const user = friends.find(f => f.id === userId);
    return user?.initials || "?";
  };

  const renderPost = (post: FeedPost) => {
    const isOwnPost = post.user_id === friend?.id;
    const userName = getUserName(post.user_id);
    const initials = getUserInitials(post.user_id);

    if (post.post_type === "chat") {
      return (
        <div className={`flex gap-2 ${isOwnPost ? "flex-row-reverse" : ""}`}>
          <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center text-accent text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className={`max-w-[75%] ${isOwnPost ? "items-end" : ""}`}>
            {!isOwnPost && (
              <p className="text-xs text-muted mb-1">{userName}</p>
            )}
            <div className={`px-3 py-2 rounded-2xl ${
              isOwnPost
                ? "bg-accent text-white rounded-br-sm"
                : "bg-card border border-border rounded-bl-sm"
            }`}>
              <p className="text-sm">{post.content.message}</p>
            </div>
            <p className={`text-xs text-muted mt-1 ${isOwnPost ? "text-right" : ""}`}>
              {formatTime(post.created_at)}
            </p>
          </div>
        </div>
      );
    }

    if (post.post_type === "workout") {
      return (
        <div className="flex gap-2">
          <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center text-success text-xs flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="bg-success/10 border border-success/20 rounded-xl p-3">
              <p className="text-sm">
                <span className="font-semibold">{userName}</span> completed{" "}
                <span className="font-semibold">{post.content.workoutName}</span>
              </p>
              <p className="text-xs text-muted mt-1">
                {post.content.exerciseCount} exercises
              </p>
            </div>
            <p className="text-xs text-muted mt-1">{formatTime(post.created_at)}</p>
          </div>
        </div>
      );
    }

    if (post.post_type === "pr") {
      return (
        <div className="flex gap-2">
          <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center text-accent text-xs flex-shrink-0">
            🏆
          </div>
          <div className="flex-1">
            <div className="bg-accent/10 border border-accent/20 rounded-xl p-3">
              <p className="text-sm">
                <span className="font-semibold">{userName}</span> hit a PR!
              </p>
              <p className="text-sm font-semibold text-accent mt-1">
                {post.content.exerciseName}: {post.content.weight}kg × {post.content.reps}
              </p>
            </div>
            <p className="text-xs text-muted mt-1">{formatTime(post.created_at)}</p>
          </div>
        </div>
      );
    }

    return null;
  };

  if (isLoading || !friend) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 bg-background/80 backdrop-blur-lg border-b border-border z-10">
          <div className="px-4 py-4 max-w-2xl mx-auto flex items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center gap-1 text-muted hover:text-foreground transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Link>
            <h1 className="text-lg font-bold">Feed</h1>
            <div className="w-12" />
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-muted mb-2">You&apos;re not in any groups yet</p>
            <p className="text-sm text-muted">Ask the admin to add you to a group</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg border-b border-border z-10">
        <div className="px-4 py-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-1 text-muted hover:text-foreground transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Link>
            <h1 className="text-lg font-bold">Feed</h1>
            <div className="w-12" />
          </div>

          {/* Group tabs */}
          {groups.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {groups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroup(group.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedGroup === group.id
                      ? "bg-accent text-white"
                      : "bg-card text-muted hover:bg-card-hover"
                  }`}
                >
                  {group.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-4 max-w-2xl mx-auto w-full">
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted">No messages yet</p>
              <p className="text-sm text-muted mt-1">Start the conversation!</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id}>{renderPost(post)}</div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Message input */}
      <div className="sticky bottom-0 bg-background border-t border-border p-4">
        <form onSubmit={handleSendMessage} className="max-w-2xl mx-auto flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-card border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={isSending || !message.trim()}
            className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-full transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

export default function FeedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <FeedContent />
    </Suspense>
  );
}
