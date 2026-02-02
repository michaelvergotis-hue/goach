"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { friends } from "@/lib/friends";

interface Group {
  id: number;
  name: string;
  created_by: string;
  member_count: number;
  members: string[];
}

export default function AdminPage() {
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"reminders" | "groups" | "data">("reminders");

  // Reminders state
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [title, setTitle] = useState("G.O.A.C.H");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // Groups state
  const [groups, setGroups] = useState<Group[]>([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isSavingGroup, setIsSavingGroup] = useState(false);
  const [groupError, setGroupError] = useState<string | null>(null);

  // Data management state
  const [clearDataUser, setClearDataUser] = useState<string>("");
  const [isClearing, setIsClearing] = useState(false);
  const [clearResult, setClearResult] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }
    setIsLoading(false);
    fetchGroups();
  }, [status, router]);

  const fetchGroups = async () => {
    try {
      const response = await fetch("/api/groups?all=true");
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) {
      setResult("Please enter a message");
      return;
    }

    setIsSending(true);
    setResult(null);

    try {
      const response = await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser === "all" ? undefined : selectedUser,
          title,
          message,
          url: "/dashboard",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(`Sent to ${data.sent} device(s)${data.failed ? `, ${data.failed} failed` : ""}`);
        setMessage("");
      } else {
        setResult(data.error || "Failed to send");
      }
    } catch (error) {
      setResult("Error sending notification");
      console.error(error);
    }

    setIsSending(false);
  };

  const handleCreateGroup = () => {
    setEditingGroup(null);
    setGroupName("");
    setSelectedMembers([]);
    setGroupError(null);
    setShowGroupModal(true);
  };

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group);
    setGroupName(group.name);
    setSelectedMembers(group.members || []);
    setShowGroupModal(true);
  };

  const handleSaveGroup = async () => {
    if (!groupName.trim()) return;

    setIsSavingGroup(true);
    setGroupError(null);
    try {
      let response;
      if (editingGroup) {
        // Update members
        response = await fetch("/api/groups", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            groupId: editingGroup.id,
            members: selectedMembers,
          }),
        });
      } else {
        // Create new group
        response = await fetch("/api/groups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: groupName,
            createdBy: "michael-v",
            members: selectedMembers,
          }),
        });
      }

      if (!response.ok) {
        const data = await response.json();
        setGroupError(data.error || "Failed to save group");
        return;
      }

      await fetchGroups();
      setShowGroupModal(false);
    } catch (error) {
      console.error("Error saving group:", error);
      setGroupError("Network error. Please try again.");
    } finally {
      setIsSavingGroup(false);
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    if (!confirm("Delete this group? All messages will be lost.")) return;

    try {
      await fetch(`/api/groups?groupId=${groupId}`, { method: "DELETE" });
      await fetchGroups();
    } catch (error) {
      console.error("Error deleting group:", error);
    }
  };

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleClearData = async () => {
    if (!clearDataUser) {
      setClearResult("Please select a user");
      return;
    }

    if (!confirm(`Clear ALL workout data for ${friends.find(f => f.id === clearDataUser)?.name || clearDataUser}? This cannot be undone.`)) {
      return;
    }

    setIsClearing(true);
    setClearResult(null);

    try {
      const response = await fetch(`/api/clear-data?userId=${encodeURIComponent(clearDataUser)}&type=all`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setClearResult(`Data cleared for ${friends.find(f => f.id === clearDataUser)?.name || clearDataUser}`);
      } else {
        setClearResult(data.error || "Failed to clear data");
      }
    } catch (error) {
      setClearResult("Error clearing data");
      console.error(error);
    }

    setIsClearing(false);
  };

  const quickMessages = [
    "Time to train! Get to the gym!",
    "Rest day is over. Let's go!",
    "Don't skip leg day!",
    "Consistency beats intensity. Show up!",
    "Your future self will thank you. Train now!",
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
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
          <h1 className="text-lg font-bold">Admin</h1>
          <div className="w-12" />
        </div>
      </header>

      {/* Tabs */}
      <div className="px-4 py-4 max-w-2xl mx-auto">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("reminders")}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              activeTab === "reminders"
                ? "bg-accent text-white"
                : "bg-card text-muted hover:bg-card-hover"
            }`}
          >
            Reminders
          </button>
          <button
            onClick={() => setActiveTab("groups")}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              activeTab === "groups"
                ? "bg-accent text-white"
                : "bg-card text-muted hover:bg-card-hover"
            }`}
          >
            Groups
          </button>
          <button
            onClick={() => setActiveTab("data")}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              activeTab === "data"
                ? "bg-accent text-white"
                : "bg-card text-muted hover:bg-card-hover"
            }`}
          >
            Data
          </button>
        </div>

        {/* Reminders Tab */}
        {activeTab === "reminders" && (
          <div>
            {/* Select recipient */}
            <div className="mb-6">
              <label className="block text-sm text-muted mb-2">Send to</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-accent"
              >
                <option value="all">Everyone</option>
                {friends.map((friend) => (
                  <option key={friend.id} value={friend.id}>
                    {friend.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm text-muted mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Notification title"
                className="w-full bg-card border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-accent"
              />
            </div>

            {/* Message */}
            <div className="mb-4">
              <label className="block text-sm text-muted mb-2">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                rows={3}
                className="w-full bg-card border border-border rounded-xl px-4 py-3 resize-none focus:outline-none focus:border-accent"
              />
            </div>

            {/* Quick messages */}
            <div className="mb-6">
              <p className="text-sm text-muted mb-2">Quick messages:</p>
              <div className="flex flex-wrap gap-2">
                {quickMessages.map((msg, i) => (
                  <button
                    key={i}
                    onClick={() => setMessage(msg)}
                    className="px-3 py-1 bg-card border border-border rounded-full text-sm hover:bg-card-hover transition-colors"
                  >
                    {msg.slice(0, 20)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Result message */}
            {result && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${
                result.includes("Sent") ? "bg-success/20 text-success" : "bg-red-500/20 text-red-400"
              }`}>
                {result}
              </div>
            )}

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={isSending || !message.trim()}
              className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isSending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send Notification
                </>
              )}
            </button>
          </div>
        )}

        {/* Groups Tab */}
        {activeTab === "groups" && (
          <div>
            <button
              onClick={handleCreateGroup}
              className="w-full mb-4 py-3 bg-accent hover:bg-accent-hover text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Group
            </button>

            {groups.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted">No groups yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className="bg-card border border-border rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{group.name}</h3>
                        <p className="text-sm text-muted">
                          {group.member_count || 0} member{(group.member_count || 0) !== 1 ? "s" : ""}
                        </p>
                        {group.members && group.members.length > 0 && (
                          <p className="text-xs text-muted mt-1">
                            {group.members
                              .map((id) => friends.find((f) => f.id === id)?.name || id)
                              .join(", ")}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditGroup(group)}
                          className="p-2 text-muted hover:text-foreground transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(group.id)}
                          className="p-2 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Data Tab */}
        {activeTab === "data" && (
          <div>
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold mb-1">Clear Workout Data</h3>
              <p className="text-sm text-muted mb-4">
                Remove all workout logs and completion status for a user. Use this to reset after program changes.
              </p>

              <div className="mb-4">
                <label className="block text-sm text-muted mb-2">Select User</label>
                <select
                  value={clearDataUser}
                  onChange={(e) => setClearDataUser(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-accent"
                >
                  <option value="">Choose a user...</option>
                  {friends.map((friend) => (
                    <option key={friend.id} value={friend.id}>
                      {friend.name}
                    </option>
                  ))}
                </select>
              </div>

              {clearResult && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${
                  clearResult.includes("cleared") ? "bg-success/20 text-success" : "bg-red-500/20 text-red-400"
                }`}>
                  {clearResult}
                </div>
              )}

              <button
                onClick={handleClearData}
                disabled={isClearing || !clearDataUser}
                className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isClearing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear All Data
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingGroup ? "Edit Group" : "Create Group"}
            </h2>

            {!editingGroup && (
              <div className="mb-4">
                <label className="block text-sm text-muted mb-2">Group Name</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g., Gym Bros"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-accent"
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm text-muted mb-2">Members</label>
              <div className="space-y-2">
                {friends.map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => toggleMember(friend.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                      selectedMembers.includes(friend.id)
                        ? "bg-accent/10 border-accent"
                        : "bg-background border-border hover:bg-card-hover"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      selectedMembers.includes(friend.id)
                        ? "bg-accent text-white"
                        : "bg-accent/20 text-accent"
                    }`}>
                      {friend.initials}
                    </div>
                    <span className="flex-1 text-left">{friend.name}</span>
                    {selectedMembers.includes(friend.id) && (
                      <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {groupError && (
              <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded-lg text-sm">
                {groupError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowGroupModal(false)}
                className="flex-1 py-3 bg-background border border-border rounded-xl font-medium hover:bg-card-hover transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveGroup}
                disabled={isSavingGroup || (!editingGroup && !groupName.trim())}
                className="flex-1 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {isSavingGroup ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
