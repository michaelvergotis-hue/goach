"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isAuthenticated } from "@/lib/storage";
import { friends } from "@/lib/friends";

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [title, setTitle] = useState("G.O.A.C.H");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/");
      return;
    }
    setIsLoading(false);
  }, [router]);

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
            href="/select"
            className="flex items-center gap-1 text-muted hover:text-foreground transition-colors"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </Link>
          <h1 className="text-lg font-bold">Send Reminder</h1>
          <div className="w-12" />
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 max-w-2xl mx-auto">
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
      </main>
    </div>
  );
}
