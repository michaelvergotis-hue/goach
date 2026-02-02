"use client";

import { useRef, useEffect } from "react";
import { FeedPost, Group } from "./types";
import { FeedPostItem } from "./FeedPostItem";
import { ExerciseLog } from "@/lib/storage";
import { friends } from "@/lib/friends";

interface FeedTabProps {
  groups: Group[];
  selectedGroup: number | null;
  setSelectedGroup: (groupId: number) => void;
  posts: FeedPost[];
  message: string;
  setMessage: (message: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  isSending: boolean;
  currentUserId: string;
  expandedPostId: number | null;
  onTogglePostExpand: (post: FeedPost) => void;
  postDetails: ExerciseLog[] | null;
  isLoadingDetails: boolean;
}

export function FeedTab({
  groups,
  selectedGroup,
  setSelectedGroup,
  posts,
  message,
  setMessage,
  onSendMessage,
  isSending,
  currentUserId,
  expandedPostId,
  onTogglePostExpand,
  postDetails,
  isLoadingDetails,
}: FeedTabProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [posts]);

  if (groups.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted mb-2">You&apos;re not in any groups yet</p>
          <p className="text-sm text-muted">Ask the admin to add you to a group</p>
        </div>
      </div>
    );
  }

  const currentGroup = groups.find((g) => g.id === selectedGroup);
  const membersList = currentGroup?.members || [];

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[400px]">
      {/* Group selector - only if multiple groups */}
      {groups.length > 1 && (
        <div className="pb-3 border-b border-border mb-4 flex-shrink-0">
          <div className="flex gap-2 overflow-x-auto">
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() => setSelectedGroup(group.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedGroup === group.id
                    ? "bg-accent text-white"
                    : "bg-card text-muted hover:bg-card-hover"
                }`}
              >
                {group.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Group header with members */}
      {currentGroup && (
        <div className="mb-4 p-4 bg-card border border-border rounded-2xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">{currentGroup.name}</h3>
              <p className="text-sm text-muted">
                {membersList.length} member{membersList.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex -space-x-2">
              {membersList.slice(0, 5).map((memberId) => {
                const memberFriend = friends.find((f) => f.id === memberId);
                return (
                  <div
                    key={memberId}
                    className="w-9 h-9 bg-accent/20 border-2 border-card rounded-full flex items-center justify-center text-accent text-xs font-bold"
                    title={memberFriend?.name || memberId}
                  >
                    {memberFriend?.initials || "?"}
                  </div>
                );
              })}
              {membersList.length > 5 && (
                <div className="w-9 h-9 bg-muted/20 border-2 border-card rounded-full flex items-center justify-center text-muted text-xs font-bold">
                  +{membersList.length - 5}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-2">
        <div className="space-y-4 pb-4">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted">No messages yet</p>
              <p className="text-sm text-muted mt-1">Start the conversation!</p>
            </div>
          ) : (
            posts.map((post) => (
              <FeedPostItem
                key={post.id}
                post={post}
                currentUserId={currentUserId}
                isExpanded={expandedPostId === post.id}
                onToggleExpand={() => onTogglePostExpand(post)}
                exerciseDetails={expandedPostId === post.id ? postDetails : null}
                isLoadingDetails={expandedPostId === post.id && isLoadingDetails}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message input */}
      <div className="border-t border-border pt-4 flex-shrink-0">
        <form onSubmit={onSendMessage} className="flex gap-2">
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
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
