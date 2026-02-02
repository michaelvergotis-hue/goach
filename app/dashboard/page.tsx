"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  getWorkoutSessionStatuses,
  setWorkoutSessionStatus,
  revertWorkoutSessionStatus,
  getWorkoutHistory,
  HistoryEntry,
  ExerciseLog,
} from "@/lib/storage";
import { getPhase } from "@/lib/program";
import { getFriendById, Friend } from "@/lib/friends";
import { NotificationToggle } from "@/components/NotificationToggle";
import { SupplementCard } from "@/components/SupplementCard";
import { PRCard } from "@/components/PRCard";
import {
  ProgramTab,
  FeedTab,
  HistoryTab,
  ShareWorkoutModal,
  FeedPost,
  Group,
  WorkoutInfo,
} from "@/components/dashboard";

type TabType = "program" | "feed" | "history";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [friend, setFriend] = useState<Friend | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("program");

  // Program tab state
  const [selectedPhase, setSelectedPhase] = useState("1");
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [sessionStatuses, setSessionStatuses] = useState<Record<string, { status: string; date: string }>>({});
  const [showProgramSelector, setShowProgramSelector] = useState(false);

  // Share workout state
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharingWorkout, setSharingWorkout] = useState<WorkoutInfo | null>(null);
  const [shareSelectedGroups, setShareSelectedGroups] = useState<number[]>([]);
  const [isShareSending, setIsShareSending] = useState(false);

  // Feed state
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Feed post expansion
  const [expandedFeedPost, setExpandedFeedPost] = useState<number | null>(null);
  const [feedPostDetails, setFeedPostDetails] = useState<ExerciseLog[] | null>(null);
  const [loadingFeedDetails, setLoadingFeedDetails] = useState(false);

  // History state
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [expandedHistoryKey, setExpandedHistoryKey] = useState<string | null>(null);
  const [historyDetails, setHistoryDetails] = useState<ExerciseLog[] | null>(null);
  const [loadingHistoryDetails, setLoadingHistoryDetails] = useState(false);
  const [historyPhase, setHistoryPhase] = useState<string | "all">("all");
  const [historyWeek, setHistoryWeek] = useState<number | "all">("all");

  // Initial data load
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
      const [statusData, historyData] = await Promise.all([
        getWorkoutSessionStatuses(userId!),
        getWorkoutHistory(userId!),
      ]);
      setSessionStatuses(statusData);
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

  // Fetch posts when group/tab changes
  useEffect(() => {
    if (selectedGroup && activeTab === "feed") {
      fetchPosts(selectedGroup);
      const interval = setInterval(() => fetchPosts(selectedGroup), 10000);
      return () => clearInterval(interval);
    }
  }, [selectedGroup, activeTab]);

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

  // Handlers
  const handleLogout = () => signOut({ callbackUrl: "/" });

  const handleMarkMissed = async (day: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!friend) return;

    const key = `p${selectedPhase}-w${selectedWeek}-d${day}`;
    const success = await setWorkoutSessionStatus(friend.id, key, "missed");
    if (success) {
      setSessionStatuses(prev => ({
        ...prev,
        [key]: { status: "missed", date: new Date().toISOString().split("T")[0] }
      }));
    }
  };

  const handleRevertWorkout = async (day: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!friend) return;

    const key = `p${selectedPhase}-w${selectedWeek}-d${day}`;
    const success = await revertWorkoutSessionStatus(friend.id, key);
    if (success) {
      setSessionStatuses(prev => {
        const newStatuses = { ...prev };
        delete newStatuses[key];
        return newStatuses;
      });
    }
  };

  const handleOpenShareModal = (day: string, workout: { name: string; focus: string; exercises: { id: string }[] }, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSharingWorkout({ day, workout });
    setShareSelectedGroups([]);
    setShowShareModal(true);
  };

  const handleShareWorkout = async () => {
    if (!sharingWorkout || !friend || shareSelectedGroups.length === 0) return;

    setIsShareSending(true);
    const dayKey = `p${selectedPhase}-w${selectedWeek}-d${sharingWorkout.day}`;
    const phaseInfo = getPhase(selectedPhase);

    try {
      for (const groupId of shareSelectedGroups) {
        await fetch("/api/feed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            groupId,
            userId: friend.id,
            postType: "workout",
            content: {
              workoutName: sharingWorkout.workout.name,
              exerciseCount: sharingWorkout.workout.exercises.length,
              phase: phaseInfo?.name || `Phase ${selectedPhase}`,
              week: `Week ${selectedWeek}`,
              day: dayKey,
            },
          }),
        });
      }
      setShowShareModal(false);
      setSharingWorkout(null);
    } catch (error) {
      console.error("Error sharing workout:", error);
    } finally {
      setIsShareSending(false);
    }
  };

  const toggleShareGroup = (groupId: number) => {
    setShareSelectedGroups(prev =>
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    );
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

  const toggleFeedPostDetails = async (post: FeedPost) => {
    if (post.post_type !== "workout" || !post.content.day) return;

    if (expandedFeedPost === post.id) {
      setExpandedFeedPost(null);
      setFeedPostDetails(null);
      return;
    }

    setExpandedFeedPost(post.id);
    setLoadingFeedDetails(true);
    setFeedPostDetails(null);

    try {
      const postDate = post.created_at.split("T")[0];
      const response = await fetch(
        `/api/logs?userId=${encodeURIComponent(post.user_id)}&day=${encodeURIComponent(post.content.day)}&date=${postDate}`
      );
      if (response.ok) {
        const data = await response.json();
        const exercises: ExerciseLog[] = data.map((row: {
          exercise_id: string;
          sets: string | { weight: number; reps: number }[];
          notes: string;
          completed_at: string;
        }) => ({
          exerciseId: row.exercise_id,
          sets: typeof row.sets === "string" ? JSON.parse(row.sets) : row.sets,
          notes: row.notes || "",
          completedAt: row.completed_at,
        }));
        setFeedPostDetails(exercises);
      }
    } catch (error) {
      console.error("Error fetching feed post details:", error);
    } finally {
      setLoadingFeedDetails(false);
    }
  };

  const toggleHistoryDetails = async (entry: HistoryEntry) => {
    const key = `${entry.day}-${entry.date}`;

    if (expandedHistoryKey === key) {
      setExpandedHistoryKey(null);
      setHistoryDetails(null);
      return;
    }

    setExpandedHistoryKey(key);
    setLoadingHistoryDetails(true);
    setHistoryDetails(null);

    try {
      const response = await fetch(
        `/api/logs?userId=${encodeURIComponent(friend!.id)}&day=${encodeURIComponent(entry.day)}&date=${entry.date}`
      );
      if (response.ok) {
        const data = await response.json();
        const exercises: ExerciseLog[] = data.map((row: {
          exercise_id: string;
          sets: string | { weight: number; reps: number }[];
          notes: string;
          completed_at: string;
        }) => ({
          exerciseId: row.exercise_id,
          sets: typeof row.sets === "string" ? JSON.parse(row.sets) : row.sets,
          notes: row.notes || "",
          completedAt: row.completed_at,
        }));
        setHistoryDetails(exercises);
      }
    } catch (error) {
      console.error("Error fetching history details:", error);
    } finally {
      setLoadingHistoryDetails(false);
    }
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
        <div className={`flex-1 ${activeTab === "program" ? "lg:grid lg:grid-cols-12 lg:gap-6" : ""}`}>
          {/* Main Content */}
          <div className={`flex flex-col min-h-0 ${activeTab === "program" ? "lg:col-span-8" : ""}`}>
            {activeTab === "program" && (
              <ProgramTab
                selectedPhase={selectedPhase}
                selectedWeek={selectedWeek}
                setSelectedPhase={setSelectedPhase}
                setSelectedWeek={setSelectedWeek}
                showProgramSelector={showProgramSelector}
                setShowProgramSelector={setShowProgramSelector}
                sessionStatuses={sessionStatuses}
                groups={groups}
                onMarkMissed={handleMarkMissed}
                onRevert={handleRevertWorkout}
                onShare={handleOpenShareModal}
              />
            )}

            {activeTab === "feed" && (
              <FeedTab
                groups={groups}
                selectedGroup={selectedGroup}
                setSelectedGroup={setSelectedGroup}
                posts={posts}
                message={message}
                setMessage={setMessage}
                onSendMessage={handleSendMessage}
                isSending={isSending}
                currentUserId={friend.id}
                expandedPostId={expandedFeedPost}
                onTogglePostExpand={toggleFeedPostDetails}
                postDetails={feedPostDetails}
                isLoadingDetails={loadingFeedDetails}
              />
            )}

            {activeTab === "history" && (
              <HistoryTab
                history={history}
                historyPhase={historyPhase}
                historyWeek={historyWeek}
                setHistoryPhase={setHistoryPhase}
                setHistoryWeek={setHistoryWeek}
                expandedKey={expandedHistoryKey}
                historyDetails={historyDetails}
                loadingDetails={loadingHistoryDetails}
                onToggleDetails={toggleHistoryDetails}
                onSwitchToProgram={() => setActiveTab("program")}
              />
            )}
          </div>

          {/* Sidebar - Desktop only, Program tab only */}
          {activeTab === "program" && (
            <div className="lg:col-span-4 hidden lg:flex lg:flex-col">
              <div className="flex flex-col gap-4 h-full">
                <SupplementCard userId={friend.id} />
                <div className="p-4 bg-card rounded-2xl border border-border">
                  <h3 className="font-semibold mb-3 text-foreground">Notifications</h3>
                  <NotificationToggle userId={friend.id} />
                </div>
                <div className="flex-1">
                  <PRCard userId={friend.id} className="h-full" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Sidebar - Only on Program tab */}
        {activeTab === "program" && (
          <div className="lg:hidden mt-8 space-y-4">
            <SupplementCard userId={friend.id} />
            <div className="p-4 bg-card rounded-2xl border border-border">
              <h3 className="font-semibold mb-3 text-foreground">Notifications</h3>
              <NotificationToggle userId={friend.id} />
            </div>
            <PRCard userId={friend.id} />
          </div>
        )}
      </main>

      {/* Share Workout Modal */}
      <ShareWorkoutModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        workout={sharingWorkout}
        groups={groups}
        selectedGroups={shareSelectedGroups}
        onToggleGroup={toggleShareGroup}
        onShare={handleShareWorkout}
        isSharing={isShareSending}
      />
    </div>
  );
}
