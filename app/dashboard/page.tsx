"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  getDayCompletionStatus,
  getWorkoutHistory,
  HistoryEntry,
} from "@/lib/storage";
import { getAllPhases, getPhaseWorkouts, getWorkoutDay, getPhase } from "@/lib/program";
import { getFriendById, Friend, friends } from "@/lib/friends";
import { NotificationToggle } from "@/components/NotificationToggle";
import { SupplementCard } from "@/components/SupplementCard";

type TabType = "program" | "feed" | "history";

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

function parseDayKey(dayKey: string): { phase: string; week: string; day: string } | null {
  const match = dayKey.match(/^p(\d+)-w(\d+)-d(\d+)$/);
  if (!match) {
    return { phase: "1", week: "1", day: dayKey };
  }
  return { phase: match[1], week: match[2], day: match[3] };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [friend, setFriend] = useState<Friend | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("program");

  const [selectedPhase, setSelectedPhase] = useState("1");
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [completionStatus, setCompletionStatus] = useState<Record<string, boolean>>({});
  const [showProgramSelector, setShowProgramSelector] = useState(false);

  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const phases = getAllPhases();
  const currentPhase = phases.find(p => p.id === selectedPhase);
  const workouts = getPhaseWorkouts(selectedPhase);

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

    async function loadData() {
      const [completionData, historyData] = await Promise.all([
        getDayCompletionStatus(userId!),
        getWorkoutHistory(userId!),
      ]);
      setCompletionStatus(completionData);
      setHistory(historyData);

      try {
        const response = await fetch(`/api/groups?userId=${encodeURIComponent(userId!)}`);
        if (response.ok) {
          const groupsData = await response.json();
          setGroups(groupsData);
          if (groupsData.length > 0) {
            setSelectedGroup(groupsData[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
      }

      setIsLoading(false);
    }

    loadData();
  }, [status, session, router]);

  useEffect(() => {
    if (selectedGroup && activeTab === "feed") {
      fetchPosts(selectedGroup);
      const interval = setInterval(() => fetchPosts(selectedGroup), 10000);
      return () => clearInterval(interval);
    }
  }, [selectedGroup, activeTab]);

  useEffect(() => {
    if (activeTab === "feed") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [posts, activeTab]);

  const fetchPosts = async (groupId: number) => {
    try {
      const response = await fetch(`/api/feed?groupId=${groupId}`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.reverse());
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

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  const isDayComplete = (day: string) => {
    const key = `p${selectedPhase}-w${selectedWeek}-d${day}`;
    return completionStatus[key] === true;
  };

  const completedDaysInWeek = workouts.filter(w => isDayComplete(w.day)).length;

  const totalWeeks = phases.reduce((acc, p) => acc + p.phase.weeks, 0);
  const currentWeekNumber = phases
    .slice(0, parseInt(selectedPhase) - 1)
    .reduce((acc, p) => acc + p.phase.weeks, 0) + selectedWeek;

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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split("T")[0]) return "Today";
    if (dateStr === yesterday.toISOString().split("T")[0]) return "Yesterday";

    return date.toLocaleDateString("en-AU", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const getUserName = (userId: string) => friends.find(f => f.id === userId)?.name || userId;
  const getUserInitials = (userId: string) => friends.find(f => f.id === userId)?.initials || "?";

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
            {!isOwnPost && <p className="text-xs text-muted mb-1">{userName}</p>}
            <div className={`px-3 py-2 rounded-2xl ${isOwnPost ? "bg-accent text-white rounded-br-sm" : "bg-card border border-border rounded-bl-sm"}`}>
              <p className="text-sm">{post.content.message}</p>
            </div>
            <p className={`text-xs text-muted mt-1 ${isOwnPost ? "text-right" : ""}`}>{formatTime(post.created_at)}</p>
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
              <p className="text-sm"><span className="font-semibold">{userName}</span> completed <span className="font-semibold">{post.content.workoutName}</span></p>
              <p className="text-xs text-muted mt-1">{post.content.exerciseCount} exercises</p>
            </div>
            <p className="text-xs text-muted mt-1">{formatTime(post.created_at)}</p>
          </div>
        </div>
      );
    }

    if (post.post_type === "pr") {
      return (
        <div className="flex gap-2">
          <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center text-accent text-xs flex-shrink-0">🏆</div>
          <div className="flex-1">
            <div className="bg-accent/10 border border-accent/20 rounded-xl p-3">
              <p className="text-sm"><span className="font-semibold">{userName}</span> hit a PR!</p>
              <p className="text-sm font-semibold text-accent mt-1">{post.content.exerciseName}: {post.content.weight}kg × {post.content.reps}</p>
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-accent to-accent/60 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-accent/20">
              {friend.initials}
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wider font-medium">Welcome back</p>
              <h1 className="text-lg font-bold text-foreground">{friend.name}</h1>
            </div>
          </div>
          <button onClick={handleLogout} className="text-sm text-muted hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-card">
            Logout
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="px-5 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-1 p-1 bg-card rounded-xl">
          <button onClick={() => setActiveTab("program")} className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${activeTab === "program" ? "bg-accent text-white shadow-sm" : "text-muted hover:text-foreground"}`}>
            Program
          </button>
          <button onClick={() => setActiveTab("feed")} className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${activeTab === "feed" ? "bg-accent text-white shadow-sm" : "text-muted hover:text-foreground"}`}>
            Feed
          </button>
          <button onClick={() => setActiveTab("history")} className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${activeTab === "history" ? "bg-accent text-white shadow-sm" : "text-muted hover:text-foreground"}`}>
            History
          </button>
          {friend.isAdmin && (
            <Link href="/admin" className="flex-1 py-2.5 px-4 rounded-lg font-medium text-sm text-muted hover:text-foreground text-center transition-all">
              Admin
            </Link>
          )}
        </div>
      </div>

      {/* Content Area */}
      <main className="flex-1 flex flex-col px-5 py-6 max-w-6xl mx-auto w-full">
        <div className="lg:grid lg:grid-cols-12 lg:gap-6 flex-1">
          {/* Main Content */}
          <div className="lg:col-span-8 flex flex-col min-h-0">
            {/* PROGRAM TAB */}
            {activeTab === "program" && (
              <div className="flex flex-col">
                {/* Program Selector */}
                <div className="mb-6">
                  <button onClick={() => setShowProgramSelector(!showProgramSelector)} className="w-full group">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border hover:border-accent/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                          <span className="text-2xl font-bold text-accent">{selectedPhase}</span>
                        </div>
                        <div className="text-left">
                          <p className="text-xs text-muted uppercase tracking-wider">Current Program</p>
                          <h2 className="text-lg font-bold text-foreground">
                            {currentPhase?.phase.name} <span className="text-muted font-normal">·</span> <span className="text-accent">Week {selectedWeek}</span>
                          </h2>
                          <p className="text-sm text-muted">{currentPhase?.phase.description} Focus</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-muted">Progress</p>
                          <p className="text-sm font-semibold text-foreground">Week {currentWeekNumber}/{totalWeeks}</p>
                        </div>
                        <svg className={`w-5 h-5 text-muted transition-transform ${showProgramSelector ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </button>

                  {showProgramSelector && (
                    <div className="mt-3 p-4 rounded-2xl bg-card border border-border">
                      <div className="mb-4">
                        <p className="text-xs text-muted uppercase tracking-wider mb-3 px-1">Select Phase</p>
                        <div className="grid grid-cols-3 gap-2">
                          {phases.map(({ id, phase }) => (
                            <button
                              key={id}
                              onClick={() => { setSelectedPhase(id); setSelectedWeek(1); }}
                              className={`p-3 rounded-xl text-center transition-all ${selectedPhase === id ? "bg-accent text-white shadow-lg shadow-accent/25" : "bg-background hover:bg-card-hover border border-border"}`}
                            >
                              <span className="text-2xl font-bold block">{id}</span>
                              <span className={`text-xs ${selectedPhase === id ? 'text-white/80' : 'text-muted'}`}>{phase.description}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted uppercase tracking-wider mb-3 px-1">Select Week</p>
                        <div className="grid grid-cols-4 gap-2">
                          {currentPhase && Array.from({ length: currentPhase.phase.weeks }, (_, i) => i + 1).map((week) => (
                            <button
                              key={week}
                              onClick={() => { setSelectedWeek(week); setShowProgramSelector(false); }}
                              className={`py-3 px-4 rounded-xl font-semibold transition-all ${selectedWeek === week ? "bg-accent/20 text-accent border-2 border-accent" : "bg-background hover:bg-card-hover border border-border text-foreground"}`}
                            >
                              {week}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Week Header */}
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">This Week</h3>
                    <p className="text-sm text-muted">{completedDaysInWeek} of {workouts.length} workouts complete</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {workouts.map((_, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i < completedDaysInWeek ? 'bg-accent' : 'bg-border'}`} />
                    ))}
                  </div>
                </div>

                {/* Workout Cards */}
                <div className="space-y-3">
                  {workouts.map(({ day, workout }) => {
                    const isComplete = isDayComplete(day);
                    return (
                      <Link
                        key={day}
                        href={`/workout/${selectedPhase}/${selectedWeek}/${day}`}
                        className={`group block rounded-2xl transition-all duration-200 ${isComplete ? "bg-success/5 hover:bg-success/10" : "bg-card hover:bg-card-hover"}`}
                      >
                        <div className="p-4 flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${isComplete ? 'bg-success/20' : 'bg-background group-hover:bg-accent/10'}`}>
                            {isComplete ? (
                              <svg className="w-7 h-7 text-success" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <span className="text-2xl font-bold text-muted group-hover:text-accent transition-colors">{day}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-semibold text-base ${isComplete ? 'text-success' : 'text-foreground'}`}>
                              {workout.focus.split('(')[0].trim()}
                            </h4>
                            <p className="text-sm text-muted truncate">
                              {workout.focus.includes('(') ? workout.focus.match(/\((.*?)\)/)?.[1] : workout.focus}
                            </p>
                            <p className="text-xs text-muted mt-1">{workout.exercises.length} exercises</p>
                          </div>
                          <svg className={`w-5 h-5 flex-shrink-0 transition-all ${isComplete ? 'text-success' : 'text-muted group-hover:text-accent group-hover:translate-x-1'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* FEED TAB */}
            {activeTab === "feed" && (
              <div className="flex-1 flex flex-col min-h-[400px]">
                {groups.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-muted mb-2">You&apos;re not in any groups yet</p>
                      <p className="text-sm text-muted">Ask the admin to add you to a group</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {groups.length > 1 && (
                      <div className="pb-3 border-b border-border mb-4">
                        <div className="flex gap-2 overflow-x-auto">
                          {groups.map((group) => (
                            <button
                              key={group.id}
                              onClick={() => setSelectedGroup(group.id)}
                              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedGroup === group.id ? "bg-accent text-white" : "bg-card text-muted hover:bg-card-hover"}`}
                            >
                              {group.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex-1 overflow-y-auto">
                      <div className="space-y-4">
                        {posts.length === 0 ? (
                          <div className="text-center py-12">
                            <p className="text-muted">No messages yet</p>
                            <p className="text-sm text-muted mt-1">Start the conversation!</p>
                          </div>
                        ) : (
                          posts.map((post) => <div key={post.id}>{renderPost(post)}</div>)
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    </div>

                    <div className="border-t border-border pt-4 mt-4">
                      <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                          type="text"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Type a message..."
                          className="flex-1 bg-card border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-accent"
                        />
                        <button type="submit" disabled={isSending || !message.trim()} className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-full transition-colors disabled:opacity-50">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </button>
                      </form>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* HISTORY TAB */}
            {activeTab === "history" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold">Workout History</h2>
                  <p className="text-muted mt-1">Your past sessions</p>
                </div>

                {history.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted">No workouts logged yet</p>
                    <button onClick={() => setActiveTab("program")} className="inline-block mt-4 text-accent hover:underline">
                      Start your first workout
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {history.map((entry, index) => {
                      const parsed = parseDayKey(entry.day);
                      const workout = parsed ? getWorkoutDay(parsed.phase, parsed.day) : null;
                      const phase = parsed ? getPhase(parsed.phase) : null;
                      return (
                        <div key={`${entry.day}-${entry.date}-${index}`} className="bg-card border border-border rounded-2xl p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted">{formatDate(entry.date)}</p>
                              {parsed && phase && <p className="text-xs text-accent mt-1">{phase.name} - Week {parsed.week}</p>}
                              <h3 className="font-semibold text-lg mt-1">{workout?.name || `Day ${parsed?.day || entry.day}`}</h3>
                              <p className="text-sm text-muted">{workout?.focus || "Workout"}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-accent">{entry.exercises_logged}</p>
                              <p className="text-xs text-muted">exercises</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Desktop only */}
          <div className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-6 space-y-4">
              <SupplementCard userId={friend.id} />
              <div className="p-4 bg-card rounded-2xl border border-border">
                <h3 className="font-semibold mb-3 text-foreground">Notifications</h3>
                <NotificationToggle userId={friend.id} />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar - Only on Program tab */}
        {activeTab === "program" && (
          <div className="lg:hidden mt-8 space-y-4">
            <SupplementCard userId={friend.id} />
            <div className="p-4 bg-card rounded-2xl border border-border">
              <h3 className="font-semibold mb-3 text-foreground">Notifications</h3>
              <NotificationToggle userId={friend.id} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
