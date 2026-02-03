import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthInfo } from "@/lib/server/auth";

export const runtime = "nodejs";

async function requireGroupMemberOrAdmin(sql: ReturnType<typeof getDb>, groupId: number, userId: string, isAdmin: boolean) {
  if (isAdmin) return true;
  const [membership] = await sql`
    SELECT 1 FROM group_members
    WHERE group_id = ${groupId} AND user_id = ${userId}
  `;
  return Boolean(membership);
}

// GET - fetch feed posts for a group
export async function GET(request: NextRequest) {
  const auth = await getAuthInfo();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get("groupId");
  const limitRaw = searchParams.get("limit") || "50";
  const limitParsed = parseInt(limitRaw, 10);
  const limit = Number.isFinite(limitParsed)
    ? Math.min(Math.max(limitParsed, 1), 100)
    : 50;
  const before = searchParams.get("before"); // For pagination

  if (!groupId) {
    return NextResponse.json({ error: "groupId required" }, { status: 400 });
  }

  const sql = getDb();
  const groupIdNum = parseInt(groupId);
  if (!Number.isFinite(groupIdNum)) {
    return NextResponse.json({ error: "Invalid groupId" }, { status: 400 });
  }

  try {
    const allowed = await requireGroupMemberOrAdmin(sql, groupIdNum, auth.userId, auth.isAdmin);
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let posts;
    if (before) {
      if (!Number.isFinite(Date.parse(before))) {
        return NextResponse.json({ error: "Invalid before timestamp" }, { status: 400 });
      }
      posts = await sql`
        SELECT id, user_id, post_type, content, created_at
        FROM feed_posts
        WHERE group_id = ${groupIdNum}
          AND created_at < ${before}::timestamp
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    } else {
      posts = await sql`
        SELECT id, user_id, post_type, content, created_at
        FROM feed_posts
        WHERE group_id = ${groupIdNum}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    }

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching feed:", error);
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
  }
}

// POST - create a new feed post
export async function POST(request: NextRequest) {
  const auth = await getAuthInfo();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { groupId, userId, postType, content } = body;

    if (!groupId || !userId || !postType || !content) {
      return NextResponse.json(
        { error: "groupId, userId, postType, and content required" },
        { status: 400 }
      );
    }

    if (userId !== auth.userId && !auth.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Valid post types: 'workout', 'pr', 'chat'
    if (!['workout', 'pr', 'chat'].includes(postType)) {
      return NextResponse.json({ error: "Invalid post type" }, { status: 400 });
    }

    const sql = getDb();

    const groupIdNum = typeof groupId === "number" ? groupId : parseInt(String(groupId));
    if (!Number.isFinite(groupIdNum)) {
      return NextResponse.json({ error: "Invalid groupId" }, { status: 400 });
    }
    const allowed = await requireGroupMemberOrAdmin(sql, groupIdNum, auth.userId, auth.isAdmin);
    if (!allowed) {
      return NextResponse.json({ error: "User is not a member of this group" }, { status: 403 });
    }

    // Create the post
    const [post] = await sql`
      INSERT INTO feed_posts (group_id, user_id, post_type, content)
      VALUES (${groupIdNum}, ${auth.userId}, ${postType}, ${JSON.stringify(content)})
      RETURNING id, user_id, post_type, content, created_at
    `;

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}

// DELETE - delete a post (own posts only)
export async function DELETE(request: NextRequest) {
  const auth = await getAuthInfo();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("postId");

  if (!postId) {
    return NextResponse.json({ error: "postId required" }, { status: 400 });
  }

  const sql = getDb();
  const postIdNum = parseInt(postId);
  if (!Number.isFinite(postIdNum)) {
    return NextResponse.json({ error: "Invalid postId" }, { status: 400 });
  }

  try {
    // Only delete if the user owns the post
    await sql`
      DELETE FROM feed_posts
      WHERE id = ${postIdNum} AND user_id = ${auth.userId}
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
